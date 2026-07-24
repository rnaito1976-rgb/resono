-- Feed ordering by resonance_rate (home / members list)
create index if not exists members_resonance_rate_idx
  on public.members (resonance_rate desc);
