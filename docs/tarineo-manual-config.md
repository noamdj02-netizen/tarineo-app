# Configuration manuelle TARINEO

Le code de `/login`, des e-mails et du checkout est dans ce repo.  
Les blockers restants sont **hors code** (domaine, dashboards, secrets).

Ne pas coller de Price ID dans le repo.

---

## 1. `/login` 404 sur app.tarineo.com — MANUAL CONFIG REQUIRED

La page existe déjà : `app/(auth)/login/page.tsx` → URL **`/login`**.  
Pas de rewrite Vercel, pas de redirect Next qui supprimerait `/login`.  
Le middleware la laisse publique.

Le 404 mesuré sur `https://app.tarineo.com/login` vient donc du **déploiement / DNS**, pas d’une page manquante.

**À faire manuellement (Vercel) :**

1. Projet = **cette** app Next (celle qui build `ƒ /login`).
2. Production Domain : `app.tarineo.com` (et `www` si besoin) attaché à **ce** projet, pas à un autre site / une vieille preview.
3. Redéployer **Production** depuis le commit actuel (celui où `/login` compile).
4. Vérifier après deploy : `https://app.tarineo.com/login` affiche « Bon retour. » (pas la 404 TARINEO).

Local : `http://localhost:3000/login` (avec open access, `/login` peut 307 vers `/accueil` — normal en `next dev`).

---

## 2. Variables d’environnement

### Vercel Production (projet app)

| Variable | Valeur |
|----------|--------|
| `NEXT_PUBLIC_APP_URL` | `https://app.tarineo.com` — **pas** localhost, **pas** navpit.com, **pas** www.tarineo.fr pour l’app |
| `NEXT_PUBLIC_SUPABASE_URL` | projet Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon |
| `SUPABASE_SERVICE_ROLE_KEY` | service role (serveur) |
| `EMAIL_FROM` | `TARINEO <contact@tarineo.fr>` |
| `RESEND_API_KEY` | clé Resend |
| `STRIPE_SECRET_KEY` | `sk_live_…` (ou test) |
| `STRIPE_WEBHOOK_SECRET` | `whsec_…` du endpoint app |

**Ne pas** définir `NAVPIT_OPEN_ACCESS` ni `TARINEO_OPEN_ACCESS` sur preview/prod.

Le code ignore localhost dans `NEXT_PUBLIC_APP_URL` dès qu’on est en déploiement.

### Local (`.env.local`) — ne pas committer

Garder localhost. Corriger **à la main** si encore présent :

`EMAIL_FROM=TARINEO <contact@tarineo.fr>`

(Le fichier local n’est pas modifié par le repo.)

---

## 3. Resend — MANUAL CONFIG REQUIRED

Le code envoie depuis `TARINEO <contact@tarineo.fr>` (ou `EMAIL_FROM` s’il n’est pas Navpit).

**Clé API :** une clé **non scoped Navpit** (full access ou domaines tarineo.fr / tarineo.com). Une clé limitée à navpit.com répond **403**.

**Domaine `tarineo.fr` :** créé côté Resend, statut `not_started` tant que le DNS n’est pas posé.

Ajouter chez le registrar (région eu-west-1) :

| Type | Nom | Valeur |
|------|-----|--------|
| TXT | `resend._domainkey` | (DKIM Resend — copier depuis Resend → Domains → tarineo.fr) |
| MX | `send` | `feedback-smtp.eu-west-1.amazonses.com` priorité 10 |
| TXT | `send` | `v=spf1 include:amazonses.com ~all` |
| CNAME | `rsend` | `send.forge.rmta.net` |

Puis **Verify** dans Resend. Receiving peut rester désactivé.

Vercel (Production, Preview, Development) **et** `supabase secrets` :

```
EMAIL_FROM=TARINEO <contact@tarineo.fr>
RESEND_API_KEY=<clé non scoped Navpit>
```

Ne pas considérer le bug corrigé tant qu’un envoi réel depuis `contact@tarineo.fr` n’a pas abouti (HTTP 200).

---

## 4. Stripe — MANUAL CONFIG REQUIRED

Le checkout n’utilise **que** :

- `tarineo_starter_month` / `tarineo_starter_year` (+ `_t1` `_t2` fidélité)
- `tarineo_pro_month` / `tarineo_pro_year` (+ `_t1` `_t2`)
- `tarineo_founder`

Pas de repli `navpit_*`. Lookup absente → pas de paiement, `?erreur=prix`.

**Prix Navpit encore présents dans Stripe (ne pas supprimer à l’aveugle) :**

`navpit_founder`, `navpit_starter_*`, `navpit_pro_*` (mois/an, palier t1/t2).

Le checkout TARINEO ne les référence plus. Avant archivage Dashboard : vérifier qu’aucun abonnement actif n’utilise encore ces Price ID.

URLs code (origin = `NEXT_PUBLIC_APP_URL` en déploiement) :

- Checkout POST `/api/billing/checkout`
- Success `/abonnement?ok=…&session_id={CHECKOUT_SESSION_ID}`
- Cancel `/abonnement?plan=…`
- Portal POST `/api/billing/portal` → `return_url` `/abonnement`
- Webhook `/api/billing/webhook`

**À faire manuellement :**

1. Créer les prix (Dashboard) **ou** une fois `npm run stripe:setup` avec `STRIPE_SECRET_KEY` (génère les ID côté Stripe, pas dans le code).
2. Webhook : `https://app.tarineo.com/api/billing/webhook`  
   événements : `checkout.session.completed`, `customer.subscription.*`, `invoice.paid`, `invoice.payment_failed`
3. Copier `STRIPE_WEBHOOK_SECRET` dans Vercel.
4. Si function Deno encore utilisée : `APP_URL=https://app.tarineo.com`, `EMAIL_FROM=TARINEO <contact@tarineo.fr>`, redéployer.

---

## 5. Supabase Auth — MANUAL CONFIG REQUIRED

Dashboard → Authentication → URL configuration.

**Site URL**

`https://app.tarineo.com`

**Redirect URLs** (ajouter chacune) :

```
http://localhost:3000/auth/callback
https://app.tarineo.com/auth/callback
https://*.vercel.app/auth/callback
```

Si Google est activé, le même callback :

`https://app.tarineo.com/auth/callback`

Ne pas mettre `navpit.com` ni `localhost` dans Site URL de **production**.

---

## 6. DNS

| Hôte | Cible |
|------|--------|
| `app.tarineo.com` | projet Vercel **app** (login + métier) |
| `www.tarineo.fr` | site public (même projet ou autre — s’il 500, corriger ce deploy à part) |

---

## Vérification après config

1. `https://app.tarineo.com/login` → formulaire TARINEO  
2. Inscription → mail `TARINEO <contact@tarineo.fr>` → liens `app.tarineo.com`  
3. Checkout → lookup `tarineo_*` présentes
