-- Allow resonance badge email cooldown tracking
alter table public.badge_email_cooldowns
  drop constraint if exists badge_email_cooldowns_kind_check;

alter table public.badge_email_cooldowns
  add constraint badge_email_cooldowns_kind_check
  check (kind in ('message', 'band', 'resonance'));
