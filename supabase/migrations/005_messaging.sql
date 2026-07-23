-- Resono: mutual resonate messaging

create table if not exists public.resonances (
  id uuid primary key default gen_random_uuid(),
  from_member_id text not null references public.members(id) on delete cascade,
  to_member_id text not null references public.members(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (from_member_id, to_member_id),
  check (from_member_id <> to_member_id)
);

create index if not exists resonances_from_member_id_idx
  on public.resonances(from_member_id);
create index if not exists resonances_to_member_id_idx
  on public.resonances(to_member_id);

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  member_a_id text not null references public.members(id) on delete cascade,
  member_b_id text not null references public.members(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (member_a_id, member_b_id),
  check (member_a_id < member_b_id)
);

create index if not exists conversations_member_a_id_idx
  on public.conversations(member_a_id);
create index if not exists conversations_member_b_id_idx
  on public.conversations(member_b_id);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_member_id text not null references public.members(id) on delete cascade,
  body text not null check (char_length(body) > 0 and char_length(body) <= 2000),
  created_at timestamptz not null default now()
);

create index if not exists messages_conversation_id_created_at_idx
  on public.messages(conversation_id, created_at);

create table if not exists public.conversation_reads (
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  member_id text not null references public.members(id) on delete cascade,
  last_read_at timestamptz not null default now(),
  primary key (conversation_id, member_id)
);

alter table public.resonances enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.conversation_reads enable row level security;

create or replace function public.current_member_id()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select id
  from public.members
  where user_id = auth.uid()
  limit 1;
$$;

create policy "Users can read own resonances"
  on public.resonances
  for select
  to authenticated
  using (
    from_member_id = public.current_member_id()
    or to_member_id = public.current_member_id()
  );

create policy "Users can insert own resonances"
  on public.resonances
  for insert
  to authenticated
  with check (from_member_id = public.current_member_id());

create policy "Users can delete own resonances"
  on public.resonances
  for delete
  to authenticated
  using (from_member_id = public.current_member_id());

create policy "Participants can read conversations"
  on public.conversations
  for select
  to authenticated
  using (
    member_a_id = public.current_member_id()
    or member_b_id = public.current_member_id()
  );

create policy "Participants can insert conversations"
  on public.conversations
  for insert
  to authenticated
  with check (
    member_a_id = public.current_member_id()
    or member_b_id = public.current_member_id()
  );

create policy "Participants can read messages"
  on public.messages
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.conversations c
      where c.id = conversation_id
        and (
          c.member_a_id = public.current_member_id()
          or c.member_b_id = public.current_member_id()
        )
    )
  );

create policy "Participants can send messages"
  on public.messages
  for insert
  to authenticated
  with check (
    sender_member_id = public.current_member_id()
    and exists (
      select 1
      from public.conversations c
      where c.id = conversation_id
        and (
          c.member_a_id = public.current_member_id()
          or c.member_b_id = public.current_member_id()
        )
    )
  );

create policy "Participants can read conversation reads"
  on public.conversation_reads
  for select
  to authenticated
  using (member_id = public.current_member_id());

create policy "Participants can upsert conversation reads"
  on public.conversation_reads
  for insert
  to authenticated
  with check (member_id = public.current_member_id());

create policy "Participants can update conversation reads"
  on public.conversation_reads
  for update
  to authenticated
  using (member_id = public.current_member_id())
  with check (member_id = public.current_member_id());

alter table public.messages replica identity full;
alter publication supabase_realtime add table public.messages;
