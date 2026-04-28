/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

create extension if not exists pgcrypto;

-- Create profiles table to extend auth.users
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  last_password_change timestamptz not null default now(),
  mfa_enabled boolean not null default false,
  mfa_type text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_mfa_type_check check (
    (mfa_enabled = false and mfa_type is null)
    or (mfa_enabled = true and mfa_type in ('totp', 'sms', 'email'))
  )
);

-- Create billing_info table
create table if not exists public.billing_info (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  payment_method_last4 text,
  payment_method_brand text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint billing_info_payment_method_last4_check check (
    payment_method_last4 is null or payment_method_last4 ~ '^[0-9]{4}$'
  )
);

-- Create invoices table
create table if not exists public.invoices (
  id text primary key, -- e.g. INV-2026-001
  user_id uuid not null references auth.users(id) on delete cascade,
  amount text not null,
  status text not null,
  date timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint invoices_status_check check (status in ('Paid', 'Pending', 'Failed', 'Refunded', 'Void'))
);

-- Create user_sessions table
create table if not exists public.user_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  device text not null,
  location text not null,
  last_active timestamptz not null default now(),
  is_current boolean not null default false,
  created_at timestamptz not null default now(),
  constraint user_sessions_device_non_empty_check check (length(trim(device)) > 0),
  constraint user_sessions_location_non_empty_check check (length(trim(location)) > 0)
);

-- Performance + data integrity indexes
create unique index if not exists billing_info_user_id_unique_idx
  on public.billing_info (user_id);

create index if not exists invoices_user_id_date_idx
  on public.invoices (user_id, date desc);

create index if not exists user_sessions_user_id_last_active_idx
  on public.user_sessions (user_id, last_active desc);

with ranked_current_sessions as (
  select id,
         row_number() over (
           partition by user_id
           order by last_active desc nulls last, created_at desc, id
         ) as row_num
  from public.user_sessions
  where is_current = true
)
update public.user_sessions as s
set is_current = false
from ranked_current_sessions as r
where s.id = r.id
  and r.row_num > 1;

create unique index if not exists user_sessions_one_current_per_user_idx
  on public.user_sessions (user_id)
  where is_current = true;

-- Canonical plan value lives in auth.users.raw_user_meta_data->>'plan'
create or replace function public.normalize_plan_value(plan_value text)
returns text
language sql
immutable
as $$
  select case lower(coalesce(plan_value, 'free'))
    when 'pro' then 'pro'
    when 'enterprise' then 'enterprise'
    else 'free'
  end;
$$;

-- Keep updated_at columns current
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at
before update on public.profiles
for each row
execute function public.touch_updated_at();

drop trigger if exists billing_info_touch_updated_at on public.billing_info;
create trigger billing_info_touch_updated_at
before update on public.billing_info
for each row
execute function public.touch_updated_at();

-- Normalize auth metadata plan on write to keep plan canonical
create or replace function public.enforce_auth_user_plan_metadata()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.raw_user_meta_data := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  new.raw_user_meta_data := jsonb_set(
    new.raw_user_meta_data,
    '{plan}',
    to_jsonb(public.normalize_plan_value(new.raw_user_meta_data->>'plan'))
  );

  return new;
end;
$$;

drop trigger if exists auth_users_enforce_plan_metadata on auth.users;
create trigger auth_users_enforce_plan_metadata
before insert or update of raw_user_meta_data on auth.users
for each row
execute function public.enforce_auth_user_plan_metadata();

-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.billing_info enable row level security;
alter table public.invoices enable row level security;
alter table public.user_sessions enable row level security;

-- RLS Policies
drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "Users can view own billing_info" on public.billing_info;
create policy "Users can view own billing_info" on public.billing_info for select using (auth.uid() = user_id);

drop policy if exists "Users can view own invoices" on public.invoices;
create policy "Users can view own invoices" on public.invoices for select using (auth.uid() = user_id);

drop policy if exists "Users can view own user_sessions" on public.user_sessions;
create policy "Users can view own user_sessions" on public.user_sessions for select using (auth.uid() = user_id);

-- Restrict table privileges explicitly
revoke all on public.profiles from anon;
revoke all on public.billing_info from anon;
revoke all on public.invoices from anon;
revoke all on public.user_sessions from anon;

revoke all on public.profiles from authenticated;
revoke all on public.billing_info from authenticated;
revoke all on public.invoices from authenticated;
revoke all on public.user_sessions from authenticated;

grant select, insert, update on public.profiles to authenticated;
grant select on public.billing_info to authenticated;
grant select on public.invoices to authenticated;
grant select on public.user_sessions to authenticated;

grant all on public.profiles to service_role;
grant all on public.billing_info to service_role;
grant all on public.invoices to service_role;
grant all on public.user_sessions to service_role;

-- Helper to create profile on signup (optional, but ensures data existence)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name')
  on conflict (id) do update
    set full_name = excluded.full_name,
        updated_at = now();

  insert into public.billing_info (user_id)
  values (new.id)
  on conflict (user_id) do update
    set updated_at = now();

  return new;
end;
$$;

-- Keep profile/billing in sync if auth metadata changes later
create or replace function public.handle_auth_user_metadata_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
begin
  update public.profiles
  set full_name = coalesce(new.raw_user_meta_data->>'full_name', full_name),
      updated_at = now()
  where id = new.id;

  return new;
end;
$$;

-- Trigger for new user
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

drop trigger if exists on_auth_user_updated on auth.users;
create trigger on_auth_user_updated
  after update of raw_user_meta_data on auth.users
  for each row execute procedure public.handle_auth_user_metadata_update();
