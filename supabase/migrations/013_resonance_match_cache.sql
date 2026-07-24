-- ⑬ 共鳴度スコアを viewer × target 単位で事前計算・キャッシュ
create table if not exists public.resonance_match_cache (
  viewer_member_id text not null references public.members (id) on delete cascade,
  target_member_id text not null references public.members (id) on delete cascade,
  score integer not null check (score >= 0 and score <= 100),
  reason jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (viewer_member_id, target_member_id)
);

create index if not exists resonance_match_cache_target_idx
  on public.resonance_match_cache (target_member_id);

alter table public.resonance_match_cache enable row level security;

create policy "Anyone can read resonance match cache"
  on public.resonance_match_cache
  for select
  to anon, authenticated
  using (true);

create policy "Authenticated can upsert own viewer cache rows"
  on public.resonance_match_cache
  for all
  to authenticated
  using (viewer_member_id = public.current_member_id())
  with check (viewer_member_id = public.current_member_id());
