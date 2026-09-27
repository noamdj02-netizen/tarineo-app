create table if not exists public.company_profiles (
  user_id                       uuid primary key references auth.users (id) on delete cascade,
  raison_sociale                text not null default '',
  siret                         text not null default '',
  forme_juridique               text not null default '',
  adresse_rue                   text not null default '',
  adresse_code_postal           text not null default '',
  adresse_ville                 text not null default '',
  telephone                     text not null default '',
  email_contact                 text not null default '',
  regime_tva                    text not null default 'FRANCHISE_293B' check (regime_tva in ('NORMAL', 'FRANCHISE_293B')),
  registre_immatriculation      text not null default '',
  assurance_nom                 text not null default '',
  assurance_adresse             text not null default '',
  assurance_numero_contrat      text not null default '',
  assurance_activites_garanties text not null default '',
  assurance_zone_geographique   text not null default '',
  logo_path                     text not null default '',
  marge_par_defaut_pct          numeric not null default 35,
  updated_at                    timestamptz not null default now()
);

alter table public.company_profiles enable row level security;
drop policy if exists "owner_all" on public.company_profiles;
create policy "owner_all" on public.company_profiles
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
