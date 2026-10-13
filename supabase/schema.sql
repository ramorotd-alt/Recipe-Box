-- Recipe Box — start with two tables only
-- Run in the Supabase SQL Editor (Dashboard → SQL → New query → Run).
-- Safe to re-run: this drops the earlier wider schema first if it exists.

drop trigger if exists on_auth_user_created on auth.users;
drop trigger if exists profiles_updated_at on public.profiles;
drop trigger if exists recipes_updated_at on public.recipes;
drop function if exists public.handle_new_user();
drop function if exists public.handle_updated_at();

drop table if exists public.recipe_reports cascade;
drop table if exists public.favorites cascade;
drop table if exists public.recipe_categories cascade;
drop table if exists public.categories cascade;
drop table if exists public.recipe_steps cascade;
drop table if exists public.recipe_ingredients cascade;
drop table if exists public.recipes cascade;
drop table if exists public.profiles cascade;

drop type if exists public.recipe_difficulty;
drop type if exists public.recipe_status;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null unique,
  full_name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- recipes (category is a text column, not a separate table)
-- ---------------------------------------------------------------------------

create table public.recipes (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  description text,
  ingredients text[] not null default '{}',
  cooking_time integer check (cooking_time >= 0),
  difficulty text check (difficulty in ('easy', 'medium', 'hard')),
  category text not null,
  instructions text[] not null default '{}'
);

create index recipes_user_id_idx on public.recipes (user_id);
create index recipes_created_at_idx on public.recipes (created_at desc);

-- ---------------------------------------------------------------------------
-- Keep updated_at current on profile edits
-- ---------------------------------------------------------------------------

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

-- ---------------------------------------------------------------------------
-- Auto-create a profile when someone signs up with email
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username, full_name)
  values (
    new.id,
    'user_' || substr(replace(new.id::text, '-', ''), 1, 12),
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      split_part(coalesce(new.email, 'Cook'), '@', 1)
    )
  );

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

revoke all on function public.handle_new_user() from public;
revoke all on function public.handle_updated_at() from public;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.recipes enable row level security;

create policy "Profiles are viewable by everyone"
  on public.profiles for select
  to anon, authenticated
  using (true);

create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "Recipes are viewable by everyone"
  on public.recipes for select
  to anon, authenticated
  using (true);

create policy "Users can create their own recipes"
  on public.recipes for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "Users can update their own recipes"
  on public.recipes for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Users can delete their own recipes"
  on public.recipes for delete
  to authenticated
  using (user_id = auth.uid());
