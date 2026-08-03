-- Part recruitment applications (viewer taps Open on someone's recruiting parts)
create table if not exists public.band_recruitment_applications (
  id uuid primary key default gen_random_uuid(),
  target_member_id text not null references public.members (id) on delete cascade,
  applicant_member_id text not null references public.members (id) on delete cascade,
  part text not null,
  part_normalized text not null,
  created_at timestamptz not null default now(),
  constraint band_recruitment_applications_unique
    unique (target_member_id, applicant_member_id, part_normalized),
  constraint band_recruitment_applications_distinct_members
    check (target_member_id <> applicant_member_id)
);

create index if not exists band_recruitment_applications_target_idx
  on public.band_recruitment_applications (target_member_id, created_at desc);

create index if not exists band_recruitment_applications_applicant_idx
  on public.band_recruitment_applications (applicant_member_id, created_at desc);

alter table public.band_recruitment_applications enable row level security;

drop policy if exists "Applicants and targets can read recruitment applications"
  on public.band_recruitment_applications;
create policy "Applicants and targets can read recruitment applications"
  on public.band_recruitment_applications for select
  to authenticated
  using (
    applicant_member_id = public.current_member_id()
    or target_member_id = public.current_member_id()
  );

drop policy if exists "Applicants can insert recruitment applications"
  on public.band_recruitment_applications;
create policy "Applicants can insert recruitment applications"
  on public.band_recruitment_applications for insert
  to authenticated
  with check (applicant_member_id = public.current_member_id());

drop policy if exists "Applicants can delete own recruitment applications"
  on public.band_recruitment_applications;
create policy "Applicants can delete own recruitment applications"
  on public.band_recruitment_applications for delete
  to authenticated
  using (applicant_member_id = public.current_member_id());
