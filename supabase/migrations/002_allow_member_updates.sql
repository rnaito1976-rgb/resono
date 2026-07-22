-- Allow profile updates (prototype: no auth yet)
create policy "Anyone can update members"
  on public.members
  for update
  to anon, authenticated
  using (true)
  with check (true);
