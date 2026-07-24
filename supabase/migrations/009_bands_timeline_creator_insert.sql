-- Allow band creators to seed timeline events during formation.

drop policy if exists "Band creators can insert timeline" on public.band_timeline_events;
create policy "Band creators can insert timeline"
  on public.band_timeline_events for insert to authenticated
  with check (
    exists (
      select 1 from public.bands b
      where b.id = band_timeline_events.band_id
        and b.created_by_member_id = public.current_member_id()
    )
  );
