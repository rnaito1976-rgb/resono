-- Allow any band member (not only creator) to add new members
drop policy if exists "Band creators can insert band_members" on public.band_members;

create policy "Band members can insert band_members"
  on public.band_members for insert to authenticated
  with check (public.can_access_band(band_id));
