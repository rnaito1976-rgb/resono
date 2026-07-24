-- Track when each member last viewed a band's updates.

create table if not exists public.band_member_reads (
  band_id uuid not null references public.bands(id) on delete cascade,
  member_id text not null references public.members(id) on delete cascade,
  last_seen_at timestamptz not null default now(),
  primary key (band_id, member_id)
);

create index if not exists band_member_reads_member_id_idx
  on public.band_member_reads(member_id);

alter table public.band_member_reads enable row level security;

drop policy if exists "Members can read own band reads" on public.band_member_reads;
create policy "Members can read own band reads"
  on public.band_member_reads
  for select
  to authenticated
  using (member_id = public.current_member_id());

drop policy if exists "Members can insert own band reads" on public.band_member_reads;
create policy "Members can insert own band reads"
  on public.band_member_reads
  for insert
  to authenticated
  with check (
    member_id = public.current_member_id()
    and exists (
      select 1
      from public.band_members bm
      where bm.band_id = band_member_reads.band_id
        and bm.member_id = public.current_member_id()
    )
  );

drop policy if exists "Members can update own band reads" on public.band_member_reads;
create policy "Members can update own band reads"
  on public.band_member_reads
  for update
  to authenticated
  using (member_id = public.current_member_id())
  with check (
    member_id = public.current_member_id()
    and exists (
      select 1
      from public.band_members bm
      where bm.band_id = band_member_reads.band_id
        and bm.member_id = public.current_member_id()
    )
  );
