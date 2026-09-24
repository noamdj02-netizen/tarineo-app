-- Abonnements Stripe : une ligne par utilisateur, écrite uniquement par le webhook (service role).
create table if not exists public.subscriptions (
  user_id                uuid primary key references auth.users (id) on delete cascade,
  stripe_customer_id     text unique,
  stripe_subscription_id text unique,
  plan                   text not null default 'free' check (plan in ('free', 'pro', 'founder')),
  status                 text not null default 'none',
  billing_interval       text check (billing_interval in ('month', 'year')),
  -- palier fidélité en cours : 0 = 1re année, 1 = 2e année, 2 = dès la 3e
  tier                   smallint not null default 0 check (tier between 0 and 2),
  started_at             timestamptz,
  current_period_end     timestamptz,
  cancel_at_period_end   boolean not null default false,
  updated_at             timestamptz not null default now()
);

alter table public.subscriptions enable row level security;

-- Lecture seule pour le propriétaire ; aucune policy d'écriture : seul le service role écrit.
drop policy if exists subscriptions_owner_read on public.subscriptions;
create policy subscriptions_owner_read on public.subscriptions
  for select using (user_id = auth.uid());

drop trigger if exists subscriptions_touch on public.subscriptions;
create trigger subscriptions_touch before update on public.subscriptions
  for each row execute function public.touch_updated_at();

-- Places Fondateur restantes, lisible par tous (y compris la page /prix publique).
create or replace function public.founder_seats_taken()
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::int from public.subscriptions where plan = 'founder';
$$;

grant execute on function public.founder_seats_taken() to anon, authenticated;
