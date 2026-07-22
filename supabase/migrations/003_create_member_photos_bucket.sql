-- Storage bucket for member profile photos
insert into storage.buckets (id, name, public)
values ('member-photos', 'member-photos', true)
on conflict (id) do nothing;

create policy "Public read member photos"
  on storage.objects
  for select
  to public
  using (bucket_id = 'member-photos');

create policy "Anyone can upload member photos"
  on storage.objects
  for insert
  to anon, authenticated
  with check (bucket_id = 'member-photos');

create policy "Anyone can update member photos"
  on storage.objects
  for update
  to anon, authenticated
  using (bucket_id = 'member-photos');

create policy "Anyone can delete member photos"
  on storage.objects
  for delete
  to anon, authenticated
  using (bucket_id = 'member-photos');
