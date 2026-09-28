# TARINEO — Final QA

Date : 28 septembre 2026  
Méthode : code + Stripe API + HTTP local + HTTP `app.tarineo.com`.  
**Pas** de création de compte A/B, **pas** d’upload PDF réel, **pas** d’inbox mail, **pas** de paiement test. Ces étapes n’ont pas été simulées.

## AUTH

**FAIL**

- `https://app.tarineo.com/login` → **HTTP 404** (Vercel, `x-matched-path: /404`). Inscription / confirmation / reset **impossibles** sur l’URL attendue.
- Local : `/login` → 307 (accès libre `NAVPIT_OPEN_ACCESS=true`) : ce n’est pas un parcours artisan payant.
- Preview Vercel dédiée : non testée (URL de preview non fournie / non utilisée ici).
- Google Auth : non testé.

## BOUCLE MÉTIER

**FAIL**

Parcours PDF → extraction → devis → PDF → mail → commande/facture **non exécuté** avec un compte réel.  
Le code et la page `/client/devis` (HTTP 200 en local, 4 modèles) existent ; ce n’est pas une preuve d’usage.

## PERSISTENCE

**FAIL**

Aucune donnée « Entreprise Test A / Client A / Chantier A » créée, ni refresh/logout/reconnexion mesurés.  
En local, l’accès libre peut encore **seeder** Dupont (`ensureMetierSeed` si open access) : ne pas s’en servir comme preuve.

En production, le code refuse le seed et remonte une erreur si la DB échoue — **non vérifié** en cassant Supabase.

## ISOLATION COMPTE A / B

**FAIL**

Deux comptes distincts n’ont pas été créés. Isolation **non mesurée**.

## IDOR

**FAIL**

URLs `/pieces/{idA}` et `/chantiers/{slugA}` en session B **non testées**.  
Dans le code : `getDocument` / `getChantier` filtrent `user_id` puis `notFound()` — ce n’est pas un PASS live.

## ANCIEN NAVPIT

**PASS**

Local, toutes les URLs demandées **307** vers le métier TARINEO (pas le kit) :

| URL | Destination |
|-----|-------------|
| `/projets` | `/chantiers` |
| `/schemas` | `/hausses` |
| `/composants` | `/client` |
| `/composants-2` | `/client` |
| `/ressources` | `/distributeur` |
| `/themes` | `/accueil` |
| `/anatomie` | `/achats` |
| `/outils` | `/fournisseurs` |
| `/audit` | `/comparateur` |
| `/bibliotheque/heros` | `/accueil` |
| `/automatisations` | `/accueil` |
| `/assistant` | `/accueil` |

`/api/mcp` en local : **401** (token MCP, pas l’UI Navpit). En preview/prod le middleware doit répondre **404** (non vérifié sur `app.tarineo.com`).

## ASSISTANT

**FAIL**

`/copilote` compile en local. Outils métier + `confirm=true` + consignes anti-invention : **revue code seulement**. Aucune question réelle sur des données du compte A.

## STRIPE

**MANUAL CONFIG**

Lookup keys interrogées sur le compte Stripe du `.env.local` :

| Lookup | État |
|--------|------|
| `tarineo_starter_month` | **ABSENT** |
| `tarineo_starter_year` | **ABSENT** |
| `tarineo_pro_month` | **ABSENT** |
| `tarineo_pro_year` | **ABSENT** |
| `tarineo_founder` | **ABSENT** |
| `navpit_starter_month` | FOUND (ignoré par le checkout) |
| `navpit_pro_month` | FOUND |
| `navpit_founder` | FOUND |

Checkout TARINEO **échouera** (`erreur=prix`) tant que les clés `tarineo_*` n’existent pas.  
Checkout / webhook / portal **non testés**.

## EMAILS

**MANUAL CONFIG**

- Templates React : marque TARINEO, liens via `appUrl` (`getSiteUrl()`). Noms internes `NavpitFonts` seulement.
- `.env.local` : `EMAIL_FROM=Navpit <bonjour@navpit.com>` → un mail envoyé **depuis cette machine** partirait encore en Navpit.
- `NEXT_PUBLIC_APP_URL` **absent** en local.
- Confirmation / reset / bienvenue / document / billing **non reçus** en vrai.

## MOBILE

**FAIL**

Aucun viewport mobile exercé (pas d’outil navigateur). Pas de bug visuel constaté ni invalidé.

## DESKTOP

**FAIL**

Local : `/accueil` 200, `/client/devis` 200. Pas de parcours clic (upload, PDF, assistant). Ce n’est pas un PASS desktop.

## BLOCKERS

1. **`https://app.tarineo.com/login` = 404** — l’artisan ne peut pas s’inscrire sur l’URL prévue.  
   **À faire manuellement :** DNS / projet Vercel / route `/login` sur `app.tarineo.com`.
2. **Lookup Stripe `tarineo_*` absents** — aucun paiement.  
   **À faire manuellement :** Stripe Dashboard ou `npm run stripe:setup` une fois (voir `docs/tarineo-manual-config.md`).
3. **`EMAIL_FROM` encore Navpit** dans l’env local (Vercel inconnu ici).  
   **À faire manuellement :** `EMAIL_FROM=TARINEO <contact@tarineo.fr>` + domaine Resend + `NEXT_PUBLIC_APP_URL=https://app.tarineo.com`.
4. **Auth + mails + boucle métier + isolation A/B** jamais joués sur une preview authentifiée.
5. **`https://www.tarineo.fr` a répondu 500** au fetch QA (site public). À diagnostiquer côté deploy.

## NON-BLOCKERS

- Cookies internes encore nommés `navpit_*`.
- Composant email `NavpitFonts` (non visible).
- Accès libre local (`NAVPIT_OPEN_ACCESS=true`) : normal en `next dev`, interdit en preview/prod par le code.
- Prix `navpit_*` encore dans Stripe : le code ne les utilise plus au checkout.
- `docs/tarineo-cleanup-plan.md` encore daté (mentionne l’ancien repli Stripe).

## VERDICT

**NOT READY**

Un premier artisan **ne peut pas** aujourd’hui : ouvrir `app.tarineo.com/login`, payer avec `tarineo_*`, ni s’appuyer sur une QA live compte A/B + PDF + mails.

Le build vert et le durcissement code **ne suffisent pas**.

Quand 1–3 sont faits : rejouer AUTH, boucle devis, isolation A/B, IDOR, Stripe test, mails reçus — puis seulement envisager **READY FOR FIRST USER**.
