-- Repair script: run if 007_bands.sql stopped at the activity_id foreign key.
-- Safe to re-run.

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'band_timeline_events_activity_id_fkey'
  ) then
    alter table public.band_timeline_events
      add constraint band_timeline_events_activity_id_fkey
      foreign key (activity_id) references public.band_activities(id) on delete set null;
  end if;
end $$;

alter table public.bands enable row level security;
alter table public.band_members enable row level security;
alter table public.band_timeline_events enable row level security;
alter table public.band_activities enable row level security;

drop policy if exists "Band members can read bands" on public.bands;
create policy "Band members can read bands"
  on public.bands for select to authenticated
  using (
    exists (
      select 1 from public.band_members bm
      where bm.band_id = bands.id
        and bm.member_id = public.current_member_id()
    )
  );

drop policy if exists "Members can create bands" on public.bands;
create policy "Members can create bands"
  on public.bands for insert to authenticated
  with check (created_by_member_id = public.current_member_id());

drop policy if exists "Band members can read band_members" on public.band_members;
create policy "Band members can read band_members"
  on public.band_members for select to authenticated
  using (
    exists (
      select 1 from public.band_members bm
      where bm.band_id = band_members.band_id
        and bm.member_id = public.current_member_id()
    )
  );

drop policy if exists "Band creators can insert band_members" on public.band_members;
create policy "Band creators can insert band_members"
  on public.band_members for insert to authenticated
  with check (
    exists (
      select 1 from public.bands b
      where b.id = band_members.band_id
        and b.created_by_member_id = public.current_member_id()
    )
    or member_id = public.current_member_id()
  );

drop policy if exists "Band members can read timeline" on public.band_timeline_events;
create policy "Band members can read timeline"
  on public.band_timeline_events for select to authenticated
  using (
    exists (
      select 1 from public.band_members bm
      where bm.band_id = band_timeline_events.band_id
        and bm.member_id = public.current_member_id()
    )
  );

drop policy if exists "Band members can insert timeline" on public.band_timeline_events;
create policy "Band members can insert timeline"
  on public.band_timeline_events for insert to authenticated
  with check (
    exists (
      select 1 from public.band_members bm
      where bm.band_id = band_timeline_events.band_id
        and bm.member_id = public.current_member_id()
    )
  );

drop policy if exists "Band members can read activities" on public.band_activities;
create policy "Band members can read activities"
  on public.band_activities for select to authenticated
  using (
    exists (
      select 1 from public.band_members bm
      where bm.band_id = band_activities.band_id
        and bm.member_id = public.current_member_id()
    )
  );

drop policy if exists "Band members can post activities" on public.band_activities;
create policy "Band members can post activities"
  on public.band_activities for insert to authenticated
  with check (
    author_member_id = public.current_member_id()
    and exists (
      select 1 from public.band_members bm
      where bm.band_id = band_activities.band_id
        and bm.member_id = public.current_member_id()
    )
  );
