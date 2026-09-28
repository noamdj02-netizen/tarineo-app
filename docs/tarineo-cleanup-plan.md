# Plan de nettoyage TARINEO

Audit du 28 sept. 2026. Rien n’a été supprimé à ce stade. Les fichiers Navpit restent dans le dépôt ; l’expérience artisan ne doit plus y accéder.

## Problème

TARINEO a une boucle métier réelle (PDF → extraction → chantier → marge → devis / BC / facture → mail). L’expérience et une partie de l’infra portent encore Navpit : copilote fondateur, routes kit, e-mails, lookup Stripe `navpit_*`, fallback mémoire Dupont si Supabase échoue.

## 1. Métier TARINEO (conserver)

- `lib/metier/*`, `components/metier/*`, `app/(app)/{accueil,chantiers,client,distributeur,pieces,entreprise,hausses,achats,comparateur,fournisseurs,copilote}`
- `app/(app)/metier/actions.ts`
- PDF Alan `lib/metier/pdf/*`
- Nav `lib/nav.ts` (déjà métier)
- Auth, layout app, dashboard

## 2. Héritage Navpit (ne plus exposer)

| Zone | Fichiers | Risque | Solution |
|---|---|---|---|
| Routes kit | `/projets`, `/schemas`, `/composants`, `/composants-2`, `/ressources`, `/themes`, `/anatomie`, `/outils`, `/audit`, `/bibliotheque/*`, `/automatisations`, `/assistant` | Artisan tape l’URL | Redirect Next vers pages métier (plusieurs déjà en place). Compléter les manquants. Ne pas supprimer les fichiers (imports design-data / MCP). |
| Assistant | `lib/assistant/tools.ts`, `context.ts` | Réponses landings / Figma | Remplacer outils + prompt par métier (`lib/metier/queries`). |
| E-mails | `lib/email/auth-mail.ts`, `lib/auth/settle-session.ts`, `emails/*` | Marque Navpit | Textes + liens TARINEO. Accent e-mail = orange existant. |
| Stripe | `lib/billing/stripe.ts`, webhook Deno | Checkout `navpit_*` | Lookup `tarineo_*` avec repli `navpit_*` jusqu’au Dashboard. Documenter. |
| Open access | `NAVPIT_OPEN_ACCESS` | Preview sans login | Désactiver dès `NODE_ENV=production` (preview Vercel incluse). Local OK. |
| Seed mémoire | `lib/metier/queries.ts` `seedMem` après erreur SQL | Fausse persistence | Si session Supabase : erreur / liste vide. Mémoire seulement sans DB (dev). Seed demo seulement open-access local. |
| Compte MCP | `components/account/api-keys-card.tsx` | Copie Navpit | Réserver au owner. |
| Admin | `app/(admin)/*` | Analytics interne | Inaccessible artisan (déjà `sessionIsOwner`). |

## 3. Partagé (conserver)

Shell, shadcn, Framer Motion, Supabase clients, Resend `sendEmail`, Stripe SDK, middleware session, `getSiteUrl` / `NEXT_PUBLIC_APP_URL`.

## 4. Suppressible plus tard (pas maintenant)

`promo/`, `www.navpit.com-audit/`, `navpit-mcp/`, skills landing, `lib/heroes`, `lib/design-data` (encore importés par l’ancien assistant / jobs).

## 5. Inaccessible utilisateur

Admin, MCP, bibliothèque héros, schémas, composants kit — via redirects + owner-only.

## Config manuelle (ne pas simuler)

Voir `docs/tarineo-manual-config.md` après implémentation.
