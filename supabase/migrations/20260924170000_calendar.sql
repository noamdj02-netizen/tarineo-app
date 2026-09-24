-- Calendrier de l'accueil : événements créés dans Navpit + lien iCal privé (Google / Apple / Outlook).

create table public.calendar_events (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  project_id uuid references public.projects (id) on delete set null,
  title      text not null check (char_length(title) between 1 and 120),
  starts_at  timestamptz not null,
  ends_at    timestamptz,
  all_day    boolean not null default false,
  created_at timestamptz not null default now(),
  check (ends_at is null or ends_at >= starts_at)
);
create index calendar_events_user_idx on public.calendar_events (user_id, starts_at);

alter table public.calendar_events enable row level security;

create policy "owner_all" on public.calendar_events
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (
    user_id = (select auth.uid())
    and (
      project_id is null
      or exists (select 1 from public.projects p where p.id = project_id and p.user_id = (select auth.uid()))
    )
  );

-- Un seul lien iCal par personne. Le lien est secret : lu uniquement côté serveur.
create table public.calendar_feeds (
  user_id    uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  url        text not null check (char_length(url) <= 2000 and url ~ '^(https|webcal)://'),
  updated_at timestamptz not null default now()
);

create trigger calendar_feeds_touch_updated_at
before update on public.calendar_feeds
for each row execute function public.touch_updated_at();

alter table public.calendar_feeds enable row level security;

create policy "owner_all" on public.calendar_feeds
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
