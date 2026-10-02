-- Exports comptables : planification et historique

create table if not exists public.accounting_export_schedules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  enabled boolean not null default true,
  frequency text not null check (frequency in ('monthly', 'quarterly', 'yearly')),
  day_of_month int not null default 5 check (day_of_month between 1 and 28),
  invoice_kinds text[] not null default array['distributor']::text[],
  distributor_names text[] not null default '{}'::text[],
  format text not null default 'csv' check (format = 'csv'),
  email_to text,
  next_run_at timestamptz,
  last_run_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists accounting_export_schedules_due_idx
  on public.accounting_export_schedules (enabled, next_run_at)
  where enabled = true;

create table if not exists public.accounting_export_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  schedule_id uuid references public.accounting_export_schedules (id) on delete set null,
  trigger text not null check (trigger in ('manual', 'scheduled')),
  period_start date not null,
  period_end date not null,
  filters jsonb not null default '{}'::jsonb,
  row_count int not null default 0,
  file_path text,
  email_status text not null default 'skipped' check (email_status in ('sent', 'skipped', 'failed')),
  email_error text,
  created_at timestamptz not null default now()
);

create index if not exists accounting_export_runs_user_idx
  on public.accounting_export_runs (user_id, created_at desc);

alter table public.accounting_export_schedules enable row level security;
alter table public.accounting_export_runs enable row level security;

drop policy if exists accounting_export_schedules_owner on public.accounting_export_schedules;
create policy accounting_export_schedules_owner
  on public.accounting_export_schedules
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists accounting_export_runs_owner on public.accounting_export_runs;
create policy accounting_export_runs_owner
  on public.accounting_export_runs
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop trigger if exists accounting_export_schedules_touch on public.accounting_export_schedules;
create trigger accounting_export_schedules_touch
  before update on public.accounting_export_schedules
  for each row execute function public.touch_updated_at();
