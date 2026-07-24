-- Fix infinite RLS recursion: band_members SELECT referenced itself, and
-- band_members INSERT subqueries triggered bands SELECT which queried band_members again.

create or replace function public.can_access_band(p_band_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.bands b
    where b.id = p_band_id
      and b.created_by_member_id = public.current_member_id()
  )
  or exists (
    select 1
    from public.band_members bm
    where bm.band_id = p_band_id
      and bm.member_id = public.current_member_id()
  );
$$;

grant execute on function public.can_access_band(uuid) to authenticated;

drop policy if exists "Band members can read bands" on public.bands;
create policy "Band members can read bands"
  on public.bands for select to authenticated
  using (public.can_access_band(id));

drop policy if exists "Band members can read band_members" on public.band_members;
create policy "Band members can read band_members"
  on public.band_members for select to authenticated
  using (public.can_access_band(band_id));

drop policy if exists "Band members can read timeline" on public.band_timeline_events;
create policy "Band members can read timeline"
  on public.band_timeline_events for select to authenticated
  using (public.can_access_band(band_id));

drop policy if exists "Band members can insert timeline" on public.band_timeline_events;
drop policy if exists "Band creators can insert timeline" on public.band_timeline_events;
create policy "Band members can insert timeline"
  on public.band_timeline_events for insert to authenticated
  with check (public.can_access_band(band_id));

drop policy if exists "Band members can read activities" on public.band_activities;
create policy "Band members can read activities"
  on public.band_activities for select to authenticated
  using (public.can_access_band(band_id));

drop policy if exists "Band members can post activities" on public.band_activities;
create policy "Band members can post activities"
  on public.band_activities for insert to authenticated
  with check (
    author_member_id = public.current_member_id()
    and public.can_access_band(band_id)
  );
