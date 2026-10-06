# TARINEO — Audit de nettoyage safe (GitHub + Vercel)

**Date :** 2026-10-06  
**Règle :** aucune suppression effectuée dans cette phase — inventaire et recommandations uniquement.

---

## Synthèse

| Zone | Volume estimé | Action recommandée |
|------|---------------|-------------------|
| Landing v1 (`components/site/landing-*.tsx` hors v2) | ~30 fichiers, graphe partiel | **REVIEW** — beaucoup orphelins, chaîne `/prix` + `landing-deferred` à préserver |
| Landing v2 | Actif (`app/(site)/page.tsx`) | **KEEP** |
| `promo/` | ~299 Mo | **REVIEW** — hors build Next racine |
| `remotion/` | ~508 Ko code + scripts npm | **KEEP** (scripts `remotion:*`) |
| `tarineo-remotion-medias.zip` | ~42 Mo, **non tracké git** | **SAFE_DELETE** local |
| `.cursor/skills/` | ~3 Mo, surtout **untracked** | **REVIEW** — ne pas pousser ; ignorer git |
| `www.navpit.com-audit/` | 3 fichiers, **trackés** | **REVIEW** — rapports Navpit |
| `docs/landing-mockup/` | HTML statique | **REVIEW** |
| Migrations Supabase | 31 fichiers | **DO_NOT_TOUCH** |
| Intégrations / automation | `lib/integrations`, crons | **DO_NOT_TOUCH** |

---

## 1. SAFE_DELETE

*(Aucune suppression auto — candidats après validation humaine.)*

| Chemin | Type | Raison | Références | Risque | Recommandation |
|--------|------|--------|------------|--------|----------------|
| `tarineo-remotion-medias.zip` | Archive | Médias Remotion dupliqués / export local | Non listé dans `git ls-files` ; pas d’import code | Faible si copie ailleurs | Supprimer **en local** ou déplacer hors repo ; ajouter `*.zip` au `.gitignore` |
| `.DS_Store` (si présents) | Système | Déjà dans `.gitignore` | — | Nul | Supprimer localement si visibles |

---

## 2. REVIEW

### 2.1 Ancienne landing (composants `components/site/landing-*.tsx` sauf v2)

**Contexte :** la home utilise `LandingV2Page` (`app/(site)/page.tsx`). Une **chaîne vivante** reste via :

- `app/(site)/prix/page.tsx` → `landing-deferred.tsx` → imports dynamiques : `landing-pricing`, `landing-faq-tabs`, `product-demo/*`.

| Chemin | Type | Raison | Dernière utilisation | Références | Risque | Recommandation |
|--------|------|--------|----------------------|------------|--------|----------------|
| `components/site/landing-hero.tsx` | Composant | Ancien hero | Aucun import app/layout | Seulement définition + `hero-benefits` | Moyen si suppression en bloc | **REVIEW** — orphelin direct |
| `components/site/hero/hero-benefits.tsx` | Composant | Hero v1 | Via `landing-hero` uniquement | 1 import (`landing-hero`) | Moyen | Supprimer **avec** `landing-hero` après validation |
| `components/site/landing-atmosphere.tsx` | Composant | Fond v1 | Aucun import externe détecté | 0 | Faible | Candidat suppression **après** grep + build |
| `components/site/landing-problem.tsx` | Composant | Section v1 | Orphelin | 0 export utilisé | Faible | Idem |
| `components/site/landing-product-showcase.tsx` | Composant | Showcase v1 | Orphelin (commentaire deferred) | Importe `landing-deferred` mais **personne n’importe le showcase** | Faible | Idem |
| `components/site/landing-deferred.tsx` | Client dynamic | `/prix` + démos | **Actif** | `prix/page.tsx`, product-showcase | **Élevé si supprimé** | **KEEP** jusqu’à refonte `/prix` |
| `components/site/landing-pricing.tsx` | Composant | Tarifs | Dynamic import deferred | `landing-deferred` | Élevé | **KEEP** |
| `components/site/landing-faq-tabs.tsx` | Composant | FAQ | Dynamic import deferred | `landing-deferred` | Élevé | **KEEP** |
| `components/site/landing-button.tsx` | UI | Boutons marketing | **Actif** | `site-nav`, `site-footer`, `avis`, pricing | Élevé | **KEEP** |
| ~20 autres `landing-*.tsx` (marquee, folio, founder, etc.) | Composants | Ancienne landing | Souvent 0 import hors graphe interne mort | Analyse manuelle / outil deps | Moyen | Lot **REVIEW** : supprimer par PR dédiée + `npm run build` |

| Chemin | Type | Raison | Références | Risque | Recommandation |
|--------|------|--------|------------|--------|----------------|
| `public/landing/hero-motion.mp4` | Vidéo | Hero v1 motion | Aucune ref `hero-motion` dans `app/components/lib` (recherche 2026-10-06) | Faible | **REVIEW** — ~lourd ; garder si campagne marketing |
| `public/landing/hero-motion-poster.jpg` | Image | Poster associé | Idem | Faible | Idem |
| `public/landing/v2/mascots/*.webp` | Assets | Landing v2 | `Mascot.tsx` / sections v2 | — | **KEEP** |

### 2.2 Doublons / legacy naming

| Chemin | Type | Raison | Références | Risque | Recommandation |
|--------|------|--------|------------|--------|----------------|
| `public/brand/tarineo-logo.png` | Logo | Ancien raster ? | `supabase/functions` email HTML, possible e-mail | Moyen | **REVIEW** avant delete |
| `public/brand/tarineo-mark.png` | Logo | Marketing / OG | `lib/brand`, `opengraph-image`, demos | — | **KEEP** |
| `docs/tarineo-cleanup-plan.md` | Doc | Plan sept. 2026 | Partiellement dépassé (automatisations ≠ Navpit) | Nul | Fusionner avec ce doc ou archiver |
| `docs/tarineo-final-qa.md`, `docs/tarineo-qa-checklist.md` | QA | Plusieurs checklists | Ops | Nul | **REVIEW** — garder le plus récent (`automation-engine-qa`, `staging-smoke-checklist`) |
| `docs/landing-design.md` | Doc design | Landing v1 ? | Référence historique | Nul | **REVIEW** |
| `docs/landing-mockup/index.html` | Mockup statique | Maquette hors app | Non servi par Next | Faible | **SAFE_DELETE** ou déplacer hors repo |
| `www.navpit.com-audit/*` | Rapport SEO | Marque Navpit | Tracké git, non importé build | Faible | **REVIEW** — retirer du repo prod si non pertinent |

### 2.3 Projets parallèles

| Chemin | Type | Raison | Références | Risque | Recommandation |
|--------|------|--------|------------|--------|----------------|
| `promo/` | App Remotion séparée | Vidéo launch Navpit/Tarineo | `package.json` racine **non** dépendant | Nul pour Vercel app | Repo séparé ou gitignore ; **ne pas** supprimer sans backup |
| `.cursor/skills/**` | Skills Cursor | Non produit | Untracked (sauf 4 fichiers) | Nul build | **Ne pas committer** ; étendre `.gitignore` si besoin |

### 2.4 ESLint / lint global

| Problème | Détail | Recommandation |
|----------|--------|----------------|
| `npm run lint` à la racine | ~7k issues | Cause probable : lint sur `.cursor/skills`, `promo`, etc. |
| `eslint app components lib` | 1 **error**, 18 warnings | Error : `components/tarineo/charts/chart-primitives.tsx` — `useId` conditionnel |

---

## 3. KEEP

| Chemin | Raison |
|--------|--------|
| `components/site/landing-v2/**` | Home production |
| `styles/landing-v2.css`, `lib/site/landing-v2-*` | Home |
| `app/(app)/**`, `lib/metier/**`, `lib/automation/**` | Produit artisan |
| `lib/integrations/**` | Hub connexions Phase 1 |
| `supabase/migrations/**` | **Jamais supprimer** |
| `app/api/**` (21 routes) | Billing, cron, MCP, landing devis-demo, etc. |
| `remotion/**` + scripts `remotion:*` | Marketing / export vidéo |
| `public/brand/**`, favicons récents | App + PWA |
| Docs ops : `integrations-audit.md`, `integrations-runbook.md`, `automation-migration-runbook.md`, `MARKETING-GO-LIVE.md`, `staging-smoke-checklist.md` | Exploitation |
| `.env.example` | Template env |
| `lib/design-data/**`, `app/(app)/copilote`, `/outils` | Encore liés assistant / MCP (cf. `tarineo-cleanup-plan.md`) |

---

## 4. DO_NOT_TOUCH

| Chemin | Raison |
|--------|--------|
| `supabase/migrations/*.sql` | Schéma prod |
| `app/api/billing/**`, `app/api/cron/**`, `app/api/connect/google/**` | Stripe, relances, OAuth |
| `lib/billing/**`, `lib/email/**` | Resend / Stripe |
| `lib/connectors/**` | `/outils`, Stripe `rk_*` |
| `vercel.json` | Crons + redirects |
| `middleware` / `lib/supabase/middleware.ts` | Auth + webhooks |
| `package.json` scripts `build`, `postinstall` (patch react-pdf) | CI/Vercel |
| Fichiers JARVIS / assistant si présents | Hors scope cleanup |

---

## 5. Git / Vercel / secrets

| Élément | État | Recommandation |
|---------|------|----------------|
| `.env.local` | Présent localement, **ignoré** par `.gitignore` (`check-ignore` OK) | **Ne jamais committer** |
| `.env.example` | Tracké, sans secrets | **KEEP** |
| `.gitignore` | Couvre `.next`, `.next-dev`, `.env*`, `.vercel`, `node_modules` | **KEEP** ; envisager `*.zip`, `.cursor/skills/` |
| `next-env.d.ts` | Ignoré (généré) | OK |
| État git | Nombreux `??` `.cursor/skills`, modifs WIP | **Ne pas push** skills + valider diff avant commit |
| `package.json` name `navpit` | Nom historique npm | **KEEP** (changement = risque outil) ; optionnel rename plus tard |

---

## 6. Proposition de nettoyage **minimal** (ordre suggéré)

1. **Avant push :** corriger le **build** (voir verdict) — priorité P0 deploy.
2. **Local uniquement :** supprimer `tarineo-remotion-medias.zip` si archive ailleurs.
3. **`.gitignore` :** ajouter `*.zip`, `.cursor/skills/` (optionnel) — sans toucher au code métier.
4. **PR dédiée « landing v1 » :** arbre de dépendances depuis `landing-deferred` + suppression orphelins (`landing-hero`, `landing-atmosphere`, …) + `npm run build`.
5. **PR docs :** archiver `www.navpit.com-audit/` et `docs/landing-mockup/` si plus utiles.
6. **Ne pas** supprimer `promo/` sans décision produit (volume 299 Mo).

---

## 7. Vérifications exécutées (2026-10-06)

| Commande | Résultat |
|----------|----------|
| `npm run typecheck` | **OK** |
| `npx eslint app components lib` | **1 error** (`chart-primitives.tsx` hooks), 18 warnings |
| `npm run lint` (racine) | **Échec massif** (hors périmètre app — inclut skills/promo) |
| `npm run build` | **ÉCHEC** — voir ci-dessous |

### Blocage build (P0 deploy)

```
components/settings/integrations-board.tsx (client)
  → @/lib/integrations/registry.ts
    → test-connection.ts / verified-snapshot.ts ("server-only")
```

Le client importe `integrationSupportsConnectionTest` depuis `registry.ts`, qui ré-exporte des modules **server-only**. Next/Webpack refuse le bundle.

**Correction attendue (hors scope cleanup) :** exporter `integrationSupportsConnectionTest` depuis un fichier **sans** `server-only` (ex. `lib/integrations/client.ts`) ou dupliquer la liste `TESTABLE` côté client.

---

## 8. Verdict déploiement

### **NOT READY** pour GitHub + Vercel (production)

| Blocage | Priorité |
|---------|----------|
| `npm run build` échoue (import `server-only` dans client integrations) | **P0** |
| ESLint error `chart-primitives.tsx` (`useId` conditionnel) | **P1** (si CI lint strict) |
| Smoke staging automation / migrations (ops, pas cleanup) | **P0 ops** (cf. `staging-smoke-checklist.md`) |
| Gros untracked `.cursor/skills` — risque de commit accidentel | **P1** process |

### Prêt côté cleanup

- Inventaire documenté ; **aucune suppression** requise pour commencer le tri.
- `.env.local` non tracké ; migrations intactes.
- Typecheck OK.

### Quand **READY**

- `npm run build` vert sur branche de release.
- Politique lint CI clarifiée (`eslint` scope `app components lib` ou ignores).
- Commit sans `.cursor/skills` / zip / secrets.

---

*Audit only — stabilité prioritaire : conserver 20 fichiers inutiles vaut mieux qu’effacer un maillon de `landing-deferred` ou une migration.*
