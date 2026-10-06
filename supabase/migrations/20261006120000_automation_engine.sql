-- Automation engine (ADR 001) — définitions + exécutions + séquence relances
-- Appliquer avant le code lib/automation/*

-- ---------------------------------------------------------------------------
-- automation_definitions
-- ---------------------------------------------------------------------------
create table if not exists public.automation_definitions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  slug text not null check (slug in ('quote_followup', 'margin_below_target')),
  enabled boolean not null default false,
  config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, slug)
);

create index if not exists automation_definitions_user_enabled_idx
  on public.automation_definitions (user_id, slug)
  where enabled = true;

alter table public.automation_definitions enable row level security;

drop policy if exists automation_definitions_owner on public.automation_definitions;
create policy automation_definitions_owner
  on public.automation_definitions
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop trigger if exists automation_definitions_touch on public.automation_definitions;
create trigger automation_definitions_touch
  before update on public.automation_definitions
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- automation_executions
-- ---------------------------------------------------------------------------
create table if not exists public.automation_executions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  definition_id uuid references public.automation_definitions (id) on delete set null,
  slug text not null,
  status text not null check (status in ('started', 'completed', 'failed', 'skipped')),
  phase text not null default 'execute'
    check (phase in ('schedule', 'send', 'notify', 'evaluate', 'execute')),
  idempotency_key text not null,
  entity_type text not null default '',
  entity_id text not null default '',
  error text,
  metadata jsonb not null default '{}'::jsonb,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  unique (user_id, idempotency_key)
);

create index if not exists automation_executions_user_started_idx
  on public.automation_executions (user_id, started_at desc);

create index if not exists automation_executions_user_slug_idx
  on public.automation_executions (user_id, slug, started_at desc);

alter table public.automation_executions enable row level security;

drop policy if exists automation_executions_owner on public.automation_executions;
create policy automation_executions_owner
  on public.automation_executions
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Service role (cron) : pas de policy service — utiliser admin client avec filtre user_id explicite.

-- ---------------------------------------------------------------------------
-- follow_ups : numéro de séquence pour idempotence quote_followup:{docId}:{seq}
-- ---------------------------------------------------------------------------
alter table public.follow_ups
  add column if not exists sequence_number integer not null default 1;

comment on column public.follow_ups.sequence_number is
  'Relance n°1, 2… après envoi initial du devis. Voir docs/automation/quote-followup-due-to-scheduled.md';

-- Une seule relance active (scheduled ou sent) par document et par séquence
create unique index if not exists follow_ups_doc_sequence_active_uidx
  on public.follow_ups (user_id, document_id, sequence_number)
  where status in ('scheduled', 'sent');

-- ---------------------------------------------------------------------------
-- Seeds optionnels : définitions désactivées (le code peut aussi upsert au 1er accès)
-- ---------------------------------------------------------------------------
-- Pas de seed global : chaque user obtient ses rows au premier passage settings / onboarding.
