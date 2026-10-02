-- Profils de mise en page documents BTP par enseigne (catalogue global, lecture seule côté client).

create table if not exists public.vendor_document_profiles (
  id                  uuid primary key default gen_random_uuid(),
  vendor_key          text not null,
  vendor_display_name text not null default '',
  kind                text check (kind is null or kind in ('devis', 'facture', 'bon_commande', 'bl', 'bon_enlevement', 'autre')),
  layout_hints        jsonb not null default '{}'::jsonb,
  prompt_addon        text not null default '',
  version             integer not null default 1,
  sample_count        integer not null default 0,
  updated_at          timestamptz not null default now(),
  unique (vendor_key, kind)
);

create index if not exists vendor_document_profiles_key_idx
  on public.vendor_document_profiles (vendor_key);

create table if not exists public.vendor_profile_contributions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  vendor_key  text not null,
  kind        text not null default 'autre',
  hint_delta  jsonb not null default '{}'::jsonb,
  hint_hash   text not null default '',
  created_at  timestamptz not null default now()
);

create index if not exists vendor_profile_contributions_vendor_idx
  on public.vendor_profile_contributions (vendor_key, kind, hint_hash);

alter table public.vendor_document_profiles enable row level security;
alter table public.vendor_profile_contributions enable row level security;

drop policy if exists "vendor_profiles_read_authenticated" on public.vendor_document_profiles;
create policy "vendor_profiles_read_authenticated"
  on public.vendor_document_profiles for select
  to authenticated
  using (true);

drop policy if exists "vendor_contributions_insert_own" on public.vendor_profile_contributions;
create policy "vendor_contributions_insert_own"
  on public.vendor_profile_contributions for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "vendor_contributions_select_own" on public.vendor_profile_contributions;
create policy "vendor_contributions_select_own"
  on public.vendor_profile_contributions for select
  to authenticated
  using (auth.uid() = user_id);

-- Seeds minimaux (enseignes connues)
insert into public.vendor_document_profiles (vendor_key, vendor_display_name, kind, layout_hints, prompt_addon, version, sample_count)
values
  ('cedeo', 'Cedeo', null, '{"header_markers":["Cedeo"],"column_order":["ref","designation","qty","unit","pu_ht"]}'::jsonb,
   'Document Cedeo : repère l’en-tête Cedeo ; tableau souvent avec Réf., Désignation, Qté, U, PU HT ; totaux en bas (Total HT / TVA / TTC).', 1, 0),
  ('point_p', 'Point.P', null, '{"header_markers":["Point.P","Point P"],"column_order":["ref","designation","qty","unit","pu_ht"]}'::jsonb,
   'Document Point.P : logo Point.P en en-tête ; lignes avec référence article, libellé, quantité, unité, prix unitaire HT ; adresse chantier souvent en bloc livraison.', 1, 0),
  ('rexel', 'Rexel', null, '{"header_markers":["Rexel"],"column_order":["ref","designation","qty","unit","pu_ht"]}'::jsonb,
   'Document Rexel : en-tête Rexel ; colonnes type Réf / Désignation / Qté / PU ; repérer le n° de commande ou facture en haut à droite.', 1, 0),
  ('brossette', 'Brossette', null, '{"header_markers":["Brossette"],"column_order":["ref","designation","qty","unit","pu_ht"]}'::jsonb,
   'Document Brossette : en-tête Brossette ; tableau produits avec référence et PU HT.', 1, 0),
  ('richardson', 'Richardson', null, '{"header_markers":["Richardson"],"column_order":["ref","designation","qty","unit","pu_ht"]}'::jsonb,
   'Document Richardson : en-tête Richardson ; lignes avec code article et montants HT.', 1, 0),
  ('aubade', 'Aubade', null, '{"header_markers":["Aubade"],"column_order":["ref","designation","qty","unit","pu_ht"]}'::jsonb,
   'Document Aubade : enseigne Aubade ; désignations sanitaires/carrelage ; totaux HT en pied de page.', 1, 0),
  ('zima', 'Zima', null, '{"header_markers":["Zima"],"column_order":["ref","designation","qty","unit","pu_ht"]}'::jsonb,
   'Document Zima : en-tête Zima ; structure classique devis/facture distributeur.', 1, 0),
  ('marlin', 'Marlin', null, '{"header_markers":["Marlin"],"column_order":["ref","designation","qty","unit","pu_ht"]}'::jsonb,
   'Document Marlin : en-tête Marlin ; lignes avec référence et prix HT.', 1, 0)
on conflict (vendor_key, kind) do nothing;
