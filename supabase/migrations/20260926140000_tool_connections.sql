-- Connecteurs Stack (état « Validé » par utilisateur).

create table public.tool_connections (
  user_id      uuid not null references auth.users (id) on delete cascade,
  tool_id      text not null check (char_length(tool_id) between 1 and 60),
  connected_at timestamptz not null default now(),
  primary key (user_id, tool_id)
);

create index tool_connections_user_idx on public.tool_connections (user_id);

alter table public.tool_connections enable row level security;

create policy "tool_connections_select_own"
  on public.tool_connections for select
  using (auth.uid() = user_id);

create policy "tool_connections_insert_own"
  on public.tool_connections for insert
  with check (auth.uid() = user_id);

create policy "tool_connections_update_own"
  on public.tool_connections for update
  using (auth.uid() = user_id);

create policy "tool_connections_delete_own"
  on public.tool_connections for delete
  using (auth.uid() = user_id);
