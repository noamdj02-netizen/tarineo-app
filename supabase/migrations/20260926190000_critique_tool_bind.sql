-- Critique 5 axes sur les sites + identité officielle des connecteurs.

alter table public.projects
  add column if not exists audit_critique jsonb not null default '{}'::jsonb;

alter table public.tool_connections
  add column if not exists account_label text not null default '',
  add column if not exists bind_kind text not null default 'stay',
  add column if not exists config jsonb not null default '{}'::jsonb;
