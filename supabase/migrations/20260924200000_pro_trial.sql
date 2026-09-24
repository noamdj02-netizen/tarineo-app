-- Essai Pro 7 jours sans carte : démarrage à l'inscription, suppression du compte si non payé.

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
      current_period_end = now() + interval '7 days',
      tier = 0,
      updated_at = now()
    where user_id = uid;
  else
    insert into public.subscriptions (user_id, plan, status, started_at, current_period_end, tier)
    values (uid, 'pro', 'trialing', now(), now() + interval '7 days', 0);
  end if;
end;
$$;

grant execute on function public.start_pro_trial() to authenticated;

create or replace function public.enforce_pro_trial_expiry()
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  uid uuid := auth.uid();
  sub public.subscriptions%rowtype;
begin
  if uid is null then
    return;
  end if;

  select * into sub from public.subscriptions where user_id = uid;
  if not found then
    return;
  end if;
  if sub.status <> 'trialing' then
    return;
  end if;
  if sub.stripe_subscription_id is not null then
    return;
  end if;
  if sub.current_period_end is null or sub.current_period_end > now() then
    return;
  end if;

  delete from auth.users where id = uid;
end;
$$;

grant execute on function public.enforce_pro_trial_expiry() to authenticated;
