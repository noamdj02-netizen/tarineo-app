# TARINEO STARTER / PRO — ARCHITECTURE LOCK

> Verrouillage produit + préparation n8n/MCP.  
> Dernière mise à jour : implémentation Phase 1–3 (entitlements + serveur + UI ciblée).

---

## 1. État actuel (vérifié dans le code)

| Zone | État |
|------|------|
| Stripe + `subscriptions` | ✅ Existant (`app/api/billing/*`, `lib/billing/stripe-events.ts`) |
| `getPlan()` / `planFor()` | ✅ Existant (`lib/billing/plan.ts`) — essai interne = Pro effectif |
| Quotas Navpit (`limitReached`) | ✅ IA, projets, schémas, **calendrier** |
| **Entitlements métier** | ✅ `lib/billing/entitlements.ts` (nouveau) |
| Relances auto cron | ✅ Gated Pro dans `autoScheduleDueQuoteFollowUps` |
| Export compta auto cron | ✅ Gated Pro dans `processDueAccountingExports` |
| MCP `/api/mcp` | ✅ Tools Navpit ; **api_access = Pro** dans `guarded()` |
| Clés API utilisateur | ✅ Hash + scopes ; **création = Pro** |
| Tools métier documents/devis | ❌ Pas encore dans MCP |
| Ingest email Gmail/Outlook | ❌ Pas de pipeline natif |
| Enterprise | Hors scope |

Références : `docs/TARINEO-MISSION-CONTROL.md`, `docs/TARINEO-STARTER-PRO-PHASE1-AUDIT.md`.

---

## 2. Architecture cible

```text
AUTH (Supabase)
    ↓
getPlan() / planForUserId()
    ↓
effectivePlan (free | starter | pro | founder + essai)
    ↓
lib/billing/entitlements.ts
    ↓
quotas existants (limitReached) + features métier
    ↓
UI (indicatif) + server actions + API + cron + MCP
```

**Règle :** pas de second billing. On lit `subscriptions` une seule fois par couche.

---

## 3. Matrice Starter / Pro (implémentée)

| Feature | Starter | Pro | Clé entitlement |
|---------|:-------:|:---:|-----------------|
| Documents, extraction, devis, PDF, marge | ✅ | ✅ | `documents_core` |
| Relances **manuelles** | ✅ | ✅ | `quote_followup_manual` |
| Relances **automatiques** (cron planif.) | ❌ | ✅ | `quote_followup_auto` |
| Alerte marge in-app | ✅ | ✅ | `margin_alert` |
| Export compta **manuel** | ✅ | ✅ | (pas de gate) |
| Export compta **automatique** | ❌ | ✅ | `accounting_export_auto` |
| Calendrier sync | ❌ | ✅ | `calendar_sync` (+ `limitReached`) |
| Clés API + MCP actuel | ❌ | ✅ | `api_access` |
| Intégrations avancées (futur) | ❌ | ✅ | `advanced_integrations` |

**Essai 14 j sans carte :** traité comme Pro (`isFreeTrial`).  
**Fondateur / owner :** tout ouvert (`status: owner`).

---

## 4. Points de contrôle serveur (Phase 2)

| Point | Fichier | Feature |
|-------|---------|---------|
| Sauver auto-relance | `app/(app)/automatisations/actions.ts` | `quote_followup_auto` |
| Cron planification relances | `lib/automation/handlers/quote-followup.ts` | `quote_followup_auto` |
| Cron envoi relances | `lib/metier/follow-up-queries.ts` | **Aucun** — envoie aussi les relances **manuelles** programmées |
| Créer / activer export auto | `lib/metier/accounting-export-queries.ts` | `accounting_export_auto` |
| Cron export compta | `processDueAccountingExports` | `accounting_export_auto` |
| Créer clé API | `app/api/account/api-keys/route.ts` POST | `api_access` |
| Tous tools MCP | `lib/mcp/tools.ts` `guarded()` | `api_access` |

---

## 5. Automatisations existantes

| Slug | Rôle |
|------|------|
| `quote_followup` | Config + enable ; auto = cron `autoScheduleDueQuoteFollowUps` |
| `margin_below_target` | Notification in-app après devis (`evaluateMarginBelowTarget`) |

Cron : `GET /api/cron/follow-ups` → planif auto + `processScheduledFollowUps`.

---

## 6. Intégrations existantes

- Google OAuth (agenda) — quota Pro via `limitReached(calendar)`.
- Resend — envoi mails métier / relances / exports.
- Pas de webhook sortant utilisateur documenté pour n8n (à définir Phase 7).

---

## 7. MCP existant

Voir tableau §8 dans `docs/TARINEO-STARTER-PRO-MASTER-GUIDE.md`.

Tous les tools actuels sont **hérités Navpit** (projets, tâches, notes, landings).  
Accès réservé **Pro** via `api_access` (clé utilisateur requise).

---

## 8. n8n — possible aujourd’hui

| Étape | Possible ? |
|-------|------------|
| Auth avec clé API utilisateur (Pro) | ✅ |
| Appeler MCP Navpit (projets, etc.) | ✅ (`api_access`) |
| `POST /api/integrations/ingest-document` | ✅ Phase 6 |
| MCP `tarineo_*` (list/get/ingest) | ✅ Phase 6 |
| Webhook sortant TARINEO → n8n | ❌ |

---

## 9. n8n — impossible / manquant aujourd’hui

1. Tools `create_quote`, `list_customers`, …
2. Événements produit (document.created) vers URL n8n.
3. Lecture Gmail/Outlook côté TARINEO (n8n doit récupérer la PJ).

---

## 10. Fichiers modifiés (cette livraison)

- `lib/billing/entitlements.ts` (+ test)
- `lib/billing/plan.ts` (`planForUserId`)
- `app/(app)/automatisations/*`
- `lib/automation/handlers/quote-followup.ts`
- `lib/metier/accounting-export-queries.ts`
- `app/api/account/api-keys/route.ts`
- `lib/mcp/tools.ts`
- UI : `automations-settings.tsx`, `accounting-export-page-client.tsx`, pages serveur

---

## 11. Migrations nécessaires

**Aucune** pour ce verrouillage. Les tables `subscriptions`, `automation_*`, `follow_ups`, `accounting_export_*`, `api_keys` existent déjà.

---

## 12. Risques

| Risque | Mitigation |
|--------|------------|
| Starter avec auto-relance déjà en DB | Cron ignore ; UI masque ; sauvegarde refuse |
| Starter avec clé API créée avant gate | MCP refusé ; nouvelle clé bloquée |
| Confusion essai = Pro | Documenté ; `isFreeTrial` dans guide |
| MCP 100 % Navpit | Ne pas vendre comme « API métier » avant Phase 6 |

---

## 13. Tests nécessaires

- `lib/billing/entitlements.test.ts` ✅
- Manuel : compte Starter → auto-relance refusée, manuelle OK
- Manuel : compte Pro → cron + export auto OK
- `npm run typecheck` + `npm run build`

---

## 14. Ordre d’implémentation

1. ✅ Phase 1 — Entitlements  
2. ✅ Phase 2 — Serveur  
3. ✅ Phase 3 — UI verrous ciblés  
4. ⏳ Phase 4–5 — Tests E2E Starter/Pro  
5. ⏳ Phase 6 — MCP métier  
6. ⏳ Phase 7 — Contrat webhooks n8n  
7. ⏳ Phase 8 — Workflow email → ingest  

---

## Verdict

### 🟡 READY WITH LIMITATIONS

**Pourquoi :** le verrou Starter/Pro est **réel côté serveur** sur relances auto, exports auto, API/MCP. Le cœur métier (documents, devis, relances manuelles) reste accessible au Starter.

**Limitations :** pas encore d’API d’ingestion document pour n8n ; MCP sans tools métier ; pas de webhooks sortants ; tests E2E billing à faire en staging avec vrais comptes Stripe.
