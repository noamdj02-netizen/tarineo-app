# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js 15 (App Router), React 19, Tailwind CSS v4, shadcn/ui, Supabase (auth + data), Stripe (billing), Resend (email), Anthropic (document extraction). Marketing routes under `app/(site)/`; product under `app/(app)/`.

## Users

Artisans et dirigeants de TPE du bâtiment en France (plombiers, électriciens, chauffagistes, rénovation, etc.). Ils gèrent devis clients, achats distributeurs (Cedeo, Point P, Rexel…), chantiers et marge — souvent le soir ou entre deux interventions.

## Product Purpose

TARINEO aide à **lire les documents fournisseurs**, **comparer les prix** à l’historique d’achat, **alerter sur les hausses**, puis **produire devis / factures clients** et **relances** avec validation humaine. Succès = marge protégée et moins de ressaisie administrative.

## Positioning

« L’assistant qui protège votre marge » — comparaison ligne par ligne des achats fournisseurs au prix habituel, rattachée aux chantiers, avant transformation en document client.

## Operating Context

PDF ou photo de devis / facture / bon fournisseur ; import manuel ou flux mail (selon configuration). L’utilisateur valide avant envoi client ou email fournisseur. Données hébergées en Europe (Supabase).

## Capabilities and Constraints

**Vérifié dans le code (marketing autorisé si formulé avec prudence) :**

- Import et extraction IA de documents fournisseurs (PDF / image).
- Comparaison des lignes à l’historique ; alertes hausses (seuil app ~3 %).
- Chantiers, clients, fournisseurs ; documents fournisseur et client.
- Transformation fournisseur → devis / commande / facture client (PDF).
- Relances devis (email via Resend, cron).
- Export comptable achats (plans Pro+).
- Copilote IA dans l’app (contexte métier).
- Tarifs Stripe : Starter / Pro / Équipe (voir `lib/site/landing-v2-content.ts`).

**Limites / à ne pas sur-vendre :**

- Pas un ERP complet ; ne remplace pas tout logiciel de devis.
- Fonctions marquées « bientôt » sur la landing = non disponibles.
- Démo landing : données étiquetées **Exemple** (`lib/site/tarineo.ts`, `landing-v2-content.ts`).
- Scénarios « Terrain » : personas illustratifs, **pas** des témoignages clients vérifiés (`ARTISAN_LANDING_REVIEWS`).

## Brand Commitments

- Nom : TARINEO / Tarinéo. Accent orange ~`#F25C19` / `#ec5821`, fonds ivoire, typo sobre B2B.
- Ton : concret, respectueux des artisans, français professionnel.
- CTA principal landing : `/inscription`, démo `#devis-facture` / analyse premier devis.

## Evidence on Hand

- Captures produit : `components/site/product-demo/`, `lib/site/product-demo.ts` (Exemple).
- Blog métier : `app/(site)/blog/`.
- Page `/avis` : témoignages fondateur / personas démo — ne pas présenter comme étude de cas chiffrée.
- Photos terrain : `public/landing/testimonials/artisans/` (stock chantier, crédits Unsplash dans `photoSource`).

## Product Principles

1. Vérité produit avant conversion — pas de stats ou logos inventés.
2. Marge et achats fournisseurs au centre du récit.
3. Contrôle humain sur tout envoi et toute décision client.
4. Démo clairement fictive quand les chiffres sont illustratifs.
5. UI crédible métier, pas template SaaS générique.

## Accessibility & Inclusion

WCAG visé sur le marketing : contrastes tokens, focus visible, `prefers-reduced-motion` sur Framer Motion landing.
