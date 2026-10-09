-- RLS hardening (NE PAS appliquer en prod sans revue + tests d'isolation).
-- Voir docs/tarineo-rls-security-audit.md
--
-- 1) Tables legacy Prisma / NextAuth (PascalCase) : RLS + retrait droits PostgREST anon/authenticated.
-- 2) Tables backend-only du repo : policies explicites « deny » pour le JWT utilisateur.
-- 3) Durcissement EXECUTE sur fonctions SECURITY DEFINER sensibles.

-- ─── Legacy / hors codebase actuel (si présentes sur le projet Supabase) ───
do $$
declare
  t text;
  legacy_tables text[] := array[
    '_prisma_migrations',
    'DistributorGoal',
    'waitlist_signups',
    'ClientQuoteLine',
    'ClientInvoice',
    'ClientInvoiceLine',
    'GenerationIA',
    'StripeWebhookEvent',
    'PromoFournisseur',
    'PromoFetchLog',
    'CompanyProfile',
    'DistributorLogo',
    'EnseignePersonnalisee',
    'PennylaneConnection',
    'Team',
    'TeamMember',
    'TeamInvitation',
    'Account',
    'Alert',
    'ClientQuote',
    'Document',
    'LineItem',
    'PriceHistory',
    'Session',
    'User',
    'VerificationToken'
  ];
begin
  foreach t in array legacy_tables loop
    if exists (
      select 1 from pg_tables
      where schemaname = 'public' and tablename = t
    ) then
      execute format('alter table public.%I enable row level security', t);
      execute format('revoke all on table public.%I from anon, authenticated', t);
      -- Aucune policy : deny par défaut pour anon/authenticated ; service_role bypass RLS.
    end if;
  end loop;
end $$;

-- ─── Backend-only (codebase TARINEO : accès via service role / API routes) ───

drop policy if exists api_keys_deny_authenticated on public.api_keys;
create policy api_keys_deny_authenticated
  on public.api_keys
  for all
  to authenticated
  using (false)
  with check (false);

drop policy if exists analytics_events_deny_authenticated on public.analytics_events;
create policy analytics_events_deny_authenticated
  on public.analytics_events
  for all
  to authenticated
  using (false)
  with check (false);

-- Idempotence ingest : écriture réservée au service role (route /api/integrations/ingest-document).
drop policy if exists integration_ingest_idempotency_deny_writes on public.integration_ingest_idempotency;
create policy integration_ingest_idempotency_deny_writes
  on public.integration_ingest_idempotency
  for insert
  to authenticated
  with check (false);

drop policy if exists integration_ingest_idempotency_deny_updates on public.integration_ingest_idempotency;
create policy integration_ingest_idempotency_deny_updates
  on public.integration_ingest_idempotency
  for update
  to authenticated
  using (false)
  with check (false);

drop policy if exists integration_ingest_idempotency_deny_delete on public.integration_ingest_idempotency;
create policy integration_ingest_idempotency_deny_delete
  on public.integration_ingest_idempotency
  for delete
  to authenticated
  using (false);

-- ─── Fonctions SECURITY DEFINER ───
revoke all on function public.start_pro_trial() from public, anon;
revoke all on function public.enforce_pro_trial_expiry() from public, anon;
grant execute on function public.start_pro_trial() to authenticated;
grant execute on function public.enforce_pro_trial_expiry() to authenticated;

-- founder_seats_taken : agrégat public pour /prix — conserver anon + authenticated.
revoke all on function public.founder_seats_taken() from public;
grant execute on function public.founder_seats_taken() to anon, authenticated;
