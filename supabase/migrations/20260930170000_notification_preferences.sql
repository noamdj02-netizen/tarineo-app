-- Préférences de notification personnelles (par utilisateur).
create table if not exists public.notification_preferences (
  user_id uuid primary key references auth.users (id) on delete cascade,

  email_quotes boolean not null default true,
  email_invoices boolean not null default true,
  email_supplier_increases boolean not null default true,
  email_followups boolean not null default true,
  email_copilot boolean not null default true,
  email_projects boolean not null default true,

  in_app_quotes boolean not null default true,
  in_app_invoices boolean not null default true,
  in_app_supplier_increases boolean not null default true,
  in_app_followups boolean not null default true,
  in_app_copilot boolean not null default true,
  in_app_projects boolean not null default true,

  -- Détail événements (json flexible pour sous-options)
  event_prefs jsonb not null default '{}'::jsonb,

  supplier_threshold_pct numeric(5,2) not null default 5,
  daily_summary_enabled boolean not null default false,
  daily_summary_time text not null default '08:00',

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.notification_preferences enable row level security;

drop policy if exists "notification_preferences_owner" on public.notification_preferences;
create policy "notification_preferences_owner"
  on public.notification_preferences
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop trigger if exists notification_preferences_touch_updated_at on public.notification_preferences;
create trigger notification_preferences_touch_updated_at
  before update on public.notification_preferences
  for each row execute function public.touch_updated_at();
