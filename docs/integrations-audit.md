# TARINEO — Audit complet des intégrations & connexion « 1 clic »

**Date :** 2026-10-06 (révision 2 — relecture dépôt)  
**Méthode :** lecture du repository (routes API, migrations, SDK, `.env.example`, hub `/parametres/integrations`).  
**Objectif :** cartographie fiable pour un centre d’intégrations : **Connecter → autoriser → Connecté ✓**.

> **Note :** un socle `lib/integrations/` et des tests de connexion ont été ajoutés **après** l’audit initial ; ce document les décrit comme **état actuel**, sans préjuger des prochaines implémentations.

---

## 1. État actuel

### 1.1 Hub `/parametres/integrations`

| Élément | Fichier / route | État |
|---------|-----------------|------|
| Page | `app/(app)/parametres/integrations/page.tsx` | **Existe** |
| UI | `components/settings/integrations-board.tsx` | Cartes, Connecter / Déconnecter / waitlist, **Tester la connexion** |
| Catalogue | `lib/settings/integrations-catalog.ts` | **14** entrées (`tarineo_email` + 13 précédentes) |
| Snapshot | `lib/settings/integrations-store.ts` | `tool_connections`, `api_keys`, `calendar_feeds`, session OAuth |
| Actions | `app/(app)/parametres/integrations-notifications-actions.ts` | bind Google, disconnect, waitlist, `testIntegrationConnectionAction` |
| Tests santé | `lib/integrations/*` | Resend (plateforme), Google (Gmail profile), iCal, API keys |

**Statuts supportés dans le catalogue :**  
`connected` · `available` · `requires_setup` · `coming_soon` · `disabled` · `error` · **`reconnection_required`**

**Parcours Google (réel) :**

1. « Connecter Google » → `/api/connect/google?tools=gmail` (ou `drive`)
2. `supabase.auth.signInWithOAuth` — scopes `gmail.send` ou `drive.file` (`app/api/connect/google/route.ts`)
3. Callback → `/parametres/integrations?bound=gmail` → `completeGoogleBindAction` → `tool_connections` (`tool_id: gmail`)
4. Si bind sans `provider_token` en session → affichage **Reconnexion requise**

**E-mails métier (relances, PDF, auth) :** toujours **Resend** (`lib/email/send.ts`, `lib/metier/follow-up-queries.ts`), pas Gmail API avec token utilisateur.

**Carte « E-mails TARINEO » :** service plateforme (`RESEND_API_KEY`) — distincte du compte Google artisan.

### 1.2 Deux surfaces « connexion » (non fusionnées)

| Surface | Public | Stockage | Exemples |
|---------|--------|----------|----------|
| **Paramètres → Intégrations** | Artisan BTP | `tool_connections`, `calendar_feeds`, `api_keys` | Google, iCal, API TARINEO, ERP (soon) |
| **Outils / copilote** | Power user / stack | `tool_connections` + liens URL | Stripe `rk_*`, Figma, Notion, MCP (`lib/connectors/*`, `/outils`) |

Même table **`tool_connections`** (`20260926140000` + `bind_kind`, `config` dans `20260926190000`).

**Écart produit :** l’abonnement **Stripe SaaS TARINEO** n’apparaît pas dans le hub intégrations (checkout `/abonnement`, webhook) ; le **Stripe artisan** (`bindStripeKey`) est sur **/outils**, pas sur `/parametres/integrations`.

### 1.3 Services branchés (preuves code)

| Service | Utilité | Preuve |
|---------|---------|--------|
| **Supabase** | Auth, Postgres, RLS, Storage | `lib/supabase/*`, 31 migrations |
| **Resend** | Transactionnel, relances, exports CSV, auth mail | `resend` SDK, `RESEND_API_KEY` |
| **Stripe** | Abonnements plateforme + webhook | `stripe` SDK, `subscriptions`, `/api/billing/*` |
| **Stripe (user)** | Lien compte artisan (metadata only) | `bindStripeKey` — clé **non** stockée |
| **Anthropic** | Extraction devis, assistant | `@anthropic-ai/sdk`, `ANTHROPIC_API_KEY` |
| **Google OAuth** | Login + bind Gmail/Drive | Supabase + `/api/connect/google` |
| **API Entreprises (gouv)** | Recherche SIRET / client | `recherche-entreprises.api.gouv.fr` — `lib/company/company-lookup.ts` |
| **iCal** | Agenda accueil (lecture) | `calendar_feeds`, `node-ical`, whitelist hôtes anti-SSRF |
| **Web Push** | Notifs navigateur | `web-push`, `VAPID_*`, `/api/push/subscribe` |
| **MCP / HTTP** | API externe | `api_keys` (hash), `/api/mcp`, `mcp-handler` |
| **PDF** | Devis / factures | `@react-pdf/renderer`, routes `/api/metier/documents/*/pdf` |
| **Storage** | Fichiers métier | bucket `documents` |
| **Vercel Cron** | Relances + exports compta | `vercel.json` : 07:15 UTC follow-ups, 08:00 UTC accounting-exports |
| **Analytics** | Événements produit | `analytics_events`, `/api/analytics/event` |
| **logo.dev** | Logos sociétés (opt.) | `NEXT_PUBLIC_LOGO_DEV_TOKEN` |
| **Google PSI** | Score perf sites projets (opt.) | `GOOGLE_PSI_API_KEY` |
| **Playwright** | SEO / capture (serveur) | `playwright-core` — **À VÉRIFIER** usage exact par route |

**Edge optionnel :** `supabase/functions/stripe-webhook` — doublon possible avec `/api/billing/webhook` (commentaire : Next.js = cible principale prod).

### 1.4 Automatisation

| Pièce | Détail |
|-------|--------|
| Tables | `automation_definitions`, `automation_executions` (`20261006120000`) |
| Relances | `quote_followup` handler, cron `/api/cron/follow-ups`, `follow_ups.sequence_number` |
| Marge | `margin_below_target`, hook transformation devis |
| UI | `/automatisations` |
| **Canal sortie e-mail** | **Resend** + prefs `email_followups` |

Exports comptables automatisés : `accounting_export_schedules` / `runs` (`20261002160000`), cron `/api/cron/accounting-exports`, envoi CSV par e-mail (Resend).

### 1.5 Auth

- E-mail / OTP : Supabase Auth + templates Resend (`lib/email/auth-mail.ts`).
- Google : provider Supabase + route intégrations (scopes étendus).
- **Pas** de Microsoft Entra / Azure AD dans le code.

### 1.6 Routes API (intégrations & données externes)

| Route | Rôle |
|-------|------|
| `/api/billing/checkout`, `/portal`, `/webhook` | Stripe plateforme |
| `/api/connect/google` | OAuth Google (intégrations) |
| `/api/cron/follow-ups`, `/api/cron/accounting-exports` | Crons (Bearer `CRON_SECRET`) |
| `/api/mcp` | MCP HTTP |
| `/api/account/api-keys`, `/api/account/connections` | Clés & connexions compte |
| `/api/push/subscribe` | Web Push |
| `/api/company/search`, `/api/company/lookup` | API gouv entreprises |
| `/api/assistant`, `/api/assistant/confirm` | Copilote (Anthropic) |
| `/api/landing/devis-demo` | PDF démo landing (sans OAuth) |
| `/api/analytics/event` | Analytics interne |
| `/api/metier/documents/[id]/pdf`, `/fichier` | PDF / fichiers |

### 1.7 SDK npm (dépendances directes liées intégrations)

`@supabase/supabase-js`, `@supabase/ssr`, `resend`, `stripe`, `@anthropic-ai/sdk`, `web-push`, `node-ical`, `@modelcontextprotocol/server`, `mcp-handler`, `@react-pdf/renderer`, `playwright-core`.

---

## 2. Intégrations nécessaires (liste métier artisan)

| Domaine | Besoin TARINEO |
|---------|----------------|
| Identité & données | Supabase |
| E-mail sortant | Resend (plateforme) → Gmail artisan (P1) |
| Paiement SaaS | Stripe plateforme |
| Paiement encaissement client | Stripe Connect / lien artisan (P2, partiel via `rk_*` outils) |
| IA documents | Anthropic |
| Messagerie entrante | Gmail / Outlook (P2) — **non** |
| Agenda | iCal (OK) → Calendar API (P1/P2) |
| Compta | Export CSV/e-mail (OK) → Pennylane/Sellsy/Sage (P2) |
| Fournisseurs BTP | Import PDF + IA (OK) → API CEDEO/Rexel/… (P2) |
| Fichiers | Supabase Storage ; Drive (P2) |
| Notifications | In-app + e-mail + push (partiel) |
| Automatisation | Engine interne + intégrations comme sources/destinations |
| API / agents | MCP + clés TARINEO |
| Conformité client | API Entreprises (SIRET) |
| Observabilité | Sentry/etc. (P2, absent) |

---

## 3. Matrice P0 / P1 / P2

| Intégration | Utilité | Priorité | Méthode | Dispo tech. ? | Déjà présente ? |
|-------------|---------|----------|---------|---------------|-----------------|
| Supabase | Cœur app | P0 | SDK + RLS | Oui | **Oui** |
| Resend | E-mails / relances | P0 | API key | Oui | **Oui** |
| Stripe (plateforme) | Abonnements TARINEO | P0 | API + webhook | Oui | **Oui** (pas dans hub intégrations) |
| Anthropic | IA devis / copilote | P0 | API key | Oui | **Oui** |
| Vercel + `CRON_SECRET` | Jobs planifiés | P0 | Plateforme | Oui | **Oui** |
| **E-mails TARINEO** (carte hub) | Visibilité canal Resend | P0 | Plateforme | Oui | **Oui** (UI) |
| Google OAuth | Bind Gmail/Drive | P1 | OAuth Supabase | Oui | **Partiel** |
| Gmail API (envoi métier) | Expéditeur artisan | P1 | OAuth + API | Oui | **Non** |
| Google Calendar API | Rappels chantier | P1 | OAuth | Oui | **Non** (iCal seul) |
| Google Drive | Archive / import | P2 | OAuth | Oui | **Partiel** (bind, pas sync) |
| iCal URL | Agenda lecture | P1 | URL privée | Oui | **Oui** |
| Web Push | Alertes temps réel | P1 | VAPID | Oui | **Partiel** |
| API / MCP TARINEO | Outils & JARVIS futur | P1 | API key hash | Oui | **Oui** |
| API Entreprises gouv | Fiche client | P1 | REST public | Oui | **Oui** |
| Export compta CSV | Comptable | P1 | Interne + Resend | Oui | **Oui** |
| Stripe `rk_*` (artisan) | Encaissement | P2 | Secret éphémère | Oui | **Oui** (/outils) |
| Microsoft 365 | Outlook / Calendar | P2 | OAuth Graph | Oui | **Non** (catalogue) |
| Pennylane / Sellsy / Sage / EBP / QB | ERP | P2 | OAuth/API éditeur | **À VÉRIFIER** | **Non** |
| CEDEO / Point.P / Rexel / Sonepar | Devis auto | P2 | API fermée | **À VÉRIFIER** | **Import PDF** |
| Resend webhooks | Bounces / delivery | P2 | Webhook | Oui | **Non** |
| Sentry / Datadog | Ops | P2 | SDK | Oui | **Non** |
| GTM / GA | Marketing | P2 | Script | Oui | **Partiel** |

---

## 4. Faisabilité (détail par intégration clé)

### Resend (P0)

| | |
|--|--|
| Connexion | API key serveur `RESEND_API_KEY` |
| SDK | `resend` — **utilisé** |
| Webhooks | Disponibles chez Resend — **non branchés** |
| Idempotence | `idempotencyKey` relances — **oui** |
| Domaine | `EMAIL_FROM` ; fallback `contact@tarineo.fr` si domaine invalide (`lib/email/send.ts`) |
| Test hub | `resend.domains.list()` — `lib/integrations/providers/tarineo-email.ts` |
| Révocation | Rotation clé côté Resend dashboard |
| Statut | **Production code** |

### Stripe plateforme (P0)

| | |
|--|--|
| Connexion | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` |
| Webhook | `app/api/billing/webhook/route.ts` → `subscriptions` (service role) |
| Checkout / portal | `/api/billing/checkout`, `portal` |
| Sandbox | Clés `sk_test_` / `rk_test_` |
| Déconnexion user N/A | Abonnement géré côté Stripe Customer Portal |
| Statut | **Oui** — **absent du hub** intégrations artisan |

### Stripe artisan (`bindStripeKey`, P2 outils)

| | |
|--|--|
| Méthode | Clé restreinte `rk_*` saisie une fois |
| Stockage | **Pas** la clé en DB — metadata `tool_connections` |
| API | `verifyStripeAccount` — **preuve** appel Stripe |
| Révocation | Déconnexion outil + révoquer clé chez Stripe |
| Statut | **Oui** sur `/outils`, pas hub paramètres |

### Google (P1)

| | |
|--|--|
| OAuth | Supabase Auth + scopes custom |
| Scopes | `gmail.send`, `drive.file`, profile/email |
| Tokens | Session Supabase (`provider_token`) — **pas** table vault dédiée |
| Refresh | `access_type=offline`, `prompt=consent` — refresh Supabase **À VÉRIFIER** (dashboard) |
| Gmail envoi métier | **Non** — Resend |
| Test hub | `gmail.googleapis.com/.../profile` avec `provider_token` |
| Révoquer | Déconnecter intégration + révoquer app Google compte utilisateur |
| App OAuth | Console Google liée au projet Supabase — **À VÉRIFIER** |
| Statut | **UI + test** ; capacité métier limitée |

### Microsoft (P2)

| | |
|--|--|
| OAuth Graph | Standard — **aucun code** |
| Catalogue | `coming_soon`, waitlist |
| Statut | **Non** |

### iCal (P1)

| | |
|--|--|
| Méthode | URL flux privée dans `calendar_feeds` |
| Sécurité | Whitelist hôtes (`calendar.google.com`, iCloud, Outlook) — anti-SSRF |
| Test hub | Téléchargement + parse 14 jours |
| Secret | URL = secret — RLS owner |
| Statut | **Oui** |

### Comptabilité ERP (P2)

| | |
|--|--|
| Actuel | CSV + e-mail planifié (`lib/metier/accounting-export/*`) |
| Pennylane API | **À VÉRIFIER** (partenariat, OAuth) |
| Statut | **Export oui, ERP non** |

### Fournisseurs BTP (P2)

| | |
|--|--|
| Actuel | PDF + profils fournisseurs (`vendor_document_profiles`) |
| APIs distributeurs | **À VÉRIFIER** par enseigne |
| Statut | **Manuel** |

### Anthropic (P0)

| | |
|--|--|
| API key serveur uniquement | **Oui** — pas d’OAuth utilisateur |
| Limites / coûts | Console Anthropic — **À VÉRIFIER** quotas prod |

### API Entreprises (P1)

| | |
|--|--|
| API | `recherche-entreprises.api.gouv.fr` — sans clé |
| Limites | Rate limit public — **À VÉRIFIER** charge prod |

### Web Push (P1)

| | |
|--|--|
| Clés | `VAPID_*` optionnelles |
| Sans VAPID | In-app seulement |
| Statut | **Partiel** |

### MCP / API TARINEO (P1)

| | |
|--|--|
| Clés | Hash en `api_keys`, préfixe affiché |
| Route | `/api/mcp` |
| Test hub | Compte clés actives |
| Statut | **Oui** |

---

## 5. Architecture proposée (alignée repo actuel)

```text
/parametres/integrations          ← vue produit (catalogue + board)
        │
        ├── integrations-store    ← états runtime
        ├── integrations-catalog
        └── actions (bind, test, disconnect)

lib/integrations/                 ← adapters (existant, à étendre)
    registry.ts
    types.ts
    test-connection.ts
    providers/
        tarineo-email.ts          ← Resend plateforme
        google.ts                 ← health Gmail
        ical.ts
        api-tarineo.ts

lib/connectors/                   ← stack /outils (Stripe rk, Figma, MCP…)
        actions.ts, signals.ts, catalog.ts

lib/automation/                   ← moteur (indépendant du hub UI)
```

**À ajouter sans casser l’existant :**

- `connection-service.ts` — disconnect/test unifiés par `integrationId`
- `permissions.ts` — scopes affichés = scopes réels
- Providers : `stripe-platform.ts` (lecture statut abonnement), `microsoft-graph.ts` (futur)
- **Fusion produit** : décider si `/outils` migre vers le hub ou reste « mode avancé »

**Tables Supabase (intégrations) :**

| Table | Rôle |
|-------|------|
| `tool_connections` | État connecté, `bind_kind`, `config` (non secret) |
| `api_keys` | Hash clés MCP |
| `calendar_feeds` | URL iCal (1/user) |
| `subscriptions` | Stripe plateforme (lecture user) |
| `automation_definitions` / `executions` | Automatisations |
| `accounting_export_schedules` / `runs` | Exports planifiés |
| `follow_ups` | Relances (séquence) |
| `notification_preferences` | Canaux e-mail / in-app / push |

**Table future recommandée** (Gmail/Microsoft envoi hors session Supabase) :

```sql
-- integration_credentials (chiffré, RLS user_id)
-- provider, encrypted_access, encrypted_refresh, scopes[], expires_at
```

---

## 6. UX « 1 clic »

### Implémenté

| Flux | Étapes |
|------|--------|
| Google | Connecter → OAuth → `?bound=gmail` → message succès → Connecté / Reconnexion requise |
| Google | Déconnecter, Reconnecter / Réautoriser, **Tester la connexion** |
| E-mails TARINEO | Statut plateforme + test Resend |
| iCal | Lien accueil configurer ; test flux ; déconnecter |
| API TARINEO | Lien clés compte ; test présence clé |
| ERP / MS / fournisseurs API | « Être informé » (waitlist metadata user) |

### Manques vs cible

| Manque | Impact |
|--------|--------|
| Pas de **Stripe abonnement** dans le hub | Artisan ne voit pas « TARINEO facturé » au même endroit |
| Gmail **n’envoie pas** les relances | Bouton Google ≠ expéditeur des relances |
| Pas de test auto au retour OAuth | Test manuel « Tester la connexion » |
| Microsoft / ERP : pas de Connecter | OK MVP |
| État `disconnected` explicite | Absence de ligne = déconnecté |
| Persistance dernier test / erreur | Message UI session seulement |
| Checkmark « Connecté ✓ » dédié | Libellé texte + pastille |

### Parcours cible (inchangé)

```text
Connecter → Autoriser → Retour TARINEO → Vérification → « X est connecté ✓ »
```

API key : formulaire → test → Connecté ✓ (MCP : déjà via Compte).

---

## 7. Sécurité

### Stockage secrets

| Donnée | Où | Client |
|--------|-----|--------|
| Clés plateforme (Resend, Stripe, Anthropic, service role) | `process.env` serveur | **Jamais** |
| Clés MCP | `api_keys.hash` | **Jamais** (prefix seul) |
| iCal URL | `calendar_feeds` | **RLS** |
| OAuth | Cookies session Supabase | **httpOnly** |
| Stripe `rk_*` user | Non persistée | **Bon** |

### Risques

| Risque | Sévérité | État / mitigation |
|--------|----------|-------------------|
| IDOR documents / relances | Critique | RLS `user_id` métier |
| Cron sans secret | Élevé | `cronBearerAuthorized` |
| Faux « Google OK » sans Gmail | Moyen | Test profile + `reconnection_required` |
| OAuth CSRF | Moyen | Supabase state |
| Logs avec secrets | Moyen | Surveiller `[email]` errors |
| iCal SSRF | Élevé | Whitelist — **implémenté** |
| Tokens métier sans vault | Moyen | Acceptable MVP ; table chiffrée P1 |
| Isolation « entreprise » multi-user | **À VÉRIFIER** | Modèle surtout `user_id` — pas tenant org-wide partout |

### RLS (résumé)

`tool_connections`, `api_keys`, `calendar_feeds`, `automation_*`, `follow_ups` : policies owner ; `subscriptions` : lecture user, écriture webhook admin.

---

## 8. Automation Engine × intégrations

```text
Source (futur)          Événement              Handler              Destination
─────────────────────────────────────────────────────────────────────────────
Devis métier            transformed / sent     margin_below_target  in-app + (email)
Relance due             cron follow-ups        quote_followup       Resend (+ PDF)
Export compta due       cron accounting        (export module)      Resend CSV
(Gmail entrant)         —                      —                    non implémenté
(Calendar)              —                      —                    non implémenté
Stripe webhook          subscription.updated   billing              in-app / email ?
```

**Règle actuelle :** pas d’e-mail relance si `email_followups` false ou Resend absent/skipped.

**Objectif :** chaque intégration connectée = **capability** déclarée pour handlers (`canSendEmailViaGmail`, `canReadCalendar`, etc.).

---

## 9. JARVIS (sans implémentation)

```text
JARVIS → policy (integrations + automations ON) → engine / assistant tools → adapters → effet
```

**Prérequis déjà partiels :** MCP, `automation_executions`, tests connexion hub.  
**Manque :** registry capabilities, mail entrant, intentions → actions mappées.

Exemple futur : *« Relance les clients sans réponse depuis 7 jours »* → `quote_followup` + Resend (ou Gmail si P1 livré).

---

## 10. Roadmap

| Phase | Contenu |
|-------|---------|
| **1 — Hub fiable** | ✅ `/automatisations#connexions`, `loadVerifiedIntegrationsSnapshot`, Stripe billing (option A), auto-test post-OAuth ; ☐ staging automation ops |
| **2 — Automatisations prod** | Migration `20261006120000`, cron Resend e2e, exports compta stables |
| **3 — Canaux P1** | Gmail send métier (vault tokens), Calendar API ou iCal enrichi, webhooks Resend |
| **4 — ERP / MS / distributeurs** | Partenariats APIs |
| **5 — JARVIS** | Orchestration NL sur registry + engine |

---

## 11. Variables d’environnement

| Variable | Statut |
|----------|--------|
| `NEXT_PUBLIC_APP_URL` | **EXISTANTE** |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **EXISTANTE** |
| `SUPABASE_SERVICE_ROLE_KEY` | **EXISTANTE** |
| `RESEND_API_KEY`, `EMAIL_FROM` | **EXISTANTE** |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | **EXISTANTE** |
| `CRON_SECRET` | **EXISTANTE** |
| `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL` | **EXISTANTE** |
| `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` | **EXISTANTE** (opt.) |
| `NAVPIT_OPEN_ACCESS`, `SEED_USER_*`, `NAVPIT_OWNER_EMAILS` | **EXISTANTE** |
| `GOOGLE_SITE_VERIFICATION`, `GOOGLE_PSI_API_KEY` | **EXISTANTE** (opt.) |
| `NEXT_PUBLIC_LOGO_DEV_TOKEN` | **EXISTANTE** (opt.) |
| `MICROSOFT_CLIENT_ID`, `MICROSOFT_CLIENT_SECRET` | **MANQUANTE** (P2) |
| `INTEGRATION_ENCRYPTION_KEY` | **À CRÉER** (vault tokens) |
| `SENTRY_DSN` | **MANQUANTE** (P2) |
| OAuth Google (hors Supabase) | **À CRÉER** seulement si flux custom |
| Config OAuth Google dans Supabase Dashboard | **À VÉRIFIER** |

Référence : `.env.example`.

---

## 12. Verdict final

### INTEGRATIONS PHASE 1 — **READY** (code produit)

Critères code remplis :

- Hub unique **`/automatisations#connexions`** (15 cartes dont Billing Stripe).
- **`loadVerifiedIntegrationsSnapshot`** : pas de « Connecté » sans test santé (P0).
- Google : OAuth, `reconnection_required`, test auto après bind, retour hub.
- Resend : statut via test réel (pas seulement présence de clé).
- Docs : `integrations-roadmap.md`, `integrations-runbook.md`.

### NOT READY (exploitation / P1 produit)

| Blocage | Priorité |
|---------|----------|
| Migration automation `20261006120000` + smoke Resend/cron staging | **P0 ops** |
| Envoi relances toujours via Resend (Gmail API métier absent) | **P1** |
| Microsoft / ERP / APIs fournisseurs (catalogue seul) | **P2** |
| Vault tokens OAuth hors session Supabase | **P1** |
| Stripe artisan (`rk_*`) reste sur `/outils` | **P2** |

### Prêt (rappel technique)

- **`lib/integrations/`** : registry, providers, health, `INTEGRATION_PROVIDER_META`.
- **P0 backend** : Supabase, Resend, Stripe billing, iCal, API keys, Google bind.
- `/parametres/integrations` → redirect vers le hub.

### Manque / bloquant « 1 clic » complet (fonctionnel)

1. **Relances ≠ Gmail connecté** — Resend reste le canal.
2. **Microsoft, ERP, APIs fournisseurs** : catalogue sans backend.
3. **Vault tokens** OAuth métier absent.
4. **Exploitation** : migration automation + smoke staging.

### Connecter en premier (ordre)

1. **Resend + domaine** (prod) — carte E-mails TARINEO + relances.
2. **Staging automation** — migration + cron + 1 e-mail e2e.
3. **Google** — Gmail API send si expéditeur artisan requis ; sinon maintenir Resend seul.
4. **iCal** — déjà utile ; garder tests connexion.
5. **Unifier UX** Stripe / outils avancés dans le hub (décision produit).

### Peut attendre

Microsoft 365, ERP natifs, APIs distributeurs, Drive sync, webhooks Resend, JARVIS, Sentry.

---

## Annexe — fichiers clés

| Domaine | Chemins |
|---------|---------|
| Hub | `app/(app)/parametres/integrations/*`, `components/settings/integrations-board.tsx` |
| Intégrations core | `lib/integrations/*`, `lib/settings/integrations-*` |
| Connecteurs | `lib/connectors/*`, `app/api/connect/google/route.ts` |
| E-mail | `lib/email/*`, `lib/metier/follow-up-queries.ts` |
| Billing | `lib/billing/*`, `app/api/billing/*` |
| Automation | `lib/automation/*`, `app/api/cron/follow-ups/route.ts` |
| Exports compta | `lib/metier/accounting-export/*`, `app/api/cron/accounting-exports/route.ts` |
| MCP | `lib/mcp/*`, `app/api/mcp/route.ts` |
| Migrations | `supabase/migrations/` |
| Ops | `docs/automation-engine-qa.md`, `docs/staging-smoke-checklist.md` |

---

*Audit repository — livrable documentaire ; ne remplace pas la validation manuelle OAuth Google / APIs partenaires marquées **À VÉRIFIER**.*
