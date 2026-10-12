-- Demandes artisans (offre de lancement landing) — insertion via API service role uniquement.
create table if not exists public.demandes_artisans (
  id uuid primary key default gen_random_uuid(),
  prenom text not null check (char_length(trim(prenom)) >= 2),
  metier text not null check (char_length(trim(metier)) >= 2),
  telephone text not null,
  email text not null,
  created_at timestamptz not null default now()
);

create index if not exists demandes_artisans_created_at_idx
  on public.demandes_artisans (created_at desc);

alter table public.demandes_artisans enable row level security;

-- Aucune policy : pas d'accès direct anon/authenticated ; route API + service role.
