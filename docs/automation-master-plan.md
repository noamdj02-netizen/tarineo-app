# TARINEO — Automation Master Plan

> **Source de vérité** pour le moteur d’automatisations.  
> Dernière mise à jour : audit initial (Phase 0–1). **Aucun nouveau moteur n’est encore implémenté** — ce document décrit l’existant et la trajectoire.

---

## TARINEO AUTOMATION STATUS (snapshot)

| Domaine | État | Note |
|--------|------|------|
| Architecture documentée | ✅ | Ce fichier |
| Automation Engine générique | ❌ | Flux ad hoc (cron + emitters) |
| Relance devis | ⚠️ | `follow_ups` + cron Resend ; pas d’auto-planification J+X par défaut |
| Alerte marge | ⚠️ | Hausses fournisseur (`price_alerts`) ; pas d’alerte « marge sous seuil » |
| Emails | ⚠️ | Resend OK ; relance = corps user/IA, pas de template dédié |
| Scheduler | ⚠️ | 2 crons Vercel ; pas de queue centrale |
| Logs / historique | ⚠️ | `follow_ups`, `accounting_export_runs` ; pas d’`automation_executions` |
| Sécurité | ⚠️ | RLS + `CRON_SECRET` ; exports sans lock fort |
| UI `/automatisations` | ❌ | Redirige vers `/copilote` |
| Tests automation | ⚠️ | Partiels (follow-ups, exports) |
| Production readiness (moteur) | **NOT READY** | Étendre l’existant avant greenfield |

### Prochaines 3 tâches prioritaires

1. **Appliquer la migration** `supabase/migrations/20261006120000_automation_engine.sql` sur Supabase (staging puis prod).
2. **Implémenter** `autoScheduleDueQuoteFollowUps()` + brancher cron follow-ups (spec : `docs/automation/quote-followup-due-to-scheduled.md`).
3. **Implémenter** `evaluateMarginBelowTarget()` + `notifyMarginBelowTarget()` (spec : `docs/automation/margin-below-threshold.md`).

### Documents liés (Phase 1–2)

| Document | Contenu |
|----------|---------|
| [ADR 001](adr/001-automation-engine.md) | Décision architecture + tables |
| [Relance due → scheduled](automation/quote-followup-due-to-scheduled.md) | Pont virtual → scheduled, séquences, idempotence |
| [Marge sous seuil](automation/margin-below-threshold.md) | Calcul, emitter, distinct de `price_alerts` |
| `lib/automation/types.ts` | Slugs, config types, helpers de clés |

---

## A. Architecture cible

```
User
  ↓
Event (métier : quote.sent, document.analyzed, …)
  ↓
Automation Engine (dispatch, idempotence, enabled)
  ↓
Rule (automation_id + event + conditions JSON)
  ↓
Condition (statut devis, email client, seuil marge, …)
  ↓
Action (send_email, notify_in_app, schedule_follow_up, …)
  ↓
Queue / Scheduler (Vercel Cron + scheduled_at rows)
  ↓
Execution (trace, status, metadata, error)
  ↓
Log + Notification / Email (Resend, notifications, push)
```

**Principe :** le moteur **orchestre** ; il ne remplace pas la logique métier déjà dans `lib/metier/*`.

---

## B. État actuel (audit Phase 0)

### B.1 Stack & déploiement

| Composant | Détail |
|-----------|--------|
| App | Next.js App Router, routes `(app)`, API `app/api/*` |
| DB | Supabase Postgres + RLS |
| Auth | Session Supabase ; cookies legacy `navpit_*` (voir § Navpit) |
| Email | `lib/email/send.ts` + React Email (`emails/*`), provider **Resend** |
| Billing | Stripe (`app/api/billing/webhook`, edge `stripe-webhook`) |
| Cron | **Vercel uniquement** — `vercel.json` |

### B.2 Crons existants (ne pas dupliquer)

| UTC | Route | Handler |
|-----|-------|---------|
| `15 7 * * *` | `/api/cron/follow-ups` | `processScheduledFollowUps()` |
| `0 8 * * *` | `/api/cron/accounting-exports` | `processDueAccountingExports()` |

Auth : `lib/metier/cron-auth.ts` — `Authorization: Bearer $CRON_SECRET`.

**Risque :** deux patterns d’exécution (claim optimiste sur `follow_ups` vs pas de lock sur exports). **Objectif :** un scheduler central qui appelle des **handlers** enregistrés, pas un 3ᵉ style de cron.

### B.3 Tables Supabase pertinentes

| Table | Rôle automation |
|-------|-----------------|
| `follow_ups` | Relances liées à `documents` ; statuts, `scheduled_at`, `attempt_number`, Resend |
| `price_alerts` | Écart prix ligne fournisseur vs historique |
| `notifications` | In-app ; `idempotency_key` unique par user |
| `notification_preferences` | Canaux, `supplier_threshold_pct`, `daily_summary_*`, prefs événements |
| `accounting_export_schedules` / `accounting_export_runs` | Modèle **schedule + run log** réutilisable |
| `documents`, `document_lines`, `parties`, `chantiers` | Entrées workflow devis / marge |

**Absent :** `automations`, `automation_executions` génériques.

### B.4 Relance devis (Automatisation 01 — existant)

**Fichiers clés**

- `lib/metier/follow-ups.ts` — éligibilité, vues « due » (envoyé ≥ 3 j, non transformé)
- `lib/metier/follow-up-queries.ts` — CRUD, envoi cron, idempotence Resend `follow-up:{id}`
- `app/api/cron/follow-ups/route.ts`
- UI : `app/(app)/relances/page.tsx`, `components/metier/relance-dialog.tsx`
- Actions : `app/(app)/metier/actions.ts` (`sendFollowUpNowAction`, `scheduleFollowUpAction`, …)
- Assistant : `lib/assistant/tools.ts` (`list_follow_ups`, `create_follow_up`)
- Rappels in-app : `app/(app)/accueil/page.tsx` → `syncOperationalNotifications()` → `lib/notifications/emitters.ts`

**Workflow réel aujourd’hui**

1. Devis envoyé → trace `sent_at` / document outbound.
2. **« Due » virtuel** : affiché en UI, **pas** converti automatiquement en `follow_ups.status = scheduled`.
3. L’utilisateur (ou l’assistant) **planifie** une relance → cron envoie si `scheduled` + claim.
4. Email : PDF pièce + corps (draft / IA), pas `emails/relance-devis.tsx` dédié.

**Garde-fous déjà prévus (à centraliser dans le moteur)**

- Ne pas relancer si transformé / annulé (via statut document + follow-up `cancelled`)
- Idempotence envoi email (clé Resend)
- Claim `attempt_number` anti double-envoi cron

**Manques vs brief**

- Délai J+X **configurable** par user (défaut global 3 j en dur dans vues)
- Nombre max de relances / séquences (`quote_followup:{quoteId}:{sequence}`)
- Auto-schedule après `quote.sent` selon prefs
- Email template « Relance devis » (Email 04)
- Historique unifié `/automatisations/historique`

### B.5 Alerte marge / fournisseur (Automatisation 02 — partiel)

**Existant — hausse fournisseur**

- `recordPriceAlerts()` dans `lib/metier/queries.ts` (après ingest)
- Seuil : `notification_preferences.supplier_threshold_pct`
- Notification : `notifySupplierIncreases()` → type `supplier_price_increase` (in-app + push optionnel)
- UI : `app/(app)/hausses/page.tsx`

**Absent — marge chantier / devis**

- `margeCiblePct` / `marge_par_defaut_pct` dans paramètres entreprise → **defaults devis**, pas d’alerte
- Pas d’événement `margin.alert` ni email « Alerte marge » (Email 05)
- Landing = démo marketing uniquement

**Distinction importante**

| Signal | Table / code | Message type |
|--------|----------------|--------------|
| Prix ligne fournisseur ↑ | `price_alerts` | Hausse fournisseur |
| Marge estimée sous seuil | *à créer* | Marge / chantier |

### B.6 Emails

| Email brief | État |
|-------------|------|
| 01 Confirmation inscription | Auth templates |
| 02 Bienvenue | `emails/welcome` etc. |
| 03 Devis envoyé | Pièce jointe via `sendDocumentMail` (pas template nommé) |
| 04 Relance devis | **Manquant** (corps libre) |
| 05 Alerte marge | **Manquant** |
| 06 Analyse terminée | Partiel (notifications) |
| 07 Erreur analyse | Partiel |
| 08 Récap hebdo | Pref `daily_summary_enabled` **sans cron** |

Provider : **ne pas** ajouter un 2ᵉ provider ; étendre `lib/email/send.ts`.

### B.7 Événements métier (cible vs aujourd’hui)

| Événement cible | Déclencheur actuel |
|-----------------|-------------------|
| `quote.created` | Import / création document (pas bus central) |
| `quote.sent` | `markDocumentSent` / envoi mail |
| `quote.accepted` | Dérivé BC + `source_document_id` (stats) |
| `quote.rejected` | Hardcodé `0` dans stats |
| `document.analyzed` | Pipeline ingest `ready` |
| `margin.alert` | — |
| `followup.due` | Vue UI + sync accueil |
| `user.created` | Auth / Stripe |

**Recommandation :** couche fine `lib/automation/events.ts` qui **wrap** les points d’entrée existants (`metier/actions`, cron, ingest) sans refactor massif.

### B.8 UI produit

- `app/(app)/automatisations/page.tsx` → **redirect `/copilote`**
- `next.config.ts` : alias `/automatisations` → `/accueil`
- UX « automation » réelle aujourd’hui : **relances**, **export comptable**, **hausses**, prefs notifications

### B.9 Observabilité

- Logs console cron ; pas de table `automation_executions`
- Types de statut cibles : `AUTOMATION_STARTED`, `EMAIL_SENT`, `CONDITION_NOT_MET`, etc. → à mapper sur exécutions

### B.10 Sécurité

- RLS `auth.uid() = user_id` sur tables user-scoped
- Cron : `createAdminClient()` + filtrage explicite `user_id` / `listDocumentsForUser`
- IDOR : toujours passer par queries session + ownership document
- **Ne pas** affaiblir RLS pour le moteur ; utiliser service role **uniquement** en cron avec garde-fous

### B.11 Navpit / incohérences

Cookies `navpit_sid`, env `NAVPIT_OPEN_ACCESS`, `package.json` name `navpit`, emails `navpit-fonts`, redirects `navpit.com`. **Hors scope automation** sauf si nouveaux noms de clés idempotence / logs (préférer préfixe `tarineo_`).

---

## C. Architecture cible du moteur (`lib/automation/`)

Proposition **incrémentale** (Phase 2) — pas de remplacement day-one de `follow_ups`.

```
lib/automation/
  events.ts          # émission normalisée + payload typé
  registry.ts        # catalogue automations built-in (quote_followup, margin_alert, …)
  engine.ts          # dispatch(event) → rules → actions
  conditions.ts      # évaluateurs purs (testables)
  actions/
    send-email.ts
    notify-in-app.ts
    schedule-follow-up.ts
  scheduler.ts       # enregistrement handlers cron
  executions.ts      # persistance + idempotence keys
  email/             # wrappers templates Email 04/05
```

### Modèle de données (cible)

**`automation_definitions`** (ou JSON dans prefs au MVP)

- `id`, `user_id`, `slug` (`quote_followup`, `margin_alert`)
- `enabled`, `config` (jsonb : délais, max relances, seuils)
- `created_at`, `updated_at`

**`automation_executions`**

- `id`, `automation_id`, `user_id`, `status`, `idempotency_key`
- `entity_type`, `entity_id`, `started_at`, `completed_at`, `error`, `metadata` (jsonb)

**Phase 3 MVP :** peut mapper `follow_ups` + `notifications` sans migrer les données tout de suite — les exécutions **référencent** `follow_up_id` ou `notification_id`.

---

## D. Automatisation 01 — Suivi devis (plan d’implémentation)

### Workflow cible

```
Devis créé → envoyé (quote.sent)
  → [si auto enabled] schedule follow_up J+X
  → cron daily
  → vérifie statut document (pas accepté/refusé/annulé)
  → vérifie email client
  → vérifie idempotence sequence N
  → envoie Email 04 (template)
  → log execution
  → si N < max → schedule N+1
```

### Réutiliser

- `scheduleFollowUpForDocument`, `processScheduledFollowUps`, table `follow_ups`
- Ajouter : **job cron optionnel** `autoScheduleDueFollowUps(userPrefs)` avant `processScheduledFollowUps`

### Config utilisateur (à stocker)

- `first_delay_days`, `max_attempts`, `enabled`, template variant
- Source : étendre `notification_preferences` ou `automation_definitions.config`

---

## E. Automatisation 02 — Alerte marge (plan d’implémentation)

### Workflow cible

```
document.analyzed (inbound) OU devis client mis à jour
  → calcul marge vs margeCiblePct / seuil prefs
  → si sous seuil OU hausse fournisseur > threshold
  → notify in-app (+ email si pref)
  → idempotency par (user, chantier|document, day|revision)
```

### Réutiliser

- `recordPriceAlerts` + `notifySupplierIncreases` pour branche **fournisseur**
- **Nouveau** : `evaluateMarginFloor()` + `notifyMarginBelowTarget()` dans `emitters.ts`

---

## F. Plan futur (P1 / P2 / P3)

Voir brief utilisateur — le moteur doit enregistrer des `slug` sans recoder le cron à chaque fois.

**P3 IA :** propositions Copilot uniquement ; actions sensibles = règle explicite + confirmation (déjà aligné produit).

---

## G. Interface `/automatisations` (Phase 7)

Pages cibles :

- `/automatisations` — liste toggles + config
- `/automatisations/historique` — feed depuis `automation_executions` + join follow_ups / notifications

Design : tokens landing/app Tarineo (ivoire, orange `#EC5821`, B2B minimal).

---

## H. Tests (Phase 8)

Couvrir au minimum :

- Relance : sent, accepted, refused, due, déjà envoyé, email invalide, disabled, IDOR
- Marge : seuil, doublon idempotency, prefs off
- Cron : double invocation (claim)
- Resend error → retry / failed execution

Fichiers existants à étendre : tests follow-ups / accounting-export si présents.

---

## I. Ordre d’exécution (rappel)

| Phase | Statut |
|-------|--------|
| 0 Audit | ✅ Ce document |
| 1 Doc architecture actuelle | ✅ |
| 2 Automation Engine (ADR + migration + types) | ✅ Spec ; ⏳ code |
| 3 Relance devis | ⏳ Étendre existant |
| 4 Alerte marge | ⏳ |
| 5 Emails 04/05 | ⏳ |
| 6 Historique / logs | ⏳ |
| 7 UI | ⏳ |
| 8 Tests | ⏳ |
| 9 QA prod | ⏳ |
| 10 P1/P2 prep | ⏳ |

---

## J. Fichiers de référence (index rapide)

```
vercel.json
app/api/cron/follow-ups/route.ts
app/api/cron/accounting-exports/route.ts
lib/metier/cron-auth.ts
lib/metier/follow-ups.ts
lib/metier/follow-up-queries.ts
lib/metier/queries.ts              # recordPriceAlerts
lib/notifications/emitters.ts
lib/notifications/service.ts
lib/settings/notification-preferences.ts
lib/email/send.ts
emails/
supabase/migrations/20260928140000_follow_ups.sql
supabase/migrations/20260928150000_follow_ups_hardening.sql
supabase/migrations/20260927180000_metier_graph.sql
supabase/migrations/20260930170000_notification_preferences.sql
supabase/migrations/20260930180000_notifications.sql
supabase/migrations/20261002160000_accounting_exports.sql
docs/tarineo-followups-qa.md
```

---

## K. Décisions ouvertes (ADR à trancher avant Phase 2)

1. **MVP moteur** : tables dédiées vs extension `notification_preferences.event_prefs` seulement ?
2. **Auto-relance** : opt-in global ou opt-out à l’envoi du devis ?
3. **Marge** : alerte au niveau chantier, document, ou ligne ?
4. **Historique** : vue unifiée exécutions vs pages Relances / Hausses existantes ?
