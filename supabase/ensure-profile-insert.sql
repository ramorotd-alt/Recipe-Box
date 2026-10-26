-- Allow signed-in users to create their own profiles row.
-- Run once in the Supabase SQL Editor. Does not drop tables or data.

drop policy if exists "Users can insert their own profile" on public.profiles;

create policy "Users can insert their own profile"
  on public.profiles for insert
  to authenticated
  with check (id = auth.uid());
