-- Idempotence des imports n8n / API intégrations (une clé par utilisateur).

create table if not exists public.integration_ingest_idempotency (
  user_id uuid not null references auth.users (id) on delete cascade,
  idempotency_key text not null check (char_length(idempotency_key) between 8 and 128),
  content_sha256 text not null,
  document_id uuid not null references public.documents (id) on delete cascade,
  response_json jsonb not null,
  created_at timestamptz not null default now(),
  primary key (user_id, idempotency_key)
);

create index if not exists integration_ingest_idempotency_document_idx
  on public.integration_ingest_idempotency (document_id);

alter table public.integration_ingest_idempotency enable row level security;

drop policy if exists integration_ingest_idempotency_select on public.integration_ingest_idempotency;
create policy integration_ingest_idempotency_select
  on public.integration_ingest_idempotency
  for select
  using (auth.uid() = user_id);
