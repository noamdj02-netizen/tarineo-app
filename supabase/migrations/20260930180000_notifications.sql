-- Notifications in-app + abonnements push web.
-- Isolation : RLS user_id (solo = organisation = user).

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  organization_id uuid not null references auth.users (id) on delete cascade,
  type text not null check (char_length(type) between 1 and 64),
  title text not null check (char_length(title) between 1 and 200),
  message text not null default '',
  priority text not null default 'normal'
    check (priority in ('critical', 'high', 'normal', 'low')),
  read boolean not null default false,
  archived boolean not null default false,
  action_url text not null default '',
  entity_type text not null default '',
  entity_id text not null default '',
  metadata jsonb not null default '{}'::jsonb,
  idempotency_key text not null,
  created_at timestamptz not null default now(),
  read_at timestamptz,
  unique (user_id, idempotency_key)
);

create index if not exists notifications_user_unread_idx
  on public.notifications (user_id, read, created_at desc)
  where archived = false;

create index if not exists notifications_user_type_idx
  on public.notifications (user_id, type, created_at desc);

alter table public.notifications enable row level security;

drop policy if exists "notifications_owner" on public.notifications;
create policy "notifications_owner"
  on public.notifications
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Abonnements Web Push (endpoint uniquement ; clés auth côté serveur).
create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  endpoint text not null,
  p256dh text not null,
  auth text not null,
  user_agent text not null default '',
  created_at timestamptz not null default now(),
  last_used_at timestamptz,
  unique (user_id, endpoint)
);

create index if not exists push_subscriptions_user_idx
  on public.push_subscriptions (user_id);

alter table public.push_subscriptions enable row level security;

drop policy if exists "push_subscriptions_owner" on public.push_subscriptions;
create policy "push_subscriptions_owner"
  on public.push_subscriptions
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Canaux push sur préférences existantes.
alter table public.notification_preferences
  add column if not exists push_quotes boolean not null default true,
  add column if not exists push_invoices boolean not null default true,
  add column if not exists push_supplier_increases boolean not null default true,
  add column if not exists push_followups boolean not null default true,
  add column if not exists push_copilot boolean not null default true,
  add column if not exists push_projects boolean not null default true,
  add column if not exists push_enabled boolean not null default false;
