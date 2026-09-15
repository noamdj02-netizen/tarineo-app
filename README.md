# Tarineo

SaaS pour artisans du bâtiment français (plombiers-chauffagistes, électriciens, multi-corps d'état) qui protège leur marge en comparant leurs devis/factures fournisseurs à leur propre historique d'achats — jamais un comparateur public.

L'artisan importe un devis (photo, PDF) d'une enseigne comme Cedeo, Point P, Rexel... L'IA (Claude, vision) en extrait les références, prix et quantités, puis compare chaque prix à l'historique personnel de l'artisan chez ce distributeur : en cas de hausse, une alerte s'affiche avec le montant et le pourcentage.

## Stack

- **Next.js (App Router) + TypeScript**
- **PostgreSQL** via **Prisma**
- **Auth.js** — email + mot de passe (Credentials, bcrypt) + Google, session JWT
- **Anthropic Claude** (vision) pour l'extraction des devis/factures
- **Supabase Storage** pour les fichiers uploadés
- **Resend** pour l'email de réinitialisation de mot de passe
- **Stripe** pour les abonnements (à venir)

## Prérequis

- Node.js 20+
- Une base PostgreSQL (Supabase, Neon, Scaleway...)
- Un compte [Resend](https://resend.com) (email de réinitialisation de mot de passe)
- Un compte [Anthropic](https://console.anthropic.com) (extraction IA)
- Un bucket [Supabase Storage](https://supabase.com) privé (fichiers uploadés)
- Des identifiants OAuth Google (optionnel, pour la connexion Google)

## Installation

```bash
git clone https://github.com/Tarineo-app/tarineo-app.git
cd tarineo-app
npm install
```

### Variables d'environnement

Copiez `.env.example` en `.env` et remplissez les valeurs :

```bash
cp .env.example .env
```

| Variable | Description |
| --- | --- |
| `DATABASE_URL` | URL de connexion PostgreSQL |
| `AUTH_SECRET` | Clé secrète Auth.js, générée avec `npx auth secret` |
| `AUTH_URL` | Adresse de l'app en local (`http://localhost:3000`). **À laisser vide/absent** si vous testez aussi depuis un autre appareil sur le réseau local (téléphone) : Auth.js détecte alors l'origine depuis chaque requête. Google OAuth ne fonctionne de toute façon que depuis `localhost` (Google refuse les IP privées). |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Depuis [Google Cloud Console](https://console.cloud.google.com) > APIs & Services > Credentials > OAuth 2.0 Client IDs. URI de redirection autorisée à configurer côté Google : `{AUTH_URL}/api/auth/callback/google` |
| `RESEND_API_KEY` / `EMAIL_FROM` | Pour l'email de réinitialisation de mot de passe |
| `ANTHROPIC_API_KEY` | Extraction des devis/factures par l'IA |
| `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` / `SUPABASE_STORAGE_BUCKET` | Stockage des fichiers. ⚠️ `SUPABASE_SERVICE_ROLE_KEY` donne un accès complet, ne jamais l'exposer côté client |
| `STRIPE_*` | Abonnements (Phase 4, pas encore utilisé) |

### Base de données

```bash
npx prisma migrate dev
```

Applique toutes les migrations sur la base configurée dans `DATABASE_URL`.

### Lancer le serveur de développement

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000).

## Scripts disponibles

| Commande | Description |
| --- | --- |
| `npm run dev` | Serveur de développement (Turbopack) |
| `npm run build` | Build de production |
| `npm run start` | Lance le build de production |
| `npm run lint` | ESLint |

## Test sur téléphone (réseau local)

Le serveur dev écoute aussi sur l'IP réseau (affichée au démarrage, ex. `http://192.168.x.x:3000`). Pour que ça fonctionne :

1. Laissez `AUTH_URL` **absent** de `.env` (voir ci-dessus).
2. `next.config.ts` contient déjà `allowedDevOrigins` avec une IP réseau (celle utilisée lors du développement initial) — remplacez-la par la vôtre (visible dans le "Network:" affiché au démarrage de `npm run dev`). Sans ça, Next.js bloque silencieusement les ressources JS pour les requêtes hors `localhost` (la page s'affiche mais rien n'est cliquable, sans erreur visible).
3. La connexion Google ne sera testable que depuis `localhost` (Mac), pas depuis le téléphone — c'est une restriction de Google sur les IP privées, pas un bug de l'app.
