# Navpit — prêt pour le marketing (checklist)

Dernière vérif : 14 oct. 2026 — **landing v2** en production (`main`, voir `DESIGN.md` § Release production).

## Verdict rapide

| | |
|---|---|
| **Build local** | OK (`npm run build`) |
| **Push Git** | Landing v2 commitée sur `main` (oct. 2026) — suivre `git push` + deploy Vercel pour toute évolution |
| **Vercel** | Projet `navpit` lié, prod OK, dernier deploy ~2 h |
| **Marketing sans vidéo motion** | OK : landing, inscription, prix, SEO, réseaux, newsletters |

## Vercel — variables **Production** (état actuel)

Présentes :

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `ANTHROPIC_API_KEY` / `ANTHROPIC_MODEL`
- `NAVPIT_OPEN_ACCESS`
- `NEXT_PUBLIC_LOGO_DEV_TOKEN`

**À ajouter avant campagne :**

| Variable | Valeur | Pourquoi |
|----------|--------|----------|
| `NEXT_PUBLIC_APP_URL` | `https://www.navpit.com` | Canonical, emails, OAuth redirects |
| `GOOGLE_SITE_VERIFICATION` | balise Search Console | Indexation Google |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | `G-…` (optionnel) | Mesurer l’organique après cookies |

**À confirmer (valeur chiffrée) :**

- `NAVPIT_OPEN_ACCESS` = **`false`** en prod (sinon pas de vraie connexion marketing)

Pas encore sur Vercel (OK pour lancer en gratuit, bloquant pour payer) :

- `STRIPE_SECRET_KEY` + webhook Supabase
- `RESEND_API_KEY` (emails bienvenue)

Commande : `vercel env add NOM production`

## Google Cloud (OAuth connexion)

1. Client OAuth **Application Web**
2. Origines : `http://localhost:3000`, `https://www.navpit.com`
3. Redirect : `https://<ref>.supabase.co/auth/v1/callback`
4. Supabase → Auth → Google : ID + secret
5. Supabase → URL config : Site `https://www.navpit.com`, redirects `/auth/callback`

## Supabase

- [ ] Site URL + Redirect URLs (voir README §4)
- [ ] Google provider activé
- [ ] `db push` + migrations à jour si nouvelles tables

## SEO / IA (après prochain deploy)

- [ ] `https://www.navpit.com/robots.txt` accessible **sans login** (fix middleware)
- [ ] `https://www.navpit.com/sitemap.xml` idem
- [ ] `https://www.navpit.com/llms.txt` idem
- [ ] Search Console : sitemap soumis

## Git → prod

```bash
git add -A   # revue avant commit
git commit -m "…"
git push origin main
```

Vercel redéploie automatiquement si le repo GitHub est connecté.

## Marketing sans motion design

Tu peux lancer avec :

- Landing + CTA inscription
- Posts LinkedIn / X (captures produit, pas vidéo)
- Product Hunt / communautés fondateurs FR
- Email perso à ta liste
- SEO long terme (guides — voir `www.navpit.com-audit/ACTION-PLAN.md`)

Les vidéos promo (`promo/`, Remotion) peuvent rester en pause.
