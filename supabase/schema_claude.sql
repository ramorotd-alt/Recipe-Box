-- Recipe Box — initial database setup (simplified: profiles + recipes only)
-- Run once in the Supabase SQL Editor (Dashboard → SQL → New query → Run).
-- Assumes a fresh project with email auth already enabled.

-- ---------------------------------------------------------------------------
-- Types
-- ---------------------------------------------------------------------------

create type public.recipe_difficulty as enum ('easy', 'medium', 'hard');
create type public.recipe_status as enum ('draft', 'published');

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null unique,
  full_name text not null,
  created_at timestamp not null default now(),
  updated_at timestamp not null default now(),
  constraint username_length check (char_length(username) between 3 and 32),
  constraint username_format check (username ~ '^[a-z0-9_]+$')
);

create table public.recipes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  ingredients text[] not null default '{}',
  instructions text[] not null default '{}',
  cook_time_minutes integer not null default 0 check (cook_time_minutes >= 0),
  difficulty public.recipe_difficulty not null default 'easy',
  category text,
  status public.recipe_status not null default 'draft',
  created_at timestamp not null default now(),
  updated_at timestamp not null default now()
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

create index recipes_user_id_idx on public.recipes (user_id);
create index recipes_status_created_at_idx on public.recipes (status, created_at desc);
create index recipes_category_idx on public.recipes (category);

-- ---------------------------------------------------------------------------
-- updated_at helper
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

create trigger recipes_updated_at
  before update on public.recipes
  for each row execute function public.handle_updated_at();

-- ---------------------------------------------------------------------------
-- Auto-create a profile when a user signs up
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  base_username text;
begin
  base_username := lower(regexp_replace(
    split_part(coalesce(new.email, 'user'), '@', 1),
    '[^a-z0-9_]',
    '',
    'g'
  ));

  if char_length(base_username) < 3 then
    base_username := 'user';
  end if;

  insert into public.profiles (id, username, full_name)
  values (
    new.id,
    left(base_username, 20) || '_' || substr(replace(new.id::text, '-', ''), 1, 8),
    coalesce(
      new.raw_user_meta_data ->> 'display_name',
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

-- profiles
create policy "Profiles are viewable by everyone"
  on public.profiles for select
  to anon, authenticated
  using (true);

create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

grant update (
  username,
  full_name,
  updated_at
) on public.profiles to authenticated;

-- recipes
create policy "Published recipes are public; authors can see their drafts"
  on public.recipes for select
  to anon, authenticated
  using (status = 'published' or user_id = auth.uid());

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
