-- Live: community feed events (public read, 24h window enforced in app)
create table if not exists public.live_events (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (
    kind in (
      'new_member',
      'new_band',
      'band_formed',
      'new_video',
      'looking_for_updated'
    )
  ),
  title text not null,
  subtitle text,
  href text not null,
  photo text,
  actor_member_id text references public.members (id) on delete set null,
  band_id uuid references public.bands (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists live_events_created_at_idx
  on public.live_events (created_at desc);

alter table public.live_events enable row level security;

create policy "Anyone can read live events"
  on public.live_events
  for select
  to anon, authenticated
  using (true);

create policy "Authenticated users can insert live events"
  on public.live_events
  for insert
  to authenticated
  with check (true);
