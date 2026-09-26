-- Les landings de /bibliotheque/heros se collent sur un projet (kind landing).

alter table public.project_assets
  drop constraint if exists project_assets_kind_check;

alter table public.project_assets
  add constraint project_assets_kind_check
  check (kind in ('component', 'landing'));
