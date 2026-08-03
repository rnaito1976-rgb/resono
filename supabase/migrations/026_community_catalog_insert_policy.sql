-- Allow logged-in users to add shared picker options (community catalog)
drop policy if exists "Authenticated can insert community catalog items"
  on public.community_catalog_items;
create policy "Authenticated can insert community catalog items"
  on public.community_catalog_items for insert
  to authenticated
  with check (true);
