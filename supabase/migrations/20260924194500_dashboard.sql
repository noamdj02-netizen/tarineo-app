-- Tableau de bord accueil : post-its + disposition (json par utilisateur).
create table public.user_dashboard (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  layout     jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.user_dashboard enable row level security;

create policy "user_dashboard_select_own"
  on public.user_dashboard for select
  using (auth.uid() = user_id);

create policy "user_dashboard_insert_own"
  on public.user_dashboard for insert
  with check (auth.uid() = user_id);

create policy "user_dashboard_update_own"
  on public.user_dashboard for update
  using (auth.uid() = user_id);

create policy "user_dashboard_delete_own"
  on public.user_dashboard for delete
  using (auth.uid() = user_id);
