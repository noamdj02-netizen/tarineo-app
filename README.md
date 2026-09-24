# Navpit

**The operating system for focused founders.**

Le cockpit pour piloter tes SaaS : un projet en focus jusqu'à sa première vente, en vraie app installable sur iPhone. → [www.navpit.com](https://www.navpit.com)

## 1. Lancer en local

```bash
npm install
cp .env.example .env.local   # puis remplis les valeurs (voir plus bas)
npm run dev
```

Ouvre http://localhost:3000

## 2. Les clés à remplir dans `.env.local`

| Variable | Où la trouver |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | même page (clé « anon public ») |
| `SUPABASE_SERVICE_ROLE_KEY` | même page. **Secrète** : seulement pour le seed et l'accès libre |
| `ANTHROPIC_API_KEY` | console.anthropic.com → API Keys. **Secrète** |
| `ANTHROPIC_MODEL` | `claude-sonnet-5` par défaut |
| `NAVPIT_OPEN_ACCESS` | `true` = pas de connexion (pratique en local). **Toujours `false` en ligne** |
| `SEED_USER_EMAIL`, `SEED_USER_FIRST_NAME` | ton email et ton prénom |
| `NEXT_PUBLIC_APP_URL` | en prod : `https://www.navpit.com` (Vercel → Environment Variables) |

`.env.local` n'est jamais envoyé sur git.

## 3. Base de données (une seule fois)

```bash
supabase link --project-ref TON_ID_PROJET
supabase db push      # crée les tables et la sécurité (RLS)
npm run seed          # importe data/seed.json : tes 4 projets et tes ressources
```

## 4. Mettre en ligne (Vercel + domaine)

1. **Vercel** → Project → **Settings → Domains** : ajoute `www.navpit.com` et `navpit.com` (redirection vers www gérée par le middleware + option « Redirect to www » dans Vercel).
2. Chez ton registrar DNS : enregistrements recommandés par Vercel (souvent `A` / `CNAME` vers Vercel).

```bash
vercel link           # la première fois
vercel env add NEXT_PUBLIC_APP_URL production    # https://www.navpit.com
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add ANTHROPIC_API_KEY production
vercel env add ANTHROPIC_MODEL production
vercel env add NAVPIT_OPEN_ACCESS production   # réponds : false
vercel --prod
```

3. **Supabase** → Authentication → URL Configuration :

- **Site URL** : `https://www.navpit.com`
- **Redirect URLs** (une ligne par URL) :
  - `https://www.navpit.com/auth/callback`
  - `https://navpit.com/auth/callback` (au cas où)
  - `http://localhost:3000/auth/callback` (dev)

Sans ça, le lien magique reçu par email ne te connecte pas.

4. **Stripe** (webhook Supabase) : `supabase secrets set APP_URL=https://www.navpit.com`

## 5. Checklist mise en ligne (20 points)

| # | Sujet | Dans le repo / à faire |
| --- | --- | --- |
| 1 | HTTPS forcé | Middleware + HSTS (`next.config.ts`) |
| 2 | Clés API hors front | Secrets sans `NEXT_PUBLIC_` (voir `.env.example`) |
| 3 | Mentions légales | `/mentions-legales` |
| 4 | Sauvegardes auto | Supabase : backups quotidiens (plan Pro) ou export manuel |
| 5 | Confidentialité | `/confidentialite` + section cookies |
| 6 | CGU / CGV | `/cgv` (alias `/cgu`) |
| 7 | Bandeau cookies | `CookieConsentBanner` + analytics conditionnelle |
| 8 | Responsive | Layout mobile + site public |
| 9 | Contraste | `--color-muted-ink` ajusté (WCAG AA) |
| 10 | Perf images | Illustrations SVG ; `next/image` pour bitmaps |
| 11 | Meta title + desc | `lib/seo.ts` + pages publiques |
| 12 | Textes alternatifs | `Illustration` avec `label` sur le marketing |
| 13 | Sitemap + robots | `/sitemap.xml`, `/robots.txt` |
| 14 | Search Console | `GOOGLE_SITE_VERIFICATION` sur Vercel |
| 15 | Favicon | `public/icons/` + `metadata.icons` |
| 16 | Image réseaux | `/opengraph-image` (1200×630) |
| 17 | 404 + liens | `app/not-found.tsx` + footer |
| 18 | Anti-spam | Honeypot inscription + rate limit Supabase |
| 19 | Analytics | `NEXT_PUBLIC_GA_MEASUREMENT_ID` (après consentement) |
| 20 | Un seul CTA | Hero `#commencer` = conversion ; nav renvoie vers le hero |

## 6. Installer sur l'iPhone

1. Ouvre l'adresse Vercel dans **Safari**.
2. Bouton Partager → **Sur l'écran d'accueil**.
3. Navpit s'ouvre en plein écran, comme une app. Les pages déjà ouvertes restent lisibles sans réseau.

## Commandes utiles

| Commande | Rôle |
| --- | --- |
| `npm run dev` | lancer en local |
| `npm run build` | vérifier que tout compile |
| `npm run lint` | vérifier le code |
| `npm run seed` | réimporter `data/seed.json` |
| `npm run design-data` | réextraire thèmes, frames, composants depuis « Studio Noam.html » |
| `npm run icons` | régénérer les icônes de l'app (`public/icons`) |
