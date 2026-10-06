# TARINEO — Phase 1 STARTER / PRO — Audit (sans implémentation)

> **Statut :** audit uniquement — aucun code modifié dans cette livraison.  
> **Légende :** 🟢 utilisé · 🟡 incomplet · 🟠 branché partiellement · 🔴 absent

---

## CE QUI EXISTE AUJOURD'HUI

| Domaine | État | Détail |
|---------|------|--------|
| **Auth** | 🟢 | Supabase Auth, middleware `updateSession`, `/auth/callback` |
| **Supabase** | 🟢 | Métier + `subscriptions` RLS lecture seule user |
| **Stripe** | 🟢 | Checkout, portal, webhook → `subscriptions` |
| **Plans** | 🟢 | `free`, `starter` (UI « Création »), `pro`, `founder` dans `lib/billing/plans.ts` |
| **Résolution plan** | 🟢 | `getPlan()` / `planFor()` — trial 14j = Pro effectif |
| **Limites** | 🟠 | **Navpit** : projets, IA chat, schémas, calendrier — **pas** documents/devis |
| **FEATURES marketing** | 🟡 | `FEATURES[plan]` = listes texte, **pas** enforcement |
| **Entitlements** | 🔴 | Pas de `canUseFeature()` — seulement `limitReached(kind)` |
| **Automatisations** | 🟢 moteur · 🟠 plan | Cron + definitions ; **aucun** check Starter/Pro |
| **Métier documents** | 🟢 | Extraction, PDF, marge — **sans** quota plan |
| **API externe** | 🟠 | MCP `/api/mcp` + clés API — outils **projets Navpit**, pas documents |
| **Intégrations hub** | 🟢 UI | Affiche le plan ; ne bloque pas Pro features |
| **n8n** | 🔴 | Pas de route webhook dédiée |

---

## CE QUI MANQUE POUR STARTER / PRO (verrouillage)

1. **Matrice feature → plan** codée et testée serveur.
2. **Gating automations** (relance auto, marge notify avancée) sur Pro.
3. **Limites métier** (documents/mois, extractions) si produit le demande — **aucune** dans `LIMITS` aujourd'hui.
4. **API métier** pour n8n (REST ou outils MCP documents).
5. **Événements** sortants (webhooks user) — absents.
6. **Alignement UX** : `/prix`, `/abonnement`, `FEATURES` parlent encore beaucoup **projets/schémas**.
7. **Onboarding** = wizard **projets** Navpit, pas parcours artisan métier.

---

## Matrice produit proposée (code vérifié)

| Feature | Starter | Pro | Existe ? | Backend plan ? | Testée ? |
|---------|---------|-----|----------|----------------|----------|
| Compte + auth | ✓ | ✓ | 🟢 | n/a | 🟡 |
| Import document / extraction IA | ✓ | ✓ | 🟢 | 🔴 | 🟡 |
| Devis / facture / PDF / marge | ✓ | ✓ | 🟢 | 🔴 | 🟡 |
| Chantiers, parties, fournisseurs | ✓ | ✓ | 🟢 | 🔴 | 🟡 |
| Copilote IA (quota/mois) | ✓ (300) | ✓ (500) | 🟢 | 🟢 `limitReached(ai)` | 🟡 |
| Projets Navpit | ✓ (6) | ✓ (∞) | 🟢 | 🟢 `projects` | 🟡 |
| Schémas Excalidraw | ✓ (100) | ✓ (∞) | 🟢 | 🟢 `schemas` | 🟡 |
| Calendrier iCal / sync | — | ✓ | 🟢 | 🟢 `calendar` | 🟡 |
| Relances manuelles | ✓ | ✓ | 🟢 | 🔴 | 🟡 |
| Relance auto (cron) | — | ✓ *proposé* | 🟢 | 🔴 | 🟡 |
| Alerte marge basse in-app | ✓ | ✓ | 🟢 | 🔴 | 🟡 |
| Hub intégrations Google/iCal | ✓ | ✓ | 🟠 | 🔴 | 🟡 |
| Clés API / MCP | ✓ *proposé* | ✓ | 🟠 | 🔴 (pas plan) | 🟡 |
| Export compta planifié | — | ✓ *proposé* | 🟢 | 🔴 | 🟡 |
| Analytics admin | — | — | 🟢 admin | n/a | — |

\* *Proposé produit — à valider avec Noam avant implémentation.*

**Free / trial :** `free` + essai 14j Pro (`start_pro_trial`) = accès Pro temporaire sans Stripe.

**Founder :** hors scope mission mais **existe** — traité comme Pro+ dans `getPlan()`.

---

## Entitlements (état)

**Existant à réutiliser :**

```ts
getPlan() → { plan, limits, isFreeTrial, hasPaidSubscription, ... }
limitReached(db, "projects" | "ai" | "schemas" | "calendar")
```

**À ajouter (phase implémentation) — un seul module :**

- `lib/billing/entitlements.ts` (nom suggéré)
- `requireFeature(db, "quote_followup_auto")` → throw ou message
- Mapper `PlanId` → set de features
- **Ne pas** dupliquer Stripe ni `subscriptions`

**Règle :** UI peut masquer ; **server actions**, **cron**, **API** doivent appeler `requireFeature`.

---

## Limites actuelles (chiffres réels)

| Limite | Free | Starter | Pro | Code |
|--------|------|---------|-----|------|
| Projets | 2 | 6 | ∞ | `LIMITS` + `limitReached` |
| Messages IA / mois | 30 | 300 | 500 | `chat_messages` count |
| Schémas | 3 | 100 | ∞ | `project_schemas` |
| Calendrier sync | non | non | oui | `limitReached(calendar)` |
| Documents métier | ∞ | ∞ | ∞ | **non limité** |
| Clés API actives | 10 max | 10 | 10 | `MAX_ACTIVE_KEYS` route |
| Relances / automations | — | — | — | **non limité par plan** |

Comportement limite atteinte : message français + blocage action (assistant, création projet, etc.).

---

## Stripe (audit)

| Question | Réponse |
|----------|---------|
| Plan déterminé ? | `subscriptions` + logique `load()` dans `plan.ts` ; trial sans `stripe_subscription_id` → Pro |
| Création abo | `POST /api/billing/checkout` → Stripe Checkout ; metadata `plan` starter/pro |
| Webhook | `POST /api/billing/webhook` → `handleStripeEvent` |
| Stockage | `public.subscriptions` (service role en écriture) |
| Starter ? | `plan === "starter"` && `paidLive` |
| Pro ? | `plan === "pro"` && paid, ou trial live, ou founder |
| Annulé | `customer.subscription.deleted` → `syncSubscription` → plan `free` si plus live |
| Expiré / past_due | `past_due` compte encore paid dans `PAID_STATUSES` |
| Paiement échoué | Email Resend ; statut Stripe `past_due` |

**Prix Stripe :** lookup keys `tarineo_starter_month`, `tarineo_pro_month`, tiers `_t1`, `_t2`, `tarineo_founder`.  
Si lookup absent → checkout **échoue** (pas de prix inventé).

---

## Supabase

```
auth.users (1:1) subscriptions [lecture RLS user]
              company_profiles
              documents → document_lines
              automation_definitions
              follow_ups
              api_keys [RLS sans policy → service role]
```

L'utilisateur **ne peut pas** UPDATE `subscriptions` via RLS (select only).  
Modifier son plan côté client = **impossible** sans Stripe webhook / admin.

---

## Connexion TARINEO (existant)

| Mécanisme | Usage | n8n |
|-----------|-------|-----|
| **Clés API** | Session user crée clé → hash en DB | Bearer sur `/api/mcp` |
| **MCP** | Protocole MCP, scopes read/write | n8n peut parler MCP si supporté |
| **OAuth Google** | `tool_connections`, pas API métier | — |
| **CRON_SECRET** | Routes `/api/cron/*` | n8n pourrait appeler cron **non** (secret partagé risqué) |
| **Stripe webhook** | Entrant Stripe | — |

**Recommandation n8n (contrat futur, pas à coder maintenant) :**

- **Entrant :** `POST /api/integrations/n8n/hooks` (à créer) — HMAC secret par user, events signés.
- **Sortant :** jobs TARINEO → URL n8n webhook (config dans `automation_definitions` ou table dédiée).
- **Court terme :** étendre MCP ou REST read/write **documents** avec même auth que clés API.

---

## Événements n8n (classification)

| Event | Statut |
|-------|--------|
| `document.ready` (extract fini) | 🟡 déductible de `documents.status` |
| `quote.sent` (`extract.sent_at`) | 🟡 champ existe, pas d'emitter |
| `quote.accepted` (BC/facture liée) | 🟡 `source_document_id` |
| `invoice.created` | 🟡 |
| `margin.below_target` | 🟢 dans `evaluateMarginBelowTarget` — pas webhook |
| `follow_up.sent` | 🟢 après Resend — pas webhook |
| `email.received` | 🔴 |

---

## Automatisations × plan (gap)

| Composant | Plan check ? |
|-----------|--------------|
| `autoScheduleDueQuoteFollowUps` | 🔴 non |
| `processScheduledFollowUps` | 🔴 non (pref user emailFollowups only) |
| `evaluateMarginBelowTarget` | 🔴 non |
| UI `/automatisations` | 🔴 tout user connecté |

---

## Prochaine implémentation (ordre validé mission)

1. `entitlements.ts` + tests
2. Gating server : automations cron + `saveAutomationsAction`
3. Stripe inchangé ; mapper founder/trial → effective tier
4. UI `/abonnement` + badges Pro locked
5. Doc contrat n8n + optionnel endpoint webhook
6. typecheck + build + tests billing/entitlements

---

*Voir rapport conversation Phase 15 pour synthèse exécutive.*
