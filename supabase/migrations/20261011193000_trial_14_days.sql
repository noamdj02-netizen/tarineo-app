-- Offre en cours : l'essai Pro sans carte dure 14 jours (aligné sur PRO_TRIAL_DAYS).

create or replace function public.start_pro_trial()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  sub public.subscriptions%rowtype;
begin
  if uid is null then
    return;
  end if;

  select * into sub from public.subscriptions where user_id = uid;

  if found then
    if sub.plan = 'founder' or sub.stripe_subscription_id is not null then
      return;
    end if;
    if sub.status = 'active' then
      return;
    end if;
    if sub.status = 'trialing' then
      return;
    end if;

    update public.subscriptions
    set
      plan = 'pro',
      status = 'trialing',
      started_at = now(),
      current_period_end = now() + interval '14 days',
      tier = 0,
      updated_at = now()
    where user_id = uid;
  else
    insert into public.subscriptions (user_id, plan, status, started_at, current_period_end, tier)
    values (uid, 'pro', 'trialing', now(), now() + interval '14 days', 0);
  end if;
end;
$$;
