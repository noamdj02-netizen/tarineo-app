-- Complète follow_ups : tentatives (anti double-envoi), updated_at, statut cancelled.
-- Ne remplace pas 20260928140000_follow_ups.sql.

alter table public.follow_ups
  add column if not exists attempt_number integer not null default 0;

alter table public.follow_ups
  add column if not exists updated_at timestamptz not null default now();

alter table public.follow_ups drop constraint if exists follow_ups_status_check;
alter table public.follow_ups add constraint follow_ups_status_check
  check (status in ('due', 'scheduled', 'sent', 'answered', 'done', 'cancelled'));

drop trigger if exists follow_ups_touch_updated_at on public.follow_ups;
create trigger follow_ups_touch_updated_at
before update on public.follow_ups
for each row execute function public.touch_updated_at();
