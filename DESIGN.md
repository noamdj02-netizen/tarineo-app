# Design — TARINEO marketing (web)

<!-- impeccable:design-schema 1 -->

## Mode

**Persuade** — landing publique, conversion vers essai / inscription. Page d’accueil = `components/site/landing-v2/landing-v2-page.tsx` uniquement (plus de landing v1). Ancres : `#top`, `#film`, `#fonctionnalites`, `#relances`, `#terrain`, `#tarifs`, `#faq`, `#contact`. Tarifs détaillés : `/prix` (même bloc `sections/Pricing.tsx`).

## Visual world

Premium BTP B2B : papier chaud (`paper-*`), encre `ink-*`, accent **tarineo-orange** pour action et alertes. Surfaces blanches, ombres douces (`shadow-float`, `shadow-card`), rayons ~`rounded-2xl`. Pas de dégradés violet/bleu, pas de glass décoratif, pas de halos permanents.

## Typography

Display / title pour H1–H2 (`text-display`, `text-title`), corps `text-body-lg` / `text-sm`, chiffres `nums`. Hiérarchie par taille + graisse, pas de gradient text.

## Layout

Conteneur `shell`, sections `LandingSection` avec ancrages (`#top`, `#film`, `#fonctionnalites`, `#relances`, `#terrain`, `#tarifs`, `#faq`, `#contact`). Grilles 1 col mobile → 2 col desktop pour hero et preuves. Mesure lecture ~65ch sur paragraphes.

## Components

Landing v2 : `components/site/landing-v2/` (Button, Badge, cards `landingCardClass`). shadcn `Card` pour blocs. Mascotte Tarinéo : usage limité (hero / CTA), pas mascotte IA partout.

## Motion

Framer Motion via `landing-motion` : entrées courtes, `useReducedMotion()`, pas d’animation bloquante. Barre progression orange section Terrain = indicateur de rotation, pas décor.

## Proof & honesty

Toute donnée chiffrée démo = libellé **Exemple**. Section Terrain = **scénarios illustratifs**. Logos distributeurs = reconnaissance de mise en page, pas partenariat.

## Do not

- Icône générique au-dessus de chaque titre de section.
- Cartes 3× identiques « feature / feature / feature » sans contenu métier.
- Témoignages présentés comme avis vérifiés sans preuve.
- Bordure gauche colorée comme seul callout (préférer fond `paper-50` + titre « En pratique »).

## Release production (landing v2)

| | |
|---|---|
| **Date** | 2026-10-14 |
| **Branche** | `main` |
| **Entrée** | `app/(site)/page.tsx` → `LandingV2Page` |
| **Déploiement** | GitHub `tarineo-app` → Vercel projet `tarineo-app` (production) |
| **Hors scope** | Ancienne landing v1 supprimée ; `/prix` partage `sections/Pricing.tsx` |

Commit de référence : `e320da2` — *Ship landing v2 Figma as sole marketing home.*
