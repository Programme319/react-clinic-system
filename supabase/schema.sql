-- Run this in Supabase Dashboard → SQL Editor

-- User profiles (linked to auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text,
  email text,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Patients table
create table if not exists public.patients (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users on delete cascade not null,
  full_name text not null,
  national_id text,
  age integer,
  complaint text,
  diagnosis_text text,
  doctor_name text,
  pharmacist_name text,
  clinic_code text,
  tests jsonb default '[]'::jsonb,
  medications jsonb default '[]'::jsonb,
  created_at timestamptz default now()
);

alter table public.patients enable row level security;

create policy "Users can view own patients"
  on public.patients for select
  using (auth.uid() = user_id);

create policy "Users can insert own patients"
  on public.patients for insert
  with check (auth.uid() = user_id);

create policy "Users can update own patients"
  on public.patients for update
  using (auth.uid() = user_id);

create policy "Users can delete own patients"
  on public.patients for delete
  using (auth.uid() = user_id);

-- Auto-create profile when a user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    new.email
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
