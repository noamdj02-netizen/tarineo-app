-- Relances : suivis sur documents existants. Pas de duplication de pièces.

create table if not exists public.follow_ups (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null default auth.uid() references auth.users (id) on delete cascade,
  document_id    uuid not null references public.documents (id) on delete cascade,
  chantier_id    uuid references public.chantiers (id) on delete set null,
  audience       text not null check (audience in ('client', 'fournisseur')),
  status         text not null default 'due' check (status in ('due', 'scheduled', 'sent', 'answered', 'done')),
  scheduled_at   timestamptz,
  last_action_at timestamptz,
  sent_at        timestamptz,
  to_email       text not null default '',
  subject        text not null default '',
  body           text not null default '',
  created_at     timestamptz not null default now()
);
create index if not exists follow_ups_user_idx on public.follow_ups (user_id, status, scheduled_at);
create index if not exists follow_ups_doc_idx on public.follow_ups (document_id);

alter table public.follow_ups enable row level security;

drop policy if exists "owner_all" on public.follow_ups;
create policy "owner_all" on public.follow_ups
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
