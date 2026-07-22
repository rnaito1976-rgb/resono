-- Resono: members table
create table if not exists public.members (
  id text primary key,
  name text not null,
  resonance_rate integer not null check (resonance_rate >= 0 and resonance_rate <= 100),
  tags text[] not null default '{}',
  ai_comment text not null,
  photo text not null,
  portrait jsonb not null,
  music jsonb not null,
  fashion jsonb not null,
  mood jsonb not null,
  looking_for jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.members enable row level security;

create policy "Anyone can read members"
  on public.members
  for select
  to anon, authenticated
  using (true);
