-- User profiles: Frequency Color (per-user accent, not global theme)
create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  frequency_color text not null check (frequency_color ~ '^#[0-9A-Fa-f]{6}$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_frequency_color_idx
  on public.profiles (frequency_color);

alter table public.profiles enable row level security;

create policy "Anyone can read profiles"
  on public.profiles
  for select
  to anon, authenticated
  using (true);

create policy "Users can insert own profile"
  on public.profiles
  for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "Users can update own profile"
  on public.profiles
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
