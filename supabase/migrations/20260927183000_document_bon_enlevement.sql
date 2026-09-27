-- Bon d’enlèvement : pièce client créée depuis un document importé.
alter table public.documents drop constraint if exists documents_kind_check;
alter table public.documents add constraint documents_kind_check
  check (kind in ('devis', 'facture', 'bon_commande', 'bl', 'bon_enlevement', 'autre'));
