-- Community-added picker options (shared across users)
create table if not exists public.community_catalog_items (
  id uuid primary key default gen_random_uuid(),
  catalog_key text not null,
  value text not null,
  value_normalized text not null,
  created_by_member_id text references public.members (id) on delete set null,
  created_at timestamptz not null default now(),
  constraint community_catalog_items_unique unique (catalog_key, value_normalized)
);

create index if not exists community_catalog_items_key_idx
  on public.community_catalog_items (catalog_key, created_at desc);

alter table public.community_catalog_items enable row level security;

drop policy if exists "Anyone can read community catalog items" on public.community_catalog_items;
create policy "Anyone can read community catalog items"
  on public.community_catalog_items for select
  to anon, authenticated
  using (true);
