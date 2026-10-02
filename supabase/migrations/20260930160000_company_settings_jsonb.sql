-- Paramètres workspace (tarifs, documents, IA) — JSON flexible, non bloquant.
alter table public.company_profiles
  add column if not exists settings jsonb not null default '{}'::jsonb;
