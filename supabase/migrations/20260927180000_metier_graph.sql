-- Graphe métier TARINEO. Autonome : ne dépend pas de public.projects (Navpit).

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create table if not exists public.parties (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  kind       text not null check (kind in ('client', 'fournisseur', 'distributeur', 'atelier')),
  name       text not null,
  address    text not null default '',
  seed_key   text,
  created_at timestamptz not null default now(),
  unique (user_id, seed_key)
);
create index if not exists parties_user_idx on public.parties (user_id, kind);

create table if not exists public.chantiers (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  slug       text not null check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name       text not null,
  address    text not null default '',
  client_id  uuid references public.parties (id) on delete set null,
  project_id uuid,
  status     text not null default 'pause' check (status in ('focus', 'pause', 'fini')),
  seed_key   text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, slug),
  unique (user_id, seed_key)
);
create index if not exists chantiers_user_idx on public.chantiers (user_id, status);

create table if not exists public.products (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name       text not null,
  family     text not null default '',
  unit       text not null default 'u',
  seed_key   text,
  unique (user_id, seed_key)
);

create table if not exists public.documents (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null default auth.uid() references auth.users (id) on delete cascade,
  direction           text not null check (direction in ('in', 'out')),
  kind                text not null check (kind in ('devis', 'facture', 'bon_commande', 'bl', 'bon_enlevement', 'autre')),
  title               text not null default '',
  party_id            uuid references public.parties (id) on delete set null,
  chantier_id         uuid references public.chantiers (id) on delete set null,
  source_document_id  uuid references public.documents (id) on delete set null,
  file_path           text not null default '',
  extract             jsonb not null default '{}'::jsonb,
  status              text not null default 'ready' check (status in ('uploading', 'reading', 'ready', 'error')),
  error               text not null default '',
  seed_key            text,
  created_at          timestamptz not null default now(),
  unique (user_id, seed_key)
);
create index if not exists documents_user_idx on public.documents (user_id, created_at desc);
create index if not exists documents_chantier_idx on public.documents (chantier_id);

create table if not exists public.document_lines (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid not null default auth.uid() references auth.users (id) on delete cascade,
  document_id          uuid not null references public.documents (id) on delete cascade,
  product_id           uuid references public.products (id) on delete set null,
  supplier_party_id    uuid references public.parties (id) on delete set null,
  distributor_party_id uuid references public.parties (id) on delete set null,
  label                text not null,
  qty                  numeric not null default 1,
  unit                 text not null default 'u',
  buy_price            numeric not null default 0,
  sell_price           numeric not null default 0,
  position             integer not null default 0
);
create index if not exists document_lines_doc_idx on public.document_lines (document_id, position);

create table if not exists public.price_alerts (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null default auth.uid() references auth.users (id) on delete cascade,
  product_id   uuid references public.products (id) on delete set null,
  document_id  uuid references public.documents (id) on delete set null,
  chantier_id  uuid references public.chantiers (id) on delete set null,
  label        text not null,
  old_price    numeric not null,
  new_price    numeric not null,
  created_at   timestamptz not null default now(),
  seed_key     text,
  unique (user_id, seed_key)
);

drop trigger if exists chantiers_touch_updated_at on public.chantiers;
create trigger chantiers_touch_updated_at
before update on public.chantiers
for each row execute function public.touch_updated_at();

alter table public.parties enable row level security;
alter table public.chantiers enable row level security;
alter table public.products enable row level security;
alter table public.documents enable row level security;
alter table public.document_lines enable row level security;
alter table public.price_alerts enable row level security;

drop policy if exists "owner_all" on public.parties;
drop policy if exists "owner_all" on public.chantiers;
drop policy if exists "owner_all" on public.products;
drop policy if exists "owner_all" on public.documents;
drop policy if exists "owner_all" on public.document_lines;
drop policy if exists "owner_all" on public.price_alerts;

create policy "owner_all" on public.parties
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "owner_all" on public.chantiers
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "owner_all" on public.products
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "owner_all" on public.documents
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "owner_all" on public.document_lines
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "owner_all" on public.price_alerts
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;

drop policy if exists documents_own_all on storage.objects;
create policy documents_own_all on storage.objects
  for all to authenticated
  using (
    bucket_id = 'documents'
    and split_part(name, '/', 1) = auth.uid()::text
  )
  with check (
    bucket_id = 'documents'
    and split_part(name, '/', 1) = auth.uid()::text
  );
