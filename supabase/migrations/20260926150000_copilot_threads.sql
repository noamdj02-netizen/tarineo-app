-- Fils copilote par projet + rôle, et blocs landing collés sur la fiche.

alter table public.chat_messages
  add column if not exists project_id uuid references public.projects (id) on delete set null,
  add column if not exists agent_role text not null default 'general'
    check (agent_role in ('general', 'tech', 'produit', 'design', 'launch'));

create index if not exists chat_messages_thread_idx
  on public.chat_messages (user_id, project_id, agent_role, created_at);

-- Notes copilote : RLS était activé sans policy (MCP passe par le service role).
drop policy if exists "owner_all" on public.project_notes;
create policy "owner_all" on public.project_notes
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.projects p
      where p.id = project_id and p.user_id = (select auth.uid())
    )
  );

create table if not exists public.project_assets (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  project_id uuid not null references public.projects (id) on delete cascade,
  kind       text not null default 'component' check (kind in ('component')),
  title      text not null check (char_length(title) between 1 and 120),
  html       text not null default '',
  theme_id   text,
  created_at timestamptz not null default now()
);

create index if not exists project_assets_project_idx
  on public.project_assets (user_id, project_id, created_at desc);

alter table public.project_assets enable row level security;

drop policy if exists "owner_all" on public.project_assets;
create policy "owner_all" on public.project_assets
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.projects p
      where p.id = project_id and p.user_id = (select auth.uid())
    )
  );
