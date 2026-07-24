-- Repair band creation RLS: allow insert + returning select for creators,
-- and make current_member_id() resolve linked profiles reliably.

create or replace function public.current_member_id()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (
      select id
      from public.members
      where user_id = auth.uid()
      limit 1
    ),
    (
      select id
      from public.members
      where id = auth.uid()::text
      limit 1
    )
  );
$$;

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

drop policy if exists "Members can create bands" on public.bands;
create policy "Members can create bands"
  on public.bands for insert to authenticated
  with check (
    public.current_member_id() is not null
    and created_by_member_id = public.current_member_id()
  );

drop policy if exists "Band creators can read own bands" on public.bands;
create policy "Band creators can read own bands"
  on public.bands for select to authenticated
  using (created_by_member_id = public.current_member_id());

drop policy if exists "Band members can read bands" on public.bands;
create policy "Band members can read bands"
  on public.bands for select to authenticated
  using (public.can_access_band(id));

drop policy if exists "Band members can read band_members" on public.band_members;
create policy "Band members can read band_members"
  on public.band_members for select to authenticated
  using (public.can_access_band(band_id));

drop policy if exists "Band creators can insert band_members" on public.band_members;
create policy "Band creators can insert band_members"
  on public.band_members for insert to authenticated
  with check (
    exists (
      select 1
      from public.bands b
      where b.id = band_members.band_id
        and b.created_by_member_id = public.current_member_id()
    )
    or member_id = public.current_member_id()
  );

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
