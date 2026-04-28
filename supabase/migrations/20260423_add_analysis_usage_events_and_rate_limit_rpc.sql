create extension if not exists pgcrypto;

create table if not exists public.analysis_usage_events (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null unique,
  user_id uuid references auth.users(id) on delete set null,
  plan text not null default 'free',
  status text not null,
  reason_code text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint analysis_usage_events_plan_check check (plan in ('free', 'pro', 'enterprise')),
  constraint analysis_usage_events_status_check check (
    status in ('allowed', 'blocked_limit', 'validation_failed', 'unauthorized', 'analyze_failed', 'succeeded')
  )
);

create index if not exists analysis_usage_events_user_id_created_at_idx
  on public.analysis_usage_events (user_id, created_at desc);

create index if not exists analysis_usage_events_user_id_status_created_at_idx
  on public.analysis_usage_events (user_id, status, created_at desc);

create or replace function public.set_analysis_usage_events_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists analysis_usage_events_set_updated_at on public.analysis_usage_events;
create trigger analysis_usage_events_set_updated_at
before update on public.analysis_usage_events
for each row
execute function public.set_analysis_usage_events_updated_at();

alter table public.analysis_usage_events enable row level security;

drop policy if exists "Users can read their own analysis usage events" on public.analysis_usage_events;
create policy "Users can read their own analysis usage events"
  on public.analysis_usage_events
  for select
  using (auth.uid() = user_id);

grant select on public.analysis_usage_events to authenticated;

create or replace function public.check_and_log_analysis_attempt(
  p_user_id uuid,
  p_plan text,
  p_request_id uuid
)
returns table (
  allowed boolean,
  used_count integer,
  limit_count integer,
  remaining_count integer,
  reset_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_plan text := lower(coalesce(nullif(trim(p_plan), ''), 'free'));
  v_now timestamptz := now();
  v_window interval := interval '30 days';
  v_limit integer := 3;
  v_used integer := 0;
  v_oldest timestamptz;
  v_reset_at timestamptz;
begin
  if p_user_id is null then
    raise exception 'p_user_id is required';
  end if;

  if p_request_id is null then
    raise exception 'p_request_id is required';
  end if;

  if v_plan not in ('free', 'pro', 'enterprise') then
    v_plan := 'free';
  end if;

  if v_plan in ('pro', 'enterprise') then
    insert into public.analysis_usage_events (request_id, user_id, plan, status, reason_code)
    values (p_request_id, p_user_id, v_plan, 'allowed', 'unlimited_plan');

    return query
    select true, 0::integer, null::integer, null::integer, null::timestamptz;
    return;
  end if;

  select count(*)::integer, min(created_at)
    into v_used, v_oldest
  from public.analysis_usage_events
  where user_id = p_user_id
    and status in ('allowed', 'succeeded', 'analyze_failed')
    and created_at >= (v_now - v_window);

  if v_used >= v_limit then
    v_reset_at := case
      when v_oldest is null then v_now + v_window
      else v_oldest + v_window
    end;

    insert into public.analysis_usage_events (request_id, user_id, plan, status, reason_code, metadata)
    values (
      p_request_id,
      p_user_id,
      v_plan,
      'blocked_limit',
      'free_plan_quota_exhausted',
      jsonb_build_object('used_count', v_used, 'limit_count', v_limit, 'reset_at', v_reset_at)
    );

    return query
    select false, v_used, v_limit, 0::integer, v_reset_at;
    return;
  end if;

  insert into public.analysis_usage_events (request_id, user_id, plan, status, reason_code)
  values (p_request_id, p_user_id, v_plan, 'allowed', 'within_limit');

  v_used := v_used + 1;
  v_reset_at := case
    when v_oldest is null then v_now + v_window
    else v_oldest + v_window
  end;

  return query
  select true, v_used, v_limit, greatest(v_limit - v_used, 0), v_reset_at;
end;
$$;

revoke all on function public.check_and_log_analysis_attempt(uuid, text, uuid) from public;
grant execute on function public.check_and_log_analysis_attempt(uuid, text, uuid) to service_role;
