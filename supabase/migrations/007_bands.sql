-- Resono: Bands (music activity home)

create table if not exists public.bands (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) >= 1 and char_length(name) <= 60),
  accent_color text check (accent_color ~ '^#[0-9A-Fa-f]{6}$'),
  activity_status text not null default 'forming'
    check (activity_status in ('forming', 'active', 'paused', 'archived')),
  created_by_member_id text not null references public.members(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists bands_created_by_member_id_idx
  on public.bands(created_by_member_id);

create table if not exists public.band_members (
  band_id uuid not null references public.bands(id) on delete cascade,
  member_id text not null references public.members(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (band_id, member_id)
);

create index if not exists band_members_member_id_idx
  on public.band_members(member_id);

create table if not exists public.band_timeline_events (
  id uuid primary key default gen_random_uuid(),
  band_id uuid not null references public.bands(id) on delete cascade,
  kind text not null check (kind in (
    'first_resonance',
    'band_formed',
    'first_studio',
    'first_live',
    'video_added',
    'member_joined',
    'activity'
  )),
  title text not null,
  body text,
  occurred_at timestamptz not null default now(),
  activity_id uuid,
  metadata jsonb not null default '{}'::jsonb
);

create index if not exists band_timeline_events_band_id_occurred_at_idx
  on public.band_timeline_events(band_id, occurred_at desc);

create table if not exists public.band_activities (
  id uuid primary key default gen_random_uuid(),
  band_id uuid not null references public.bands(id) on delete cascade,
  author_member_id text not null references public.members(id) on delete cascade,
  kind text not null check (kind in ('text', 'photo', 'video')),
  title text,
  body text,
  media_url text,
  created_at timestamptz not null default now(),
  check (
    (kind = 'text' and body is not null and char_length(body) > 0)
    or (kind in ('photo', 'video') and media_url is not null)
  )
);

create index if not exists band_activities_band_id_created_at_idx
  on public.band_activities(band_id, created_at desc);

alter table public.band_timeline_events
  add constraint band_timeline_events_activity_id_fkey
  foreign key (activity_id) references public.band_activities(id) on delete set null;

alter table public.bands enable row level security;
alter table public.band_members enable row level security;
alter table public.band_timeline_events enable row level security;
alter table public.band_activities enable row level security;

create policy "Band members can read bands"
  on public.bands for select to authenticated
  using (
    exists (
      select 1 from public.band_members bm
      where bm.band_id = bands.id
        and bm.member_id = public.current_member_id()
    )
  );

create policy "Members can create bands"
  on public.bands for insert to authenticated
  with check (created_by_member_id = public.current_member_id());

create policy "Band members can read band_members"
  on public.band_members for select to authenticated
  using (
    exists (
      select 1 from public.band_members bm
      where bm.band_id = band_members.band_id
        and bm.member_id = public.current_member_id()
    )
  );

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

create policy "Band members can read timeline"
  on public.band_timeline_events for select to authenticated
  using (
    exists (
      select 1 from public.band_members bm
      where bm.band_id = band_timeline_events.band_id
        and bm.member_id = public.current_member_id()
    )
  );

create policy "Band members can insert timeline"
  on public.band_timeline_events for insert to authenticated
  with check (
    exists (
      select 1 from public.band_members bm
      where bm.band_id = band_timeline_events.band_id
        and bm.member_id = public.current_member_id()
    )
  );

create policy "Band members can read activities"
  on public.band_activities for select to authenticated
  using (
    exists (
      select 1 from public.band_members bm
      where bm.band_id = band_activities.band_id
        and bm.member_id = public.current_member_id()
    )
  );

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
