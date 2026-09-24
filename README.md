# Navpit

**The operating system for focused founders.**

Le cockpit pour piloter tes SaaS : un projet en focus jusqu'à sa première vente, en vraie app installable sur iPhone. → navpit.com

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

`.env.local` n'est jamais envoyé sur git.

## 3. Base de données (une seule fois)

```bash
supabase link --project-ref TON_ID_PROJET
supabase db push      # crée les tables et la sécurité (RLS)
npm run seed          # importe data/seed.json : tes 4 projets et tes ressources
```

## 4. Mettre en ligne (Vercel)

```bash
vercel link           # la première fois
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add ANTHROPIC_API_KEY production
vercel env add ANTHROPIC_MODEL production
vercel env add NAVPIT_OPEN_ACCESS production   # réponds : false
vercel --prod
```

Ensuite, dans Supabase → Authentication → URL Configuration :

- **Site URL** : l'adresse Vercel (ex. `https://navpit.vercel.app`)
- **Redirect URLs** : ajoute `https://navpit.vercel.app/auth/callback`

Sans ça, le lien magique reçu par email ne te connecte pas.

## 5. Installer sur l'iPhone

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
