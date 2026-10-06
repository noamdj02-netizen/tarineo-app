# ADR 001 — Moteur d’automatisations Tarineo

**Statut :** Accepté (spec + migration prêtes, implémentation code en cours)  
**Date :** 2026-10-06  
**Décideurs :** Produit / engineering Tarineo

## Contexte

Tarineo exécute déjà des automatisations **adhoc** :

- Relances email via `follow_ups` + cron `/api/cron/follow-ups`
- Hausses fournisseur via `recordPriceAlerts` + `notifySupplierIncreases`
- Exports comptables via `accounting_export_schedules` + `accounting_export_runs`

Il n’existe pas de modèle unifié pour : règles utilisateur, exécutions tracées, idempotence cross-actions, ni UI `/automatisations`.

## Décision

1. **Introduire deux tables** `automation_definitions` et `automation_executions` (voir migration `20261006120000_automation_engine.sql`).
2. **Ne pas remplacer** `follow_ups`, `price_alerts`, ni les crons existants au jour 1 — le moteur **enveloppe** ces flux.
3. **Catalogue built-in** (slug stable) :
   - `quote_followup` — relance devis client
   - `margin_below_target` — marge estimée sous seuil
   - (futur) `accounting_export` — lien optionnel vers `accounting_export_runs`
4. **Scheduler** : un seul point d’entrée cron (`/api/cron/automations` à terme) qui enchaîne les handlers ; **phase 1** : étendre `/api/cron/follow-ups` avec `autoScheduleDueQuoteFollowUps()` avant `processScheduledFollowUps()`.
5. **Préférences** : config JSON dans `automation_definitions.config` par slug ; les flags globaux existants (`emailFollowups`, `supplierThresholdPct`) restent la source jusqu’à migration UI.
6. **Idempotence** : clés explicites dans `automation_executions.idempotency_key` + reprise des clés Resend / `notifications` documentées par action.

## Schéma minimal

### `automation_definitions`

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | uuid PK | |
| `user_id` | uuid FK auth.users | Propriétaire (RLS) |
| `slug` | text | `quote_followup`, `margin_below_target`, … |
| `enabled` | boolean | Interrupteur produit |
| `config` | jsonb | Paramètres (délais, seuils, max relances) |
| `created_at` / `updated_at` | timestamptz | |

Contrainte : `unique (user_id, slug)` — une définition par automatisation et par utilisateur.

### `automation_executions`

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | uuid PK | |
| `user_id` | uuid | |
| `definition_id` | uuid FK → definitions | |
| `slug` | text | Dénormalisé pour requêtes historique |
| `status` | text | `started` \| `completed` \| `failed` \| `skipped` |
| `idempotency_key` | text | Unique par user |
| `entity_type` | text | `document`, `follow_up`, `chantier`, … |
| `entity_id` | text | UUID métier |
| `phase` | text | `schedule` \| `send` \| `notify` \| `evaluate` |
| `error` | text | Message court si failed |
| `metadata` | jsonb | Détails (reason skip, seq, marginPct, …) |
| `started_at` / `completed_at` | timestamptz | |

Index : `(user_id, created_at desc)`, `(user_id, slug, created_at desc)`.

### Extension `follow_ups`

| Colonne | Type | Description |
|---------|------|-------------|
| `sequence_number` | int default 1 | 1 = première relance après envoi initial |

Index partiel unique : pas deux relances **actives** même séquence sur un document (voir migration).

## Conséquences

### Positives

- Historique `/automatisations/historique` sans parser `follow_ups` + logs console.
- Idempotence auditables (doublon cron, retry Resend).
- Extension P1/P2 par nouveau `slug` + handler, pas par nouveau cron.

### Négatives / coûts

- Double écriture temporaire : `follow_ups` + `automation_executions` jusqu’à refactor complet.
- Migration à appliquer sur Supabase avant code prod.

### Hors scope ADR

- Modifier Auth, Stripe, RLS globales.
- Envoi email automatique sans règle activée (opt-in explicite pour auto-schedule relance).

## Alternatives rejetées

| Alternative | Raison |
|-------------|--------|
| Tout dans `notification_preferences` JSON | Pas d’historique d’exécution structuré |
| Remplacer `follow_ups` par exécutions seules | Risque régression relances déjà en prod |
| Queue externe (Redis, Inngest) | Complexité Vercel ; cron + rows `scheduled` suffisent en P1 |

## Références

- `docs/automation-master-plan.md`
- `docs/automation/quote-followup-due-to-scheduled.md`
- `docs/automation/margin-below-threshold.md`
- `supabase/migrations/20261006120000_automation_engine.sql`
