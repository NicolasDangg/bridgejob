create extension if not exists pgcrypto;

create table if not exists public.analysis_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  job_data jsonb not null,
  analysis_result jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists analysis_history_user_id_created_at_idx
  on public.analysis_history (user_id, created_at desc);

alter table public.analysis_history enable row level security;

drop policy if exists "Users can read their own analysis history" on public.analysis_history;
drop policy if exists "Users can insert their own analysis history" on public.analysis_history;

create policy "Users can read their own analysis history"
  on public.analysis_history
  for select
  using (auth.uid() = user_id);

create policy "Users can insert their own analysis history"
  on public.analysis_history
  for insert
  with check (auth.uid() = user_id);

grant select, insert on public.analysis_history to authenticated;
