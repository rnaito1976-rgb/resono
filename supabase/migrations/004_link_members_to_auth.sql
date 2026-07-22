-- Link members to auth users for my-page profiles
alter table public.members
  add column if not exists user_id uuid unique references auth.users(id) on delete cascade;

create index if not exists members_user_id_idx on public.members(user_id);

drop policy if exists "Anyone can update members" on public.members;

create policy "Users can insert own member"
  on public.members
  for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "Users can update own member"
  on public.members
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
