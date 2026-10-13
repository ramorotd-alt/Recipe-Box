-- Recipe Box — recipes table
-- Columns: id, created_at, user_id, title, description, ingredients,
-- cooking_time, difficulty, category, instructions
-- Assumes public.profiles and public.recipe_difficulty already exist
-- (see schema_claude.sql). Run in the Supabase SQL Editor.

create table public.recipes (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp not null default now(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  description text,
  ingredients text[] not null default '{}',
  cooking_time integer not null default 0 check (cooking_time >= 0),
  difficulty public.recipe_difficulty not null default 'easy',
  category text,
  instructions text[] not null default '{}'
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

create index recipes_user_id_idx on public.recipes (user_id);
create index recipes_created_at_idx on public.recipes (created_at desc);
create index recipes_category_idx on public.recipes (category);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.recipes enable row level security;

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
