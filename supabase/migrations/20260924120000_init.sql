-- Navpit : schéma initial.
-- Chaque ligne n'est lisible et modifiable que par son propriétaire (RLS).
-- Note : la colonne « desc » du prompt s'appelle « description » (desc est un mot réservé SQL).
-- Multi-utilisateurs : les ids sont des uuid ; « slug » (ex : devis-instant) est unique par utilisateur
-- et sert dans les URL (/projets/devis-instant).

-- ─── Projets ────────────────────────────────────────────────────────────────
create table public.projects (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  slug        text not null check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name        text not null,
  description text not null default '',
  status      text not null default 'pause' check (status in ('focus', 'pause')),
  stage       smallint not null default 1 check (stage between 1 and 6),
  next        text not null default '',
  site        text not null default '',
  github      text not null default '',
  figma       text not null default '',
  notion      text not null default '',
  theme       text not null default '',
  partner     text not null default '',
  pitch       text not null default '',
  target      text not null default '',
  problem     text not null default '',
  business    jsonb not null default '{}'::jsonb,
  stack       text[] not null default '{}',
  team        text[] not null default '{}',
  risks       text[] not null default '{}',
  notes       text not null default '',
  sort_order  integer not null default 0,
  updated_at  timestamptz not null default now(),
  unique (user_id, slug)
);
create index projects_user_id_idx on public.projects (user_id, sort_order);

create table public.project_features (
  id         uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  title      text not null,
  status     text not null default 'afaire' check (status in ('afaire', 'encours', 'fait', 'verif')),
  position   integer not null default 0
);
create index project_features_project_idx on public.project_features (project_id, position);

create table public.project_tasks (
  id         uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  title      text not null,
  done       boolean not null default false,
  position   integer not null default 0
);
create index project_tasks_project_idx on public.project_tasks (project_id, position);

create table public.project_log (
  id         uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  date       date not null default current_date,
  text       text not null,
  created_at timestamptz not null default now()
);
create index project_log_project_idx on public.project_log (project_id, date desc);

-- ─── Ressources ─────────────────────────────────────────────────────────────
create table public.resources (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  -- clé stable des ressources importées (ex : n-3djack, c-dribbble) pour relancer le seed sans doublon
  seed_key   text,
  name       text not null,
  url        text not null default '',
  category   text not null default '',
  tags       text[] not null default '{}',
  note       text not null default '',
  source     text not null default 'moi' check (source in ('notion', 'moi', 'curated')),
  verified   boolean not null default false,
  notion_url text not null default '',
  created_at timestamptz not null default now(),
  unique (user_id, seed_key)
);
create index resources_user_id_idx on public.resources (user_id, created_at desc);

-- ─── Historique du chat IA ──────────────────────────────────────────────────
create table public.chat_messages (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  role       text not null check (role in ('user', 'assistant')),
  content    text not null,
  created_at timestamptz not null default now()
);
create index chat_messages_user_idx on public.chat_messages (user_id, created_at);

-- ─── updated_at automatique sur projects ────────────────────────────────────
create function public.touch_updated_at() returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger projects_touch_updated_at
before update on public.projects
for each row execute function public.touch_updated_at();

-- Modifier une fonctionnalité, une tâche ou le journal met aussi à jour le projet.
create function public.touch_parent_project() returns trigger
language plpgsql
set search_path = ''
as $$
begin
  update public.projects
     set updated_at = now()
   where id = coalesce(new.project_id, old.project_id);
  return null;
end;
$$;

create trigger project_features_touch after insert or update or delete on public.project_features
for each row execute function public.touch_parent_project();
create trigger project_tasks_touch after insert or update or delete on public.project_tasks
for each row execute function public.touch_parent_project();
create trigger project_log_touch after insert or update or delete on public.project_log
for each row execute function public.touch_parent_project();

-- ─── RLS ────────────────────────────────────────────────────────────────────
alter table public.projects         enable row level security;
alter table public.project_features enable row level security;
alter table public.project_tasks    enable row level security;
alter table public.project_log      enable row level security;
alter table public.resources        enable row level security;
alter table public.chat_messages    enable row level security;

-- Tables avec user_id : le propriétaire fait tout, personne d'autre ne voit rien.
create policy "owner_all" on public.projects
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "owner_all" on public.resources
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "owner_all" on public.chat_messages
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- Tables enfants : accès si le projet parent appartient à l'utilisateur.
create policy "owner_all" on public.project_features
  for all to authenticated
  using (exists (select 1 from public.projects p where p.id = project_id and p.user_id = (select auth.uid())))
  with check (exists (select 1 from public.projects p where p.id = project_id and p.user_id = (select auth.uid())));

create policy "owner_all" on public.project_tasks
  for all to authenticated
  using (exists (select 1 from public.projects p where p.id = project_id and p.user_id = (select auth.uid())))
  with check (exists (select 1 from public.projects p where p.id = project_id and p.user_id = (select auth.uid())));

create policy "owner_all" on public.project_log
  for all to authenticated
  using (exists (select 1 from public.projects p where p.id = project_id and p.user_id = (select auth.uid())))
  with check (exists (select 1 from public.projects p where p.id = project_id and p.user_id = (select auth.uid())));
