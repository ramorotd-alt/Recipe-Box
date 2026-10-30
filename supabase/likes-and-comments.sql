-- Likes and comments on recipes.
-- Run once in the Supabase SQL Editor. Does not drop profiles or recipes.

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists public.recipe_likes (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  recipe_id uuid not null references public.recipes (id) on delete cascade,
  unique (user_id, recipe_id)
);

create table if not exists public.recipe_comments (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  recipe_id uuid not null references public.recipes (id) on delete cascade,
  body text not null check (
    char_length(trim(body)) > 0
    and char_length(body) <= 500
  )
);

create index if not exists recipe_likes_recipe_id_idx
  on public.recipe_likes (recipe_id);

create index if not exists recipe_likes_user_id_idx
  on public.recipe_likes (user_id);

create index if not exists recipe_comments_recipe_id_idx
  on public.recipe_comments (recipe_id, created_at);

create index if not exists recipe_comments_user_id_idx
  on public.recipe_comments (user_id);

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

drop trigger if exists recipe_comments_updated_at on public.recipe_comments;
create trigger recipe_comments_updated_at
  before update on public.recipe_comments
  for each row execute function public.handle_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.recipe_likes enable row level security;
alter table public.recipe_comments enable row level security;

drop policy if exists "Likes are viewable by everyone" on public.recipe_likes;
create policy "Likes are viewable by everyone"
  on public.recipe_likes for select
  to anon, authenticated
  using (true);

drop policy if exists "Users can like recipes" on public.recipe_likes;
create policy "Users can like recipes"
  on public.recipe_likes for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "Users can unlike recipes" on public.recipe_likes;
create policy "Users can unlike recipes"
  on public.recipe_likes for delete
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "Comments are viewable by everyone" on public.recipe_comments;
create policy "Comments are viewable by everyone"
  on public.recipe_comments for select
  to anon, authenticated
  using (true);

drop policy if exists "Users can comment on recipes" on public.recipe_comments;
create policy "Users can comment on recipes"
  on public.recipe_comments for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "Users can update their own comments" on public.recipe_comments;
create policy "Users can update their own comments"
  on public.recipe_comments for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "Users can delete their own comments" on public.recipe_comments;
create policy "Users can delete their own comments"
  on public.recipe_comments for delete
  to authenticated
  using (user_id = auth.uid());
