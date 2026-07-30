-- User-controlled email notification preferences (encounter-focused only)
create table if not exists public.email_notification_preferences (
  member_id text primary key references public.members(id) on delete cascade,
  resonance_members boolean not null default true,
  messages boolean not null default true,
  band_recruitment boolean not null default true,
  updated_at timestamptz not null default now()
);

create index if not exists email_notification_preferences_member_id_idx
  on public.email_notification_preferences (member_id);

alter table public.email_notification_preferences enable row level security;

create policy "Users can read own email notification preferences"
  on public.email_notification_preferences
  for select
  to authenticated
  using (
    member_id in (
      select id from public.members where user_id = auth.uid()
    )
  );

create policy "Users can insert own email notification preferences"
  on public.email_notification_preferences
  for insert
  to authenticated
  with check (
    member_id in (
      select id from public.members where user_id = auth.uid()
    )
  );

create policy "Users can update own email notification preferences"
  on public.email_notification_preferences
  for update
  to authenticated
  using (
    member_id in (
      select id from public.members where user_id = auth.uid()
    )
  )
  with check (
    member_id in (
      select id from public.members where user_id = auth.uid()
    )
  );

-- Extend badge email cooldown kinds for encounter notifications
alter table public.badge_email_cooldowns
  drop constraint if exists badge_email_cooldowns_kind_check;

alter table public.badge_email_cooldowns
  add constraint badge_email_cooldowns_kind_check
  check (kind in ('message', 'band', 'resonance', 'resonance_member', 'band_recruitment'));
