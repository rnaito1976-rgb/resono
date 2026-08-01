-- Band set list / cover songs the band has played

create table if not exists public.band_cover_songs (
  id uuid primary key default gen_random_uuid(),
  band_id uuid not null references public.bands(id) on delete cascade,
  added_by_member_id text not null references public.members(id) on delete cascade,
  artist text not null default '',
  title text not null check (char_length(trim(title)) > 0),
  created_at timestamptz not null default now()
);

create index if not exists band_cover_songs_band_id_created_at_idx
  on public.band_cover_songs(band_id, created_at desc);

create unique index if not exists band_cover_songs_band_song_unique_idx
  on public.band_cover_songs (
    band_id,
    lower(trim(artist)),
    lower(trim(title))
  );

alter table public.band_cover_songs enable row level security;

drop policy if exists "Band members can read cover songs" on public.band_cover_songs;
create policy "Band members can read cover songs"
  on public.band_cover_songs for select to authenticated
  using (
    exists (
      select 1 from public.band_members bm
      where bm.band_id = band_cover_songs.band_id
        and bm.member_id = public.current_member_id()
    )
  );

drop policy if exists "Band members can add cover songs" on public.band_cover_songs;
create policy "Band members can add cover songs"
  on public.band_cover_songs for insert to authenticated
  with check (
    added_by_member_id = public.current_member_id()
    and exists (
      select 1 from public.band_members bm
      where bm.band_id = band_cover_songs.band_id
        and bm.member_id = public.current_member_id()
    )
  );

drop policy if exists "Band members can remove cover songs" on public.band_cover_songs;
create policy "Band members can remove cover songs"
  on public.band_cover_songs for delete to authenticated
  using (
    exists (
      select 1 from public.band_members bm
      where bm.band_id = band_cover_songs.band_id
        and bm.member_id = public.current_member_id()
    )
  );
