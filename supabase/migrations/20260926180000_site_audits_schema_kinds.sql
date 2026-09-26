-- Scores des 12 frames sur chaque projet + agents schéma formation / offre.

alter table public.projects
  add column if not exists audit_frames text[] not null default '{}'::text[];

alter table public.project_schemas
  drop constraint if exists project_schemas_kind_check;

alter table public.project_schemas
  add constraint project_schemas_kind_check
  check (kind in (
    'libre',
    'architecture',
    'parcours',
    'tunnel',
    'roadmap',
    'donnees',
    'formation',
    'offre'
  ));
