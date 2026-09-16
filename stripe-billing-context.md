# Stripe Billing Context — Tarineo

Document de référence pour les skills Stripe du projet (voir `.cursor/skills/stripe-router`).

## Account

- **Produit** : Tarineo — SaaS B2B artisans BTP (scan devis fournisseurs, alertes hausse)
- **Compte Stripe (test)** : INKFLOW — `acct_1SXk0J5JVD1yZUQv`
- **Mode actuel** : test (`sk_test_…` / `pk_test_…`)
- **Production** : recréer les mêmes produits/prices en live avant bascule

## Revenue Model

| Plan UI | Clé interne | Mensuel | Annuel (~20 % sous 12× mensuel) |
|---------|-------------|---------|----------------------------------|
| Starter | `starter` | 17 € | 163 € |
| Pro | `pro` | 29 € | 278 € |
| Équipe | `equipe` | 49 € | 470 € |

- **Essai gratuit** : géré côté Tarineo (`subscriptionStatus: trialing`), pas via trial Stripe
- **Facturation** : SetupIntent → webhook `setup_intent.succeeded` → création abonnement
- **Annuel** : prices créés pour tests résiliation ; parcours UI annuel landing uniquement pour l'instant

## Products & Prices (test)

Créés via `npx tsx scripts/creer-prix-stripe.ts --write-env` — metadata `app=tarineo`, `plan`, `interval`.

| Variable .env | Plan | Intervalle |
|---------------|------|------------|
| `STRIPE_PRICE_STARTER` | starter | month |
| `STRIPE_PRICE_STARTER_ANNUEL` | starter | year |
| `STRIPE_PRICE_PRO` | pro | month |
| `STRIPE_PRICE_PRO_ANNUEL` | pro | year |
| `STRIPE_PRICE_PREMIUM` | equipe | month |
| `STRIPE_PRICE_PREMIUM_ANNUEL` | equipe | year |

> `STRIPE_PRICE_PREMIUM` = plan **Équipe** (historique du nom de variable).

## Integrations

| Élément | Détail |
|---------|--------|
| Webhook URL | `/api/stripe/webhook` |
| Événements gérés | `setup_intent.succeeded`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed` |
| Dev local | `stripe listen --forward-to localhost:3000/api/stripe/webhook` |
| Customer Portal | non branché (Phase 4 — skill `customer-portal-setup`) |
| Checkout Session | non utilisé — flux SetupIntent + Elements |

## Fichiers code

- `src/lib/stripe.ts` — client serveur, mapping plans ↔ price IDs
- `src/app/(app)/documents/stripeActions.ts` — création SetupIntent
- `src/app/api/stripe/webhook/route.ts` — provisioning abonnement
- `src/app/(app)/compte/actions.ts` — résiliation (`cancel_at_period_end`)
- `scripts/creer-prix-stripe.ts` — bootstrap produits/prices

## KPI Targets (à compléter)

| Metric | Target |
|--------|--------|
| MRR | — |
| Monthly churn | < 5 % |
| Past due subs | < 3 |
| Dunning recovery | > 60 % |

## Notes

- Ne jamais exposer `STRIPE_SECRET_KEY` ni `STRIPE_WEBHOOK_SECRET` côté client
- Recréer les prices en live avec le même script + clé `sk_live_…`
- Skills Stripe installés dans `.cursor/skills/` (35 skills, router : `stripe-router`)
