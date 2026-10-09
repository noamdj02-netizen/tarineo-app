-- Contact commercial / interlocuteur enseigne (lu sur devis / BL / factures).
alter table public.parties
  add column if not exists contact_name text not null default '',
  add column if not exists contact_email text not null default '',
  add column if not exists contact_phone text not null default '';

comment on column public.parties.contact_name is 'Nom du commercial / interlocuteur (optionnel).';
comment on column public.parties.contact_email is 'E-mail du commercial (optionnel).';
comment on column public.parties.contact_phone is 'Téléphone du commercial (optionnel).';
