# TARINEO RLS Security Audit

Projet Supabase : **tarineo** (`qnsalgbohdqetbporlcd`).  
Date : **7 octobre 2026**.  
Périmètre : repository `tarineo-app` + alerte Supabase `rls_disabled_in_public`.

> **Ne pas appliquer la migration `20261007160000_rls_hardening_legacy_and_backend_only.sql` en production sans validation manuelle et tests d’isolation USER A / USER B.**

---

## Executive Summary

- Le **code applicatif actuel** (Next.js) s’appuie sur **Supabase Auth** (`auth.users.id` = `auth.uid()`) et un modèle **solo** : une ligne métier = un `user_id`. Il n’y a **pas** de modèle Team multi-utilisateur dans les migrations de ce repo.
- L’alerte Supabase liste surtout des tables **PascalCase / Prisma / NextAuth** (`ClientInvoice`, `Team`, `User`, …) **absentes des migrations** de ce dépôt. Elles sont très probablement des **reliquats** d’un schéma antérieur encore présentes sur la base distante. Tant qu’elles restent dans `public` **sans RLS**, PostgREST peut les exposer → **risque critique**.
- Les tables **snake_case** créées par `supabase/migrations/` ont en grande majorité **RLS + policies `owner_all`** ou lecture seule contrôlée. Points à durcir : tables **backend-only** signalées « RLS sans policy » (comportement deny par défaut, mais à documenter), et **fonctions SECURITY DEFINER** appelables par les clients.

---

## Current Risks

| Niveau | Risque |
|--------|--------|
| 🔴 CRITICAL | 17 tables `public` sans RLS (legacy Prisma / waitlist / Stripe / Pennylane / Team…) si toujours présentes sur le projet |
| 🔴 CRITICAL | `PennylaneConnection`, tokens, `StripeWebhookEvent` lisibles en écriture si RLS off |
| 🟠 HIGH | `enforce_pro_trial_expiry()` : SECURITY DEFINER + `DELETE FROM auth.users` (limité à `auth.uid()`, mais surface RPC à surveiller) |
| 🟠 HIGH | Absence de tests automatisés d’isolation cross-user sur l’ensemble des tables métier |
| 🟡 MEDIUM | `vendor_document_profiles` : lecture `USING (true)` pour tout `authenticated` (catalogue global — volontaire) |
| 🟡 MEDIUM | Advisor « RLS enabled, no policy » sur `api_keys`, `analytics_events` (deny implicite ; migration propose deny explicite) |
| 🟢 OK | Graphe métier (`documents`, `document_lines`, `company_profiles`, …) : policies `user_id = auth.uid()` |

---

## Authentication Model

- **Frontend / Server Components / Server Actions** : `createClient()` (`@supabase/ssr`) avec **anon key** + cookies session → JWT `authenticated`.
- **Backend** (webhooks Stripe, cron, ingest n8n, MCP, emails, automations) : `createAdminClient()` avec **service role** → **bypass RLS**.
- **API keys intégrations** : `lib/integrations/api-key-auth.ts` résout `user_id` puis opère en **service role** (`ingest-document`).
- **Pas de `teamId` dans le modèle métier actuel** : `notifications.organization_id` est documenté comme alias du même utilisateur (solo).

---

## Ownership Model

| Pattern | Tables |
|---------|--------|
| `user_id = auth.uid()` | `parties`, `chantiers`, `products`, `documents`, `document_lines`, `price_alerts`, `company_profiles`, `follow_ups`, `notifications`, `tool_connections`, … |
| Parent `projects.user_id` | `project_features`, `project_tasks`, `project_log` |
| `project_id` + `user_id` | `project_notes`, `project_assets`, `project_schemas` |
| Lecture seule propriétaire | `subscriptions` (SELECT only ; écriture webhook service role) |
| Catalogue global | `vendor_document_profiles` (SELECT all authenticated) |
| Backend-only (service role) | `api_keys`, `analytics_events`, écritures `integration_ingest_idempotency` |

**Équivalent fonctionnel des tables alertées :**

| Alerte Supabase | Dans ce repo |
|-----------------|--------------|
| `CompanyProfile` | `company_profiles` (RLS OK) |
| `ClientInvoice` / `ClientQuote*` / `LineItem` | `documents` + `document_lines` (RLS OK) |
| `Team` / `TeamMember` | Non utilisé dans le code actuel |
| `StripeWebhookEvent` | `lib/billing/stripe-events.ts` (admin ; pas de table dans migrations récentes) |
| `PennylaneConnection` | Non référencé dans le repo |

---

## Table-by-Table Analysis (alerte Supabase — 17 tables)

Classification recommandée pour chaque table **si elle existe encore** sur la base :

| Table | Classe | Lecture | Écriture | Owner | Frontend | Policy recommandée |
|-------|--------|---------|----------|-------|----------|-------------------|
| `_prisma_migrations` | SYSTEM_ONLY | — | — | — | Non | RLS + REVOKE anon/authenticated ; aucune policy |
| `DistributorGoal` | BACKEND_ONLY | Service | Service | N/A | Non | Idem |
| `waitlist_signups` | BACKEND_ONLY ou PUBLIC insert | Selon produit | Service | email | Landing ? | RLS ; INSERT contrôlé via API route uniquement |
| `ClientQuoteLine` | OWNER_ONLY (legacy) | User lié | User | relation legacy | Non si déprécié | RLS deny + migrer vers `document_lines` |
| `ClientInvoice` | OWNER_ONLY | User | User | legacy | Non | RLS deny ou policies via FK user |
| `ClientInvoiceLine` | OWNER_ONLY | idem | idem | legacy | Non | idem |
| `GenerationIA` | BACKEND_ONLY | Service | Service | user_id si colonne | Non | RLS deny client |
| `StripeWebhookEvent` | BACKEND_ONLY | Service | Service | — | **Jamais** | RLS + REVOKE |
| `PromoFournisseur` / `PromoFetchLog` | BACKEND_ONLY | Service | Service | — | Non | RLS deny |
| `CompanyProfile` | OWNER_ONLY | legacy | legacy | user | Remplacé par `company_profiles` | Fermer ou migrer données |
| `DistributorLogo` | AUTHENTICATED read? | catalogue | Service | — | Peut-être | SELECT contrôlé ou storage public |
| `EnseignePersonnalisee` | OWNER_ONLY | user | user | user_id | Si encore UI | Policies user_id |
| `PennylaneConnection` | BACKEND_ONLY | **Secrets** | Service | user_id | Non | RLS deny + API serveur |
| `Team` / `TeamMember` / `TeamInvitation` | TEAM_ONLY | membres | owner | ownerId | Futur | Policies join ; **non implémenté dans repo** |

Détail par table : voir migration proposée (bloc `legacy_tables`) — **ne pas activer RLS sans confirmer qu’aucun job legacy ne lit ces tables via JWT utilisateur**.

---

## Tables du repo (snake_case) — synthèse

| Table | Classe | RLS | Policies | Risque |
|-------|--------|-----|----------|--------|
| `documents` | OWNER_ONLY | ✅ | owner_all | 🟢 |
| `document_lines` | OWNER_ONLY | ✅ | owner_all | 🟢 |
| `company_profiles` | OWNER_ONLY | ✅ | owner_all | 🟢 |
| `subscriptions` | OWNER_ONLY read | ✅ | SELECT owner | 🟢 (write service role) |
| `api_keys` | BACKEND_ONLY | ✅ | **aucune** → deny | 🟡 → deny explicite |
| `analytics_events` | BACKEND_ONLY | ✅ | **aucune** | 🟡 |
| `integration_ingest_idempotency` | OWNER read / backend write | ✅ | SELECT own | 🟡 writes service role |
| `vendor_document_profiles` | AUTHENTICATED read | ✅ | SELECT true | 🟡 (volontaire) |
| `hero_library` | AUTHENTICATED read | ✅ | read | 🟢 |

Références code : `lib/metier/queries.ts`, `lib/mcp/data.ts` (api_keys admin), `lib/billing/stripe-events.ts`, `lib/integrations/ingest-document.ts`.

---

## Team / Organization Security

- **État actuel** : pas de tables `Team*` dans les migrations TARINEO. `organization_id` sur `notifications` = même utilisateur.
- **Risque BOLA/IDOR team** : sur les tables legacy `Team*` si encore exposées sans RLS.
- **Recommandation** : fermer l’accès PostgREST aux tables Team legacy tant qu’un modèle équipe n’est pas spécifié dans ce repo.

---

## Stripe Security

- Webhook : `lib/billing/stripe-events.ts` + Edge function `supabase/functions/stripe-webhook` → **service role**.
- Table `StripeWebhookEvent` (legacy) : **BACKEND_ONLY**, ne doit pas être lisible par JWT client.

---

## Pennylane Security

- Aucune référence active dans le code à `PennylaneConnection` (grep repo). Traiter comme **donnée sensible legacy** : RLS + REVOKE.

---

## SECURITY DEFINER Functions

| Fonction | Pourquoi DEFINER | Appel client | Risque | Recommandation |
|----------|------------------|--------------|--------|----------------|
| `start_pro_trial()` | Écrire `subscriptions` sans policy INSERT | `lib/billing/trial.ts` RPC | Élévation limitée à son propre `user_id` | REVOKE anon ; garder authenticated |
| `enforce_pro_trial_expiry()` | Supprimer user expiré | idem | **Suppression compte** via RPC | REVOKE anon ; audit logique ; ne pas exposer à anon |
| `founder_seats_taken()` | COUNT public | `/prix`, checkout | Fuite métier limitée (count) | OK anon + authenticated |

---

## IDOR / BOLA Analysis

| Scénario | Statut dans le code actuel |
|----------|---------------------------|
| User B lit `documents` de A via PostgREST | Bloqué si policies actives |
| User B lit `company_profiles` de A | Bloqué |
| User B lit legacy `ClientInvoice` | **🔴 Possible si RLS off** |
| User B lit `PennylaneConnection` de A | **🔴 Possible si RLS off** |
| Membre team A → données team B | N/A (pas de team dans repo) |

**Tests d’isolation non exécutés dans cette livraison** → ne pas déclarer la prod sécurisée.

---

## Recommended SQL

Fichier préparé (non appliqué) :

`supabase/migrations/20261007160000_rls_hardening_legacy_and_backend_only.sql`

- Active RLS + `REVOKE` sur tables legacy **si elles existent**.
- Policies `USING (false)` pour `api_keys` / `analytics_events` côté `authenticated`.
- Deny INSERT/UPDATE/DELETE sur `integration_ingest_idempotency` pour `authenticated`.
- REVOKE `EXECUTE` sur `start_pro_trial` / `enforce_pro_trial_expiry` pour `anon`.

**Après migration :** vérifier que `npm run build`, webhooks Stripe, cron exports, ingest n8n et `lib/billing/trial.ts` fonctionnent.

---

## Verification Plan

1. Appliquer migration sur **branche Supabase staging** (ou `supabase db push` local).
2. Supabase Dashboard → **Security Advisor** : viser `rls_disabled_in_public = 0`.
3. Tests manuels / script :
   - USER A et USER B avec anon key + JWT respectifs.
   - `select * from documents` → seulement ses lignes.
   - USER B tente `select` sur id document A → 0 rows.
4. **Service role** : webhook Stripe test, `POST /api/integrations/ingest-document`, cron accounting.
5. RPC : `start_pro_trial` connecté ; `founder_seats_taken` depuis `/prix` non connecté.

---

## Remaining Risks

- Données legacy non migrées vers `documents` / `company_profiles`.
- Pas de couverture E2E RLS automatisée.
- `enforce_pro_trial_expiry` reste une surface sensible (comportement métier voulu).
- Advisor peut encore signaler « RLS enabled no policy » sur tables legacy verrouillées (acceptable si deny voulu).

---

## Phase 2 — Pre-Migration Validation

**Méthode :** grep exhaustif sur le dépôt `tarineo-app` (oct. 2026) — imports, `.from("…")`, `.rpc("…")`, `supabase/migrations/`, Edge Functions, scripts, tests. **Aucune requête exécutée sur le projet Supabase `qnsalgbohdqetbporlcd`.**

### Pourquoi ces tables existent encore sur Supabase

- **Aucune** des 17 tables PascalCase n’apparaît dans `supabase/migrations/` (première migration : `20260924120000_init.sql` → schéma snake_case Navpit/TARINEO).
- **Aucun** `schema.prisma`, `@prisma/client`, `PrismaClient`, `next-auth`, `PrismaAdapter` dans le repo.
- **Hypothèse validée par le code :** schéma **Prisma + NextAuth** déployé autrefois sur le **même** projet Supabase, jamais supprimé en base lors du passage à Supabase Auth + migrations SQL actuelles.
- Le code actuel ne référence **aucun** nom de table PascalCase dans les requêtes Supabase.

### 1. Inventaire des 17 tables (usage code)

Légende : **fichiers** = hors `docs/` et hors `20261007160000_*.sql` sauf mention.

#### `_prisma_migrations`
```
├── utilisée dans le code ? NO
├── fichiers concernés : (aucun)
├── routes concernées : —
├── cron/webhook concerné ? NO
├── frontend concerné ? NO
├── backend concerné ? NO
├── données encore utiles ? Non pour l’app (table interne Prisma)
└── legacy morte ? YES (pour TARINEO actuel)
```

#### `DistributorGoal`
```
├── utilisée dans le code ? NO (table SQL)
├── fichiers concernés : objectifs enseignes → `company_profiles.settings` / `lib/settings/workspace-settings.ts`, `DistributorGoalsForm`, `saveDistributorGoalsAction`
├── routes : `/fournisseurs`, `/parametres` (actions)
├── cron/webhook ? NO
├── frontend ? UI objectifs (pas cette table)
├── backend ? JSONB `company_profiles`, pas `DistributorGoal`
├── données utiles ? Possiblement sur DB legacy si non migrées
└── legacy morte ? YES (fonctionnalité remappée)
```

#### `waitlist_signups`
```
├── utilisée dans le code ? NO
├── fichiers concernés : waitlist produit = `user_metadata.integration_waitlist` (`integrations-board.tsx`, `integrations-notifications-actions.ts`)
├── routes : `/parametres/integrations` (waitlist intégrations)
├── cron/webhook ? NO
├── frontend ? Pas de formulaire landing vers cette table
├── backend ? NO
├── données utiles ? Emails marketing éventuels **uniquement en base** (à vérifier sur prod)
└── legacy morte ? INCERTAIN (table possiblement orpheline avec données ; pas de code actuel)
```

#### `ClientQuoteLine` / `ClientQuote` / `ClientInvoice` / `ClientInvoiceLine`
```
├── utilisée dans le code ? NO (tables SQL)
├── fichiers concernés : devis/factures → `documents`, `document_lines` (`lib/metier/queries.ts`) ; démo landing `downloadClientQuoteDemo` (PDF, pas SQL)
├── routes : `/pieces/*`, `/achats/*`, API métier
├── cron/webhook ? follow-ups / exports sur `documents`, `follow_ups`
├── frontend ? `document-*`, pas ClientInvoice
├── backend ? `documents` + `document_lines` + `company_profiles`
├── données utiles ? Historique possible en legacy non migré
└── legacy morte ? YES pour le runtime actuel (remplacé par graphe métier)
```

#### `GenerationIA`
```
├── utilisée dans le code ? NO
├── fichiers concernés : IA → Anthropic côté serveur (`lib/assistant/*`, `lib/metier/document-agent/*`), pas table SQL
├── routes : `/api/assistant`, extract documents
├── cron/webhook ? NO
├── frontend ? Copilote / extract
├── backend ? Pas de persistance dans cette table
├── données utiles ? Logs IA historiques éventuels en DB
└── legacy morte ? YES (aucune référence) — données historiques à archiver avant DROP futur
```

#### `StripeWebhookEvent`
```
├── utilisée dans le code ? NO
├── fichiers concernés : Stripe → `lib/billing/stripe-events.ts`, `supabase/functions/stripe-webhook/index.ts` → table `subscriptions` uniquement
├── routes : webhook Stripe (service role)
├── cron/webhook ? Stripe webhook
├── frontend ? NO
├── backend ? `subscriptions` upsert via admin
├── données utiles ? Audit idempotence webhooks si table encore alimentée par un ancien worker
└── legacy morte ? YES pour le code actuel
```

#### `PromoFournisseur` / `PromoFetchLog`
```
├── utilisée dans le code ? NO
├── fichiers concernés : promos = contenu blog / marketing uniquement
├── routes : —
├── cron/webhook ? NO
├── frontend/backend ? NO
├── données utiles ? Peu probable pour le produit actuel
└── legacy morte ? YES
```

#### `CompanyProfile` (PascalCase)
```
├── utilisée dans le code ? NO (table SQL)
├── fichiers concernés : type TS `CompanyProfile` → table `company_profiles` (`getCompanyProfile`, `saveCompanyProfile`)
├── routes : `/parametres/entreprise`, `/entreprise`, PDF pièces
├── cron/webhook ? exports compta lisent `company_profiles` via admin
├── frontend ? `entreprise-form`, onboarding
├── backend ? `company_profiles` (RLS owner)
├── données utiles ? Oui si doublon legacy non migré vers `company_profiles`
└── legacy morte ? YES pour le code (remplacée par `company_profiles`)
```

#### `DistributorLogo` / `EnseignePersonnalisee`
```
├── utilisée dans le code ? NO
├── fichiers concernés : enseignes → `parties`, `vendor_document_profiles`, `SupplierLogo` UI, `vendor-key.ts`
├── routes : `/fournisseurs`, lecture documents
├── cron/webhook ? NO
├── frontend ? logos via logo.dev / UI, pas ces tables
├── backend ? `vendor_document_profiles` (lecture catalogue)
├── données utiles ? Assets legacy éventuels
└── legacy morte ? YES
```

#### `PennylaneConnection`
```
├── utilisée dans le code ? NO
├── fichiers concernés : Pennylane = entrée **waitlist** catalogue (`integrations-catalog.ts`, `integrations-board.tsx`)
├── routes : `/parametres/integrations`
├── cron/webhook ? NO
├── frontend ? Carte « à venir »
├── backend ? Export CSV compta (`accounting_export_*`), pas OAuth Pennylane
├── données utiles ? Tokens OAuth **critiques** si lignes présentes en DB
└── legacy morte ? YES pour le code — **données sensibles à traiter avant DROP**
```

#### `Team` / `TeamMember` / `TeamInvitation`
```
├── utilisée dans le code ? NO
├── fichiers concernés : `projects.team` = tableau texte sur projet Navpit, pas table Team SQL
├── routes : projets Navpit (hors cœur métier BTP)
├── cron/webhook ? NO
├── frontend ? NO multi-tenant
├── backend ? isolation `user_id` partout
├── données utiles ? Invitations équipe legacy si existantes
└── legacy morte ? YES (modèle team non implémenté)
```

### 2. Migrations historiques (repo)

| Table legacy | CREATE dans repo | ALTER / DROP dans repo | Équivalent actuel |
|--------------|------------------|-------------------------|-------------------|
| Les 17 tables | **Aucune** | **Aucune** | Voir colonne équivalent ci-dessus |
| Métier factures/devis | — | — | `20260927180000_metier_graph.sql` → `documents`, `document_lines` |
| Profil entreprise | — | — | `20260927190000_company_profiles.sql` → `company_profiles` |
| Abonnements | — | — | `20260924190000_subscriptions.sql` |
| Essai Pro RPC | — | — | `20260924200000_pro_trial.sql` |

**Conclusion :** les 17 tables ne sont pas « oubliées » dans les migrations récentes — elles proviennent d’un **autre cycle de vie du schéma** (Prisma), toujours présent physiquement sur Supabase.

### 3. Prisma / NextAuth legacy

| Recherche | Résultat |
|-----------|----------|
| `PrismaClient` / `@prisma/client` | **Absent** |
| `next-auth` / `NextAuth` / `PrismaAdapter` | **Absent** |
| Auth actuelle | **Supabase Auth** (`auth.users`), session cookie, `lib/supabase/middleware.ts` |
| Tables `Account`, `Session`, `VerificationToken`, `User` | Listées dans la migration proposée ; **0 référence** dans le code |

**Verdict :** `Prisma/NextAuth legacy = probablement supprimable côté applicatif` — **ne rien DROP** tant que l’inventaire des lignes en prod et une sauvegarde ne sont pas faits.

### 4. Accès directs Supabase (tables sensibles demandées)

| Table demandée | `.from("…")` dans le repo |
|----------------|---------------------------|
| `ClientInvoice` | **NON** |
| `ClientInvoiceLine` | **NON** |
| `ClientQuoteLine` | **NON** |
| `CompanyProfile` | **NON** (seulement `company_profiles`) |
| `Team` / `TeamMember` / `TeamInvitation` | **NON** |
| `PennylaneConnection` | **NON** |
| `StripeWebhookEvent` | **NON** |

**RPC :** `founder_seats_taken`, `start_pro_trial`, `enforce_pro_trial_expiry` uniquement (`lib/billing/trial.ts`, checkout, abonnement, middleware).

### 5. Revue statement par statement — `20261007160000_rls_hardening_legacy_and_backend_only.sql`

| Statement | Objectif | Impact |
|-----------|----------|--------|
| `DO $$ … legacy_tables` : `ENABLE ROW LEVEL SECURITY` | Fermer l’accès PostgREST anon/auth sur tables legacy | Frontend : **aucun** (non utilisées). Backend actuel : **aucun** (service role bypass). Cron/webhooks : **aucun** sur ces tables. **Risque :** outil externe / ancien déploiement non versionné ici qui lirait encore via JWT. |
| `REVOKE ALL … FROM anon, authenticated` | Retirer grants table-level | Même impact ; renforce le deny. |
| `api_keys_deny_authenticated` (`USING false`) | Interdire JWT sur clés API | Frontend : **aucun** (API `/api/account/api-keys` → `lib/mcp/data.ts` **admin**). Backend : **OK** si `SUPABASE_SERVICE_ROLE_KEY` présent. |
| `analytics_events_deny_authenticated` | Interdire JWT sur analytics | `lib/analytics/track.ts` utilise **admin** → **OK**. `lib/admin/queries.ts` idem. |
| `integration_ingest_idempotency_deny_*` (insert/update/delete) | Réserver écritures au service role | `lib/integrations/ingest-idempotency.ts` : **100 % admin** → **OK**. Policy SELECT existante inchangée (non utilisée par le code actuel). |
| `REVOKE … start_pro_trial / enforce_pro_trial_expiry FROM anon` | Empêcher RPC trial sans session | Inscription anonyme : **pas d’appel** ; `settle-session` = user **authenticated** → **OK**. |
| `GRANT EXECUTE … TO authenticated` (trial) | Conserver essai 7j | Middleware appelle `enforceProTrialExpiry` avec client session → **OK**. |
| `founder_seats_taken` grant anon+auth | Page `/prix` publique | `app/(app)/abonnement/page.tsx`, checkout founder → **OK**. |

**Défaut relevé en Phase 2 :** `drop policy … integration_ingest_idempotency_deny_writes` dupliqué — **corrigé en Phase 3** (voir § Phase 3).

**`waitlist_signups` dans le bloc legacy :** le durcissement **ne casse pas** le waitlist produit actuel (metadata user). **Risque** uniquement si un **ancien** formulaire public écrivait encore dans cette table via anon key — **non trouvé dans ce repo** → vérifier sur prod (logs, anciennes URLs, n8n).

### 6. Backend-only et service role

`lib/supabase/admin.ts` documente explicitement : **service role ignore RLS**.

| Flux | Client | Tables touchées |
|------|--------|-----------------|
| Stripe webhook | admin (Edge + `stripe-events.ts`) | `subscriptions` |
| Analytics | admin | `analytics_events` |
| API keys MCP | admin | `api_keys` |
| Ingest n8n | admin | `documents`, `integration_ingest_idempotency` |
| Cron exports / relances | admin | `accounting_export_*`, `follow_ups`, `documents` |
| Automations | admin + user RLS selon handler | `automation_*`, `follow_ups` |

**Condition :** `SUPABASE_SERVICE_ROLE_KEY` doit rester **serveur uniquement** (Vercel env, Edge secrets). Si un jour le front appelait PostgREST sur `api_keys` avec anon key, la policy deny **casserait** cet usage — **aucun tel appel dans le repo**.

### 7. `waitlist_signups` — synthèse

| Canal | Utilise la table ? |
|-------|-------------------|
| Landing v2 | **NON** |
| Inscription auth | **NON** (Supabase Auth) |
| API routes | **NON** |
| Email / admin | **NON** |
| Waitlist intégrations ERP | **NON** (`integration_waitlist` metadata) |

**Recommandation pré-staging :** sur prod, `SELECT count(*) FROM waitlist_signups` + recherche d’anciennes routes hors repo. Si count > 0 : exporter CSV avant RLS. **Ne pas** ouvrir INSERT public sans policy dédiée.

### 8. Fonctions SECURITY DEFINER (proposition, non appliquée)

| Fonction | Appelée où | Par qui | RPC PostgREST | DEFINER nécessaire ? | `auth.uid()` | Abus |
|----------|------------|---------|---------------|----------------------|--------------|------|
| `start_pro_trial()` | `lib/auth/settle-session.ts` | Session **authenticated** post-signup | Oui | Oui (pas de policy INSERT sur `subscriptions`) | Oui, écrit pour `uid` | Faible : upgrade trial sur son compte |
| `enforce_pro_trial_expiry()` | `lib/supabase/middleware.ts` | Chaque requête authentifiée | Oui | Oui (`DELETE auth.users`) | Oui, supprime **son** uid | Moyen : auto-suppression compte trial expiré (voulu) |
| `founder_seats_taken()` | `/prix`, checkout founder | anon + auth | Oui | Oui (COUNT global) | N/A | Faible : fuite volume founders |

**Correction proposée (staging) :** conserver DEFINER ; **REVOKE anon** sur les deux fonctions trial (déjà dans la migration) ; option future : déplacer trial en Server Action admin-only.

### 9. Legacy vs CURRENT (coexistence)

```text
LEGACY (sur Supabase, hors repo)          CURRENT TARINEO (code + migrations)
────────────────────────────────          ───────────────────────────────────
User (Prisma)                             auth.users (Supabase Auth)
Account, Session, VerificationToken       (non utilisés)
Team, TeamMember, TeamInvitation          (non utilisés — solo user_id)
CompanyProfile                            company_profiles
ClientQuote / ClientInvoice / *Line*      documents + document_lines
StripeWebhookEvent                        (aucune table — webhook → subscriptions)
PennylaneConnection                       waitlist UI seulement
DistributorGoal, Promo*, GenerationIA     JSONB settings / pas de table / Anthropic
```

**Coexistence :** les deux schémas peuvent coexister **dans PostgreSQL** ; seul le **schéma CURRENT** est alimenté par l’application déployée. Le legacy reste une **surface d’attaque** tant que RLS est off.

**Note :** `client_quotes` / `client_invoices` / `line_items` **n’existent pas** comme tables dans le repo — utiliser `documents` / `document_lines` pour les tests.

### 10. Protocole de tests A/B (à exécuter sur staging uniquement)

Prérequis : deux comptes `USER_A`, `USER_B` ; client Supabase avec JWT de chaque user (ou UI + deux navigateurs).

Pour chaque ressource : A crée ; B tente GET / UPDATE / DELETE via Supabase client ou UI.

| Ressource | Table réelle | Résultat attendu pour B |
|-----------|--------------|-------------------------|
| Document métier | `documents` | DENIED / 0 rows |
| Lignes | `document_lines` | DENIED |
| Profil entreprise | `company_profiles` | DENIED |
| Notifications | `notifications` | DENIED |
| Automations | `automation_definitions` | DENIED |
| Team | *(non utilisé)* | N/A — pas de tests team |

**Backend (après migration) :** smoke test Stripe test mode, `GET /api/cron/accounting-exports` avec `CRON_SECRET`, ingest document avec clé API, `founder_seats_taken` en anon sur `/prix`.

---

## Résumé demandé (Phase 1)

```text
🔴 CRITICAL : tables legacy public sans RLS (17 signalées par Supabase si toujours présentes)
🟠 HIGH     : legacy secrets (Pennylane, Stripe events) ; RPC trial expiry ; pas de tests isolation
🟡 MEDIUM   : advisor « no policy » sur backend-only ; catalogue vendor global
🟢 OK       : graphe métier snake_case du repo (documents, company_profiles, …)

Tables analysées (repo + alerte) : ~40
Tables RLS disabled (alerte)     : 17 (legacy, hors migrations actuelles)
Tables RLS sans policies (repo)  : 2 principales (api_keys, analytics_events) + idempotency partiel
Policies à créer (migration)     : ~8 (+ RLS enable legacy)
Functions SECURITY DEFINER à corriger : 2 (revoke anon) ; 1 OK (founder_seats_taken)
IDOR trouvés (code actuel)       : 0 sur tables migrées ; **non vérifié en test**
Cross-user risks               : **élevé sur tables legacy non migrées**
Cross-team risks               : N/A dans repo actuel

Production safe: NO (migration non appliquée + tests USER A/B non réalisés)
```

### Bilan Phase 2 — Pre-Migration Validation

```text
🔴 TABLES LEGACY RÉELLEMENT UTILISÉES PAR LE CODE ACTUEL : 0 / 17
🟠 TABLES LEGACY INCERTAINES (données prod possibles, 0 ref code) : 2
      → waitlist_signups, GenerationIA (logs / emails historiques)
🟢 TABLES LEGACY CONFIRMÉES INUTILISÉES (côté app) : 15 / 17

🔴 RISQUES DE RÉGRESSION MIGRATION (bloc repo actuel) : 1
      → waitlist_signups si un flux hors-repo écrivait encore via anon
🟠 POINTS À VÉRIFIER AVANT STAGING : 4
      → COUNT + export waitlist_signups sur prod
      → Vérifier lignes CompanyProfile / Client* à migrer ou archiver
      → Confirmer SUPABASE_SERVICE_ROLE_KEY sur Vercel + Edge
      → Corriger doublon DROP policy dans le fichier SQL
🟢 MIGRATION PRÊTE POUR STAGING : PARTIAL
      → Bloc legacy + deny api_keys/analytics/ingest : OK si service role OK
      → Valider waitlist_signups sur prod avant prod

Production deployment:
→ DO NOT DEPLOY
```

---

## Phase 3 — Pre-Staging Validation

**Date :** 7 octobre 2026. **Lecture seule** sur le projet Supabase `qnsalgbohdqetbporlcd` (COUNT + schéma OpenAPI). **Aucune migration appliquée**, aucune donnée modifiée.

### 1. Migration SQL corrigée et revue

**Fichier :** `supabase/migrations/20261007160000_rls_hardening_legacy_and_backend_only.sql`

| Contrôle | Résultat |
|----------|----------|
| `DROP POLICY` dupliqué `integration_ingest_idempotency_deny_writes` | **Corrigé** (une seule ligne) |
| Autres statements dupliqués | **Aucun** |
| Policies créées deux fois sans `DROP IF EXISTS` | **Non** — chaque deny policy précédée de `drop policy if exists` |
| `DROP TABLE` / `DELETE` / `TRUNCATE` | **0** |
| Modification des policies `owner_all` (documents, etc.) | **Non** |
| Ordre d’exécution | Legacy `DO` → deny backend-only → `REVOKE`/`GRANT` RPC (OK) |
| Idempotence | Ré-exécution safe pour policies et bloc `IF EXISTS` legacy |

**Tables CURRENT touchées par cette migration :** uniquement `api_keys`, `analytics_events`, `integration_ingest_idempotency` (ajout de deny explicites côté `authenticated`). **Pas** de changement sur `documents`, `document_lines`, `company_profiles`, `subscriptions`, `notifications`, `automation_*`.

### 2. `waitlist_signups` (prod, lecture seule)

| Métrique | Valeur |
|----------|--------|
| Lignes (`COUNT`) | **0** |
| Colonnes (OpenAPI PostgREST) | `id`, `email`, `createdAt` |
| Activité min/max `createdAt` | **N/A** (table vide) |
| Code repo référençant la table | **Aucun** |

**Verdict :** table **vide** sur le projet actuel → **legacy probable**, safe pour RLS + REVOKE dans le bloc legacy (aucun flux app actuel ; waitlist produit = `integration_waitlist` en metadata user).

### 3. `GenerationIA` (prod, lecture seule)

| Métrique | Valeur |
|----------|--------|
| Lignes (`COUNT`) | **0** |
| Colonnes (OpenAPI) | `id`, `userId`, `createdAt` |
| Dernière activité | **N/A** (table vide) |
| Code repo | **Aucune** écriture/lecture |

**Verdict :** **historique uniquement / jamais alimentée** sur ce projet → pas de mécanisme externe détecté via données. RLS + REVOKE cohérent.

### 4. Policies des tables CURRENT (schéma repo)

| Table | RLS | Policy active (migration source) |
|-------|-----|----------------------------------|
| `documents` | ✅ | `owner_all` — `user_id = auth.uid()` USING + WITH CHECK |
| `document_lines` | ✅ | idem |
| `company_profiles` | ✅ | idem (`20260927190000_company_profiles.sql`) |
| `subscriptions` | ✅ | `subscriptions_owner_read` — SELECT only ; writes **service role** |
| `notifications` | ✅ | `notifications_owner` — FOR ALL, `auth.uid() = user_id` |
| `automation_definitions` | ✅ | `automation_definitions_owner` — FOR ALL |
| `automation_executions` | ✅ | `automation_executions_owner` — FOR ALL |
| `integration_ingest_idempotency` | ✅ | `integration_ingest_idempotency_select` (SELECT own) + deny writes ajoutés par `20261007160000` |

**Conclusion :** policies existantes **déjà correctes** ; la migration de hardening **ne les remplace pas**.

### 5. Accès backend (confirmé dans le code)

| Flux | Client | Preuve (fichier) |
|------|--------|------------------|
| Stripe webhook | Service role | `lib/billing/stripe-events.ts`, `supabase/functions/stripe-webhook/index.ts` → `subscriptions` |
| Cron relances / exports | Service role | `lib/metier/follow-up-queries.ts`, `lib/automation/handlers/quote-followup.ts`, `lib/metier/accounting-export-queries.ts` (`processDueAccountingExports`) |
| Ingest n8n / API | Service role | `lib/integrations/ingest-document.ts` (`createAdminClient`) |
| Automations engine | Service role + RLS user | `lib/automation/queries.ts` (admin) ; définitions côté user via RLS |
| Emails auth | Service role | `lib/email/auth-mail.ts` |
| `settle-session` / trial | **JWT utilisateur** + RPC | `lib/auth/settle-session.ts` → `start_pro_trial` ; `lib/supabase/middleware.ts` → `enforce_pro_trial_expiry` (**authenticated**, pas admin — voulu) |

`createAdminClient()` documente le **bypass RLS** (`lib/supabase/admin.ts`).

### 6. Environnement staging Supabase

| Question | Réponse |
|----------|---------|
| Second project ID dans le repo / `.env.example` | **Non** |
| Projet documenté | **Un seul** : `qnsalgbohdqetbporlcd` |
| Branche Supabase / `supabase link` local | **Non configuré** dans le dépôt |
| Staging Vercel (URL preview) | Documenté (`docs/staging-smoke-checklist.md`) — **même base** sauf config manuelle distincte |

**→ existing staging project (Supabase dédié) : NO** — appliquer la migration d’abord sur un **clone / branche** ou projet de test **à créer avec ton accord** avant prod.

### 7. Objectifs sécurité (pas seulement l’alerte)

Après migration **sur une base de test** :

- Legacy sans RLS → **RLS + deny anon/auth** (réduit exposition PostgREST).
- Tables métier → **inchangées**, toujours `auth.uid() = user_id`.
- Backend-only → deny JWT **confirmé** ; accès via **service role** inchangé.
- RPC trial → **plus d’exécution anon** ; `founder_seats_taken` reste public (volontaire).

Tests A/B utilisateur **toujours requis** sur staging avant prod (protocole Phase 2 §10).

### Résumé Phase 3

```text
WAITLIST_SIGNUPS
→ rows: 0
→ last activity: none (table vide ; colonne createdAt disponible)
→ verdict: legacy vide — OK pour RLS/REVOKE dans migration

GENERATIONIA
→ rows: 0
→ last activity: none (table vide ; colonne createdAt disponible)
→ verdict: historique / non alimentée — OK pour RLS/REVOKE

Migration SQL
→ corrected: YES
→ duplicate policies: 0
→ destructive statements: 0
→ current TARINEO tables affected: YES (api_keys, analytics_events, integration_ingest_idempotency only — additive deny)

STAGING
→ existing staging project: NO
→ project ID: (unique prod/dev documenté) qnsalgbohdqetbporlcd — pas de clone Supabase séparé dans le repo

SECURITY
→ RLS disabled tables after migration: expected 0 (legacy verrouillées si présentes)
→ public RPC risks: founder_seats_taken (intentionnel) ; trial RPC sans anon après migration
→ cross-user risk: NONE on current schema (code) ; legacy fermé par migration
→ cross-team risk: NONE (pas de Team dans le repo)

Production:
→ DO NOT DEPLOY
```

---

## Phase 4 — Staging Environment

**Date :** 7 octobre 2026. **Production non modifiée** (aucune migration, aucune policy, aucune donnée touchée sur `qnsalgbohdqetbporlcd`).

```text
Production project:
qnsalgbohdqetbporlcd

Staging branch:
NO

Staging project ID:
(none — liste `supabase branches list` vide)

Cost:
voir § Coût branches (estimation ; pas de création sans accord)

Migration status:
NOT APPLIED

Production status:
UNTOUCHED
```

### Branches Supabase (`qnsalgbohdqetbporlcd`)

Commande : `supabase branches list --project-ref qnsalgbohdqetbporlcd` (7 oct. 2026).

```text
Branch disponible : NO
Branch ID :
Status :
```

Aucune branche preview ni persistante n’est enregistrée sur ce projet. **Aucune branche créée dans cette phase.**

**Pour en créer une (après ton accord) :**

1. Vérifier que l’org est sur **Pro** ou supérieur (branching non inclus sur Free — [pricing Supabase](https://supabase.com/pricing)).
2. Dashboard : **Project → Branches** ou CLI : `supabase branches create <name> --project-ref qnsalgbohdqetbporlcd` (option persistante / `with-data` selon besoin — voir [Branching](https://supabase.com/docs/guides/deployment/branching)).
3. Récupérer l’**URL + anon + service role** de la branche (ref distinct de prod) pour Vercel Preview / env local dédié.
4. Appliquer les migrations **uniquement** sur la branche (`supabase db push` lié à la branche, ou workflow GitHub branching).
5. **Ne pas** merger la branche vers prod tant que Security Advisor + tests A/B + backend smoke ne sont pas verts.

Les branches sont **sans données par défaut** (clone schéma / migrations) — adapté aux tests RLS ; seed ou snapshot si besoin de données réalistes (hors prod recommandé).

### Coût (estimation, non engagé)

| Élément | Indication |
|--------|------------|
| Prérequis | Plan **Pro+** pour branching |
| Compute branche (Micro par défaut) | **~0,01344 USD / heure** par branche active ([usage branching](https://supabase.com/docs/guides/platform/manage-your-usage/branching)) |
| Branche 24/7 | Ordre de grandeur **~9,70 USD / mois** (0,01344 × 720 h) — **hors** egress, stockage au-delà du quota, etc. |
| Crédits compute Pro | **Ne s’appliquent pas** au compute des branches |
| Pause / suppression | `supabase branches pause` ou delete pour arrêter la facturation horaire |

Alternative documentée par Supabase : **second projet** (ex. dev sur plan Free si quota org le permet) — isolation totale, pas de branche horaire, mais pas de copie auto des données prod.

### Variables Supabase (repo / docs — valeurs non affichées)

| Variable | Utilisée où | Frontend / backend | Staging possible ? |
|----------|-------------|--------------------|--------------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `lib/supabase/client.ts`, `server.ts`, `middleware.ts`, `admin.ts`, Edge `stripe-webhook`, scripts seed, `runtime-config` | Les deux (URL publique) | **Oui** — Preview / env staging → ref branche ou projet test |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Mêmes clients + middleware (session) | Frontend + SSR user JWT | **Oui** — anon de la branche / projet staging |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | **Aucune référence** dans le dépôt | N/A | Non utilisée par TARINEO |
| `SUPABASE_SERVICE_ROLE_KEY` | `lib/supabase/admin.ts`, billing, ingest, cron, `auth-mail`, push, scripts | **Backend uniquement** | **Oui** — service role staging ; Preview Vercel dédiée si base séparée |

Documentation ops : `README.md`, `.env.example`, `docs/tarineo-manual-config.md`. Pas de jeu d’env Vercel « staging » versionné : `docs/staging-smoke-checklist.md` = URL preview, souvent **même** Supabase que prod sans override des 3 variables.

### Stratégie staging (RLS)

```text
Production
  Supabase qnsalgbohdqetbporlcd
        ↓
Staging
  Supabase branch (ou projet séparé) — ref + clés dédiées
        ↓
Migration RLS
  20261007160000_rls_hardening_legacy_and_backend_only.sql (staging seulement)
        ↓
Security Advisors
        ↓
Tests User A / User B
        ↓
Tests backend (Stripe test, cron, ingest, trial)
        ↓
Validation
        ↓
Production (migration sur qnsalgbohdqetbporlcd après sign-off)
```

### Migration — prête pour staging (non appliquée)

Revue Phase 3/4 : SQL OK, 0 destructif, 0 policy dupliquée, tables métier CURRENT inchangées. **READY FOR STAGING** sur base isolée uniquement.

---

## Phase 4 — Staging Environment

**Date :** 7 octobre 2026. **Production non modifiée** (aucune migration, aucune policy, aucune donnée touchée sur `qnsalgbohdqetbporlcd`).

```text
Production project:
qnsalgbohdqetbporlcd

Staging branch:
NO

Staging project ID:
(none — liste `supabase branches list` vide)

Cost:
voir § Coût branches (estimation ; pas de création sans accord)

Migration status:
NOT APPLIED

Production status:
UNTOUCHED
```

### Branches Supabase (`qnsalgbohdqetbporlcd`)

Commande : `supabase branches list --project-ref qnsalgbohdqetbporlcd` (7 oct. 2026).

```text
Branch disponible : NO
Branch ID :
Status :
```

Aucune branche preview ni persistante n’est enregistrée sur ce projet. **Aucune branche créée dans cette phase.**

**Pour en créer une (après ton accord) :**

1. Vérifier que l’org est sur **Pro** ou supérieur (branching non inclus sur Free — [pricing Supabase](https://supabase.com/pricing)).
2. Dashboard : **Project → Branches** ou CLI : `supabase branches create <name> --project-ref qnsalgbohdqetbporlcd` (option persistante / `with-data` selon besoin — voir [Branching](https://supabase.com/docs/guides/deployment/branching)).
3. Récupérer l’**URL + anon + service role** de la branche (ref distinct de prod) pour Vercel Preview / env local dédié.
4. Appliquer les migrations **uniquement** sur la branche (`supabase db push` lié à la branche, ou workflow GitHub branching).
5. **Ne pas** merger la branche vers prod tant que Security Advisor + tests A/B + backend smoke ne sont pas verts.

Les branches sont **sans données par défaut** (clone schéma / migrations) — adapté aux tests RLS ; seed ou snapshot si besoin de données réalistes (hors prod recommandé).

### Coût (estimation, non engagé)

| Élément | Indication |
|--------|------------|
| Prérequis | Plan **Pro+** pour branching |
| Compute branche (Micro par défaut) | **~0,01344 USD / heure** par branche active ([usage branching](https://supabase.com/docs/guides/platform/manage-your-usage/branching)) |
| Branche 24/7 | Ordre de grandeur **~9,70 USD / mois** (0,01344 × 720 h) — **hors** egress, stockage au-delà du quota, etc. |
| Crédits compute Pro | **Ne s’appliquent pas** au compute des branches |
| Pause / suppression | `supabase branches pause` ou delete pour arrêter la facturation horaire |

Alternative documentée par Supabase : **second projet** (ex. dev gratuit sur plan Free si quota org le permet) — isolation totale, pas de branche horaire, mais pas de copie auto des données prod.

### Variables Supabase (repo / docs — valeurs non affichées)

| Variable | Utilisée où | Frontend / backend | Staging possible ? |
|----------|-------------|--------------------|--------------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `lib/supabase/client.ts`, `server.ts`, `middleware.ts`, `admin.ts`, Edge `stripe-webhook`, scripts seed, `runtime-config` | Les deux (URL publique) | **Oui** — pointer Preview / env « staging » vers la ref de la branche ou projet test |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Même clients + middleware (session cookies) | Frontend + SSR user JWT | **Oui** — clé anon de la branche / projet staging |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | **Aucune référence** dans le dépôt | N/A | Non utilisée par TARINEO actuel |
| `SUPABASE_SERVICE_ROLE_KEY` | `lib/supabase/admin.ts`, billing, ingest, cron queries, `auth-mail`, notifications push, scripts | **Backend uniquement** (jamais `NEXT_PUBLIC_`) | **Oui** — service role de la branche ; **Preview Vercel** doit avoir sa propre valeur si base séparée |

Documentation ops : `README.md`, `.env.example`, `docs/tarineo-manual-config.md`, `docs/MARKETING-GO-LIVE.md` (`vercel env add … production`). Le repo ne définit pas de jeu d’env Vercel « staging » distinct : les checklists (`docs/staging-smoke-checklist.md`) supposent une **URL preview** — aujourd’hui souvent **la même** base prod sauf override manuel des 3 variables ci-dessus.

### Stratégie staging (RLS)

```text
Production
  Supabase qnsalgbohdqetbporlcd
        ↓
Staging
  Supabase branch (ou projet séparé) — ref + clés dédiées
        ↓
Migration RLS
  20261007160000_rls_hardening_legacy_and_backend_only.sql (sur staging seulement)
        ↓
Security Advisors
  Dashboard Supabase (RLS, exposed tables, RPC)
        ↓
Tests User A / User B
  Protocole Phase 2 §10 (isolation documents, notifications, etc.)
        ↓
Tests backend
  Stripe test mode, cron + CRON_SECRET, ingest, trial RPC authenticated, emails
        ↓
Validation
  Sign-off checklist + doc
        ↓
Production
  Appliquer migration sur qnsalgbohdqetbporlcd (uniquement après validation)
```

### Migration — prête pour staging (non appliquée)

Fichier : `supabase/migrations/20261007160000_rls_hardening_legacy_and_backend_only.sql`

| Contrôle | Résultat |
|----------|----------|
| SQL cohérent (bloc `DO`, policies, GRANT/REVOKE) | OK |
| `DROP TABLE` / `DELETE` / `TRUNCATE` | 0 |
| Données métier modifiées | Non |
| Policies dupliquées | 0 (Phase 3) |
| Tables métier CURRENT (`documents`, …) | Policies `owner_all` **non** remplacées |
| Effet volontaire | Legacy RLS+REVOKE ; deny JWT sur `api_keys`, `analytics_events`, ingest writes ; RPC trial sans `anon` |

**Statut :** prête à être exécutée **sur une base staging isolée** ; **interdit** sur `qnsalgbohdqetbporlcd` tant que la chaîne ci-dessus n’est pas validée.

---

## Phase 5 — Staging RLS Validation

**Date :** 7 octobre 2026.

### Tentative de création de branche (validée par le product owner)

Commande exécutée :

```bash
supabase branches create tarineo-rls-staging \
  --persistent \
  --project-ref qnsalgbohdqetbporlcd \
  --yes
```

**Résultat : échec HTTP 402** — `Branching is supported only on the Pro plan or above` (`entitlement_required`, feature `branching_limit`).

- Org TARINEO : `rdwpljvmuewjigwdqejs`
- Facturation / upgrade : [dashboard org billing](https://supabase.com/dashboard/org/rdwpljvmuewjigwdqejs/billing)
- **Aucune branche créée** ; **production `qnsalgbohdqetbporlcd` inchangée** (pas de `db push`, pas de migration RLS, pas de modification policies/données).

### Fallback local (lab uniquement — pas un staging cloud)

Tentative `supabase db reset --version 20261006140000` sur **Postgres local** (Docker) pour enchaîner baseline → migration RLS → tests :

**Échec** : fichiers dupliqués `supabase/migrations/* 2.sql` (même timestamp que les migrations canoniques) → erreur `relation "project_schemas" already exists` lors du reset.

**Impact :** les étapes 2–11 du protocole cloud **n’ont pas pu être exécutées** dans cette session. Aucun contournement n’a été appliqué sur la prod.

### État migrations sur le projet lié (lecture CLI)

| Migration | Remote `qnsalgbohdqetbporlcd` |
|-----------|-------------------------------|
| `20261007160000_rls_hardening_legacy_and_backend_only.sql` | **Non appliquée** (colonne remote vide) |
| `20261006140000_integration_ingest_idempotency.sql` | **Non appliquée** sur remote au moment du check CLI |

*(Le remote peut diverger du dashboard ; ne pas lancer `supabase db push --linked` sans staging.)*

### Rapport demandé (staging cloud)

```text
STAGING
Project ID: (none — branche non créée)
Branch: tarineo-rls-staging — NOT CREATED (402 Pro required)

RLS BEFORE:
N/A (pas de base staging)

RLS AFTER:
N/A

Security Advisor:
N/A (pas de branche ; CLI `supabase db advisors` non exécuté sur prod volontairement)

User A isolation:
BLOCKED

User B isolation:
BLOCKED

Anonymous access:
BLOCKED

Backend:
BLOCKED

Stripe:
BLOCKED

Cron:
BLOCKED

Ingest:
BLOCKED

Frontend:
BLOCKED

Regression:
BLOCKED

Production:
UNTOUCHED
```

### Prochaines actions (après déblocage)

1. **Option A — Branche persistante (recommandée si tu passes Pro)**  
   `supabase branches create tarineo-rls-staging --persistent --project-ref qnsalgbohdqetbporlcd --yes`  
   Attendre statut `ACTIVE_HEALTHY` ; noter le **project ref** de la branche (≠ `qnsalgbohdqetbporlcd`).

2. **Option B — Second projet Supabase gratuit** (si quota org) : migrations + seed ; pas de clone auto des tables legacy Prisma.

3. **Option C — Lab local** : doublons `* 2.sql` **supprimés** (23 fichiers, oct. 2026).

   Script tout-en-un (évite les erreurs zsh au copier-coller de commentaires `(...)` ) :

   ```bash
   ./scripts/local-rls-lab.sh
   ```

   Ou commande par commande (sans commentaires inline) :

   ```bash
   supabase db reset --version 20261006140000 --no-seed --yes
   supabase db advisors --type security --local
   supabase migration up --local --yes
   supabase db advisors --type security --local
   ```

   - 502 au « Restarting containers… » : souvent bénin si les migrations sont listées jusqu’à `20261006140000`.
   - Ne pas utiliser `db query -f` sur `20261007160000…sql` (multi-commandes → SQLSTATE 42601).
   - Vérifier : `supabase db query --local "SELECT version FROM supabase_migrations.schema_migrations ORDER BY version DESC LIMIT 1;"` → doit afficher `20261007160000` **après** `migration up`.

   **Uniquement Docker local** — pas `db push --linked` / pas `qnsalgbohdqetbporlcd`.

4. Configurer **Vercel Preview** avec URL/anon/service role **de la branche ou du projet test** (jamais prod pour les tests RLS).

5. Reprendre le protocole Phase 5 (sections 2–11) **uniquement** sur la base staging.

**Production :** ne pas appliquer `20261007160000` sur `qnsalgbohdqetbporlcd` sans accord explicite post-validation staging.
