-- Add an optional bio on profiles. Run once in the Supabase SQL Editor.
-- Does not drop tables or data.

alter table public.profiles
  add column if not exists bio text;
