-- Cooldown tracking for badge email notifications (server-side only)
create table if not exists public.badge_email_cooldowns (
  id uuid primary key default gen_random_uuid(),
  member_id text not null references public.members(id) on delete cascade,
  kind text not null check (kind in ('message', 'band')),
  scope_id text not null,
  last_sent_at timestamptz not null default now(),
  unique (member_id, kind, scope_id)
);

create index if not exists badge_email_cooldowns_member_id_idx
  on public.badge_email_cooldowns (member_id);

alter table public.badge_email_cooldowns enable row level security;
