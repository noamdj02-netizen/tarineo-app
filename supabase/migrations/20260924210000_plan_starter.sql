-- Plan intermédiaire « starter » (formule Création 15 €/mois).

alter table public.subscriptions drop constraint if exists subscriptions_plan_check;

alter table public.subscriptions
  add constraint subscriptions_plan_check
  check (plan in ('free', 'starter', 'pro', 'founder'));
