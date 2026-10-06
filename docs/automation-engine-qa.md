# AUTOMATION ENGINE QA

Date : 2026-10-06  
Périmètre : `quote_followup` + `margin_below_target` uniquement (pas P1/P2).

## 1. Audit — systèmes concurrents

| Domaine | Source de vérité | Doublon évité |
|---------|------------------|---------------|
| Relances UI « due » | `buildFollowUpViews()` virtuelles | Cron auto = `autoScheduleDueQuoteFollowUps` → `follow_ups.scheduled` |
| Envoi email relance | `processScheduledFollowUps` + Resend | Clé `quote_followup:send:{docId}:{seq}` (plus `follow-up:{uuid}` pour cron) |
| Relance manuelle | `scheduleFollowUpForDocument` / dialog | Coexiste ; séquences auto via `sequence_number` |
| Hausse fournisseur | `recordPriceAlerts` + `notifySupplierIncreases` | **Distinct** de marge (`margin_below_target`) |
| Préférences email relances | `notification_preferences.email_followups` | Respecté en phase B cron |

## 2. Scénarios relance devis

| ID | Scénario | Mécanisme | Statut |
|----|----------|-----------|--------|
| A | Devis envoyé + email valide | `last_sent_to`, délai, insert `scheduled` | **PASS** (code + tests séquence) |
| B | Devis accepté (BC/facture) | `isDocumentTransformed` | **PASS** (`follow-ups.test.ts`) |
| C | Devis refusé | `follow_ups.status = answered` (ou cancelled) | **PASS** (`quoteFollowUpClosedForDocument`) |
| D | Annulé | `doc.status=error` ou `follow_ups.cancelled` | **PASS** |
| E | Email absent | skip schedule si `requireValidClientEmail` | **PASS** |
| F | Automation désactivée | `automation_definitions.enabled` ou `autoScheduleEnabled=false` | **PASS** |
| G | Double cron schedule | `automation_executions` unique `quote_followup:schedule:…` | **PASS** (contrainte DB + insert) |
| H | 1ʳᵉ relance envoyée | `sequence_number=1` + clé send | **PASS** |
| I | 2ᵉ relance | après `sent` seq 1 + délai | **PASS** (test unitaire) |
| J | Max relances | `maxSequences` | **PASS** (test unitaire) |
| K | Erreur Resend | `automation_executions` phase `send` status `failed` + log | **PASS** (ajouté phase B) |

**Note refus client** : pas de champ `quote_refused` sur document ; le refus métier passe par clôture relance (`answered` / `cancelled`).

## 3. Idempotence envoi

Clé canonique : `quote_followup:send:{documentId}:{seq}`

- Resend : même clé → pas de double envoi.
- `automation_executions` enregistre `completed` après succès.
- Tests : `lib/automation/idempotency.test.ts`.

## 4. automation_definitions

- Initialisation : `ensureAutomationDefinitions()` (`lib/automation/definitions.ts`), `ignoreDuplicates: true`.
- UI : `/automatisations` — ON/OFF, délais, max relances, seuil marge.
- Pas de hardcode `enabled: true` dans le métier cron.

Activation relance auto requise :

- `slug = quote_followup`, `enabled = true`, `config.autoScheduleEnabled = true`.

## 5. Marge — règle seuil

Ordre **réel** (`effectiveMarginFloorPct`) :

1. `automation_definitions.config.floorMarginPct` (si nombre)
2. `settings.commercial.margeCiblePct`
3. `company_profiles.marge_par_defaut_pct`
4. **25 %**

Comparaison : alerte si `marginPct < floor` — **égalité = pas d’alerte**.

Hook : `transformQuoteAction` → devis client `out` uniquement.

Activation : `margin_below_target.enabled = true` (défaut ligne seed `enabled: false`).

## 6. Notifications `margin_below_target`

- Type : `margin_below_target` (`lib/notifications/types.ts`).
- Création via session user (`createNotification` + RLS `notifications`).
- Idempotence : `margin_below:document:{id}:{floor}:{YYYY-MM-DD}`.
- Pas d’émission cross-tenant (pas de cron marge multi-user).

## 7. Cron `GET /api/cron/follow-ups`

| Phase | Fonction | Isolation erreur |
|-------|----------|------------------|
| A | `autoScheduleDueQuoteFollowUps` | try/catch dédié — n’empêche plus B |
| B | `processScheduledFollowUps` | try/catch séparé |

Réponse JSON : `{ schedule: {…}, send: { processed, failed, skippedEmailPref } }`.

Tests charge 0/N follow-ups : **non automatisés** (smoke staging manuel).

## 8. Migration

Voir `docs/automation-migration-runbook.md`.

RLS : definitions/executions owner-only ; cron utilise **service role** avec `user_id` explicite.

## 9. Interface

`/automatisations` — formulaire premium B2B (ivoire / `#EC5821`).

## Synthèse PASS/FAIL

| Domaine | Résultat |
|---------|----------|
| Architecture | **PASS** |
| Relance devis | **PASS** (staging e2e Resend recommandé) |
| Idempotence | **PASS** |
| Marge | **PASS** |
| Notifications | **PASS** (session ; pas e2e DB sans Supabase) |
| Cron | **PASS** (isolation phases) |
| RLS | **PASS** (design ; audit prod post-migration) |
| Migration | **PASS** (fichier revu ; **apply staging requis**) |
| Email | **CONDITIONAL** — dépend `RESEND_API_KEY` + `emailFollowups` |

## Tests automatisés

Commande :

```bash
node --import tsx --test lib/automation/*.test.ts lib/metier/follow-ups.test.ts
```

Résultat au **2026-10-06** : **26 / 26** PASS (`lib/automation/*.test.ts` + `lib/metier/follow-ups.test.ts`).

## Smoke local (exécuté)

| Vérification | Résultat |
|--------------|----------|
| Suite unitaire automation + relances | **26 / 26** |
| `GET /api/cron/follow-ups` sans `Authorization` | **401** (attendu) |
| Cron Vercel configuré | **Oui** — `vercel.json` → `15 7 * * *` |
| UI `/automatisations` + `ensureAutomationDefinitions` | **Présent** |

## Smoke staging (à faire manuellement)

Checklist opérateur (non exécutée depuis cet environnement) :

1. Appliquer `20261006120000_automation_engine.sql` sur Supabase staging.
2. Activer sur un compte test : `/automatisations` → relance ON + `autoScheduleEnabled`.
3. `curl -H "Authorization: Bearer $CRON_SECRET" https://<staging>/api/cron/follow-ups` → JSON `{ schedule, send }`.
4. Contrôler `automation_executions` + une ligne `follow_ups` planifiée.
5. **1** envoi Resend réel (seq 1) + idempotence (relancer cron → pas de double e-mail).

## Production readiness

| Niveau | Verdict |
|--------|---------|
| **Code & tests** | **READY** — moteur relance + marge, idempotence, cron phases A/B, UI config |
| **Exploitation (staging/prod)** | **NOT READY** tant que la checklist staging ci-dessus n’est pas signée |

Blocages exploitation :

1. Migration non appliquée sur **staging** (ou prod).
2. Pas de preuve Resend e2e + séquence 1→2 en conditions réelles.
3. `RESEND_API_KEY` + `CRON_SECRET` + prefs `emailFollowups` à valider sur l’environnement cible.
