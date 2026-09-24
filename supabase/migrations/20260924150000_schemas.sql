-- Schémas Excalidraw, liés ou non à un projet.
-- scene = { elements, appState } (sans les fichiers image).

create table public.project_schemas (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  project_id uuid references public.projects (id) on delete set null,
  title      text not null default 'Sans titre' check (char_length(title) <= 120),
  kind       text not null default 'libre'
             check (kind in ('libre', 'architecture', 'parcours', 'tunnel', 'roadmap', 'donnees')),
  scene      jsonb not null default '{"elements": [], "appState": {}}'::jsonb
             check (octet_length(scene::text) <= 2000000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index project_schemas_user_idx on public.project_schemas (user_id, updated_at desc);
create index project_schemas_project_idx on public.project_schemas (project_id);

create trigger project_schemas_touch_updated_at
before update on public.project_schemas
for each row execute function public.touch_updated_at();

alter table public.project_schemas enable row level security;

-- Le propriétaire fait tout ; un schéma ne peut viser qu'un de ses propres projets.
create policy "owner_all" on public.project_schemas
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (
    user_id = (select auth.uid())
    and (
      project_id is null
      or exists (select 1 from public.projects p where p.id = project_id and p.user_id = (select auth.uid()))
    )
  );
