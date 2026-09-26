-- Clés API MCP (lecture service role uniquement) + notes de projet.

create table public.api_keys (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users (id) on delete cascade,
  name         text not null check (char_length(name) between 1 and 60),
  prefix       text not null,
  hash         text not null unique,
  scopes       text[] not null default '{read}',
  last_used_at timestamptz,
  revoked_at   timestamptz,
  created_at   timestamptz not null default now()
);

create index api_keys_user_id_idx on public.api_keys (user_id);

alter table public.api_keys enable row level security;

create table public.project_notes (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  project_id uuid not null references public.projects (id) on delete cascade,
  title      text not null,
  content    text not null,
  source     text,
  created_at timestamptz not null default now()
);

create index project_notes_user_idx on public.project_notes (user_id, project_id);
create index project_notes_search_idx
  on public.project_notes using gin (to_tsvector('french', title || ' ' || content));

alter table public.project_notes enable row level security;

alter table public.project_tasks
  add column if not exists notes text not null default '',
  add column if not exists due_date date;
