-- Journal d’événements pour l’admin Founder Analytics.
-- Écrit uniquement par le service role (API / serveur). Personne ne lit ça depuis le produit.

create table public.analytics_events (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  user_id     uuid references auth.users (id) on delete set null,
  session_id  text not null,
  feature     text not null default '',
  project_id  uuid,
  plan        text not null default '',
  path        text not null default '',
  properties  jsonb not null default '{}'::jsonb,
  duration_ms integer,
  created_at  timestamptz not null default now()
);

create index analytics_events_created_idx on public.analytics_events (created_at desc);
create index analytics_events_name_idx on public.analytics_events (name, created_at desc);
create index analytics_events_user_idx on public.analytics_events (user_id, created_at desc);
create index analytics_events_session_idx on public.analytics_events (session_id, created_at);

alter table public.analytics_events enable row level security;
