-- Métadonnées de la prochaine action (carte projet) + blocage simple.
alter table public.projects
  add column if not exists next_due_date date,
  add column if not exists next_priority text
    check (next_priority is null or next_priority in ('faible', 'normale', 'elevee')),
  add column if not exists next_estimated_minutes integer
    check (next_estimated_minutes is null or (next_estimated_minutes > 0 and next_estimated_minutes <= 24 * 60)),
  add column if not exists blocked boolean not null default false,
  add column if not exists blocker_reason text not null default '';

comment on column public.projects.next_due_date is 'Deadline de la prochaine action (pas un calendrier complet).';
comment on column public.projects.next_priority is 'faible | normale | elevee';
comment on column public.projects.next_estimated_minutes is 'Durée estimée optionnelle de la prochaine action.';
comment on column public.projects.blocked is 'Projet bloqué (simple booléen).';
comment on column public.projects.blocker_reason is 'Raison courte du blocage.';
