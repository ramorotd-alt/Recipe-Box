-- Recipe Box — initial database setup
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
  display_name text not null,
  avatar_url text,
  bio text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint username_length check (char_length(username) between 3 and 32),
  constraint username_format check (username ~ '^[a-z0-9_]+$')
);

create table public.recipes (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  description text,
  cover_image_url text,
  prep_time_minutes integer not null default 0 check (prep_time_minutes >= 0),
  cook_time_minutes integer not null default 0 check (cook_time_minutes >= 0),
  servings integer not null default 1 check (servings > 0),
  difficulty public.recipe_difficulty not null default 'easy',
  status public.recipe_status not null default 'draft',
  view_count integer not null default 0 check (view_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.recipe_ingredients (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references public.recipes (id) on delete cascade,
  ingredient_text text not null,
  sort_order integer not null default 0,
  constraint ingredient_text_not_empty check (char_length(trim(ingredient_text)) > 0)
);

create table public.recipe_steps (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references public.recipes (id) on delete cascade,
  step_number integer not null check (step_number > 0),
  instruction_text text not null,
  constraint instruction_text_not_empty check (char_length(trim(instruction_text)) > 0),
  unique (recipe_id, step_number)
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique
);

create table public.recipe_categories (
  recipe_id uuid not null references public.recipes (id) on delete cascade,
  category_id uuid not null references public.categories (id) on delete cascade,
  primary key (recipe_id, category_id)
);

create table public.favorites (
  user_id uuid not null references public.profiles (id) on delete cascade,
  recipe_id uuid not null references public.recipes (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, recipe_id)
);

create table public.recipe_reports (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references public.recipes (id) on delete cascade,
  reporter_id uuid not null references public.profiles (id) on delete cascade,
  reason text not null,
  created_at timestamptz not null default now(),
  constraint reason_not_empty check (char_length(trim(reason)) > 0),
  unique (recipe_id, reporter_id)
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

create index recipes_author_id_idx on public.recipes (author_id);
create index recipes_status_created_at_idx on public.recipes (status, created_at desc);
create index recipes_title_idx on public.recipes (title);
create index recipe_ingredients_recipe_id_idx on public.recipe_ingredients (recipe_id, sort_order);
create index recipe_steps_recipe_id_idx on public.recipe_steps (recipe_id, step_number);
create index recipe_categories_category_id_idx on public.recipe_categories (category_id);
create index favorites_recipe_id_idx on public.favorites (recipe_id);
create index recipe_reports_recipe_id_idx on public.recipe_reports (recipe_id);

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

  insert into public.profiles (id, username, display_name)
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
-- Seed categories (matches the home page filters)
-- ---------------------------------------------------------------------------

insert into public.categories (name)
values
  ('Breakfast'),
  ('Dinner'),
  ('Vegan'),
  ('Italian'),
  ('Dessert'),
  ('Quick');

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.recipes enable row level security;
alter table public.recipe_ingredients enable row level security;
alter table public.recipe_steps enable row level security;
alter table public.categories enable row level security;
alter table public.recipe_categories enable row level security;
alter table public.favorites enable row level security;
alter table public.recipe_reports enable row level security;

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

-- Keep is_admin off-limits to regular users (set it in the dashboard when needed).
revoke update on public.profiles from authenticated;
grant update (
  username,
  display_name,
  avatar_url,
  bio,
  updated_at
) on public.profiles to authenticated;

-- recipes
create policy "Published recipes are public; authors can see their drafts"
  on public.recipes for select
  to anon, authenticated
  using (status = 'published' or author_id = auth.uid());

create policy "Users can create their own recipes"
  on public.recipes for insert
  to authenticated
  with check (author_id = auth.uid());

create policy "Authors can update their own recipes"
  on public.recipes for update
  to authenticated
  using (author_id = auth.uid())
  with check (author_id = auth.uid());

create policy "Authors can delete their own recipes"
  on public.recipes for delete
  to authenticated
  using (author_id = auth.uid());

-- recipe_ingredients
create policy "Ingredients follow recipe visibility"
  on public.recipe_ingredients for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.recipes
      where recipes.id = recipe_ingredients.recipe_id
        and (recipes.status = 'published' or recipes.author_id = auth.uid())
    )
  );

create policy "Authors can add ingredients"
  on public.recipe_ingredients for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.recipes
      where recipes.id = recipe_ingredients.recipe_id
        and recipes.author_id = auth.uid()
    )
  );

create policy "Authors can update ingredients"
  on public.recipe_ingredients for update
  to authenticated
  using (
    exists (
      select 1
      from public.recipes
      where recipes.id = recipe_ingredients.recipe_id
        and recipes.author_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.recipes
      where recipes.id = recipe_ingredients.recipe_id
        and recipes.author_id = auth.uid()
    )
  );

create policy "Authors can delete ingredients"
  on public.recipe_ingredients for delete
  to authenticated
  using (
    exists (
      select 1
      from public.recipes
      where recipes.id = recipe_ingredients.recipe_id
        and recipes.author_id = auth.uid()
    )
  );

-- recipe_steps
create policy "Steps follow recipe visibility"
  on public.recipe_steps for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.recipes
      where recipes.id = recipe_steps.recipe_id
        and (recipes.status = 'published' or recipes.author_id = auth.uid())
    )
  );

create policy "Authors can add steps"
  on public.recipe_steps for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.recipes
      where recipes.id = recipe_steps.recipe_id
        and recipes.author_id = auth.uid()
    )
  );

create policy "Authors can update steps"
  on public.recipe_steps for update
  to authenticated
  using (
    exists (
      select 1
      from public.recipes
      where recipes.id = recipe_steps.recipe_id
        and recipes.author_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.recipes
      where recipes.id = recipe_steps.recipe_id
        and recipes.author_id = auth.uid()
    )
  );

create policy "Authors can delete steps"
  on public.recipe_steps for delete
  to authenticated
  using (
    exists (
      select 1
      from public.recipes
      where recipes.id = recipe_steps.recipe_id
        and recipes.author_id = auth.uid()
    )
  );

-- categories
create policy "Categories are viewable by everyone"
  on public.categories for select
  to anon, authenticated
  using (true);

-- recipe_categories
create policy "Recipe categories follow recipe visibility"
  on public.recipe_categories for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.recipes
      where recipes.id = recipe_categories.recipe_id
        and (recipes.status = 'published' or recipes.author_id = auth.uid())
    )
  );

create policy "Authors can tag their recipes"
  on public.recipe_categories for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.recipes
      where recipes.id = recipe_categories.recipe_id
        and recipes.author_id = auth.uid()
    )
  );

create policy "Authors can untag their recipes"
  on public.recipe_categories for delete
  to authenticated
  using (
    exists (
      select 1
      from public.recipes
      where recipes.id = recipe_categories.recipe_id
        and recipes.author_id = auth.uid()
    )
  );

-- favorites
create policy "Users can view their own favorites"
  on public.favorites for select
  to authenticated
  using (user_id = auth.uid());

create policy "Users can favorite recipes"
  on public.favorites for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and exists (
      select 1
      from public.recipes
      where recipes.id = favorites.recipe_id
        and recipes.status = 'published'
    )
  );

create policy "Users can unfavorite recipes"
  on public.favorites for delete
  to authenticated
  using (user_id = auth.uid());

-- recipe_reports
create policy "Users can file reports"
  on public.recipe_reports for insert
  to authenticated
  with check (reporter_id = auth.uid());

create policy "Users can view their own reports"
  on public.recipe_reports for select
  to authenticated
  using (
    reporter_id = auth.uid()
    or exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
        and profiles.is_admin = true
    )
  );

-- ---------------------------------------------------------------------------
-- Storage: public read, authenticated write under {user_id}/...
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('recipe-images', 'recipe-images', true)
on conflict (id) do nothing;

create policy "Public can view recipe images"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'recipe-images');

create policy "Users can upload their own recipe images"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'recipe-images'
    and split_part(name, '/', 1) = auth.uid()::text
  );

create policy "Users can update their own recipe images"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'recipe-images'
    and split_part(name, '/', 1) = auth.uid()::text
  )
  with check (
    bucket_id = 'recipe-images'
    and split_part(name, '/', 1) = auth.uid()::text
  );

create policy "Users can delete their own recipe images"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'recipe-images'
    and split_part(name, '/', 1) = auth.uid()::text
  );
