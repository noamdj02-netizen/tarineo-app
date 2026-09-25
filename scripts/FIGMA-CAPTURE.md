# Synchroniser l’app Tarineo → Figma

**Fichier :** [Tarineo (TvO91gJNuCUY5YJ7X52FTY)](https://www.figma.com/design/TvO91gJNuCUY5YJ7X52FTY/Tarineo)

Ce n’est **pas** Figma Code Connect (`.figma.ts`) : ici on envoie le **HTML réel** de l’app dans Figma (html-to-design), comme pour la page « App — Sync code ».

## Prérequis

1. `npm run dev` (ou cible prod avec `CAPTURE_BASE`)
2. Compte connecté (session Chromium persistante dans `.figma-capture-profile/`)
3. **IDs de capture** à usage unique dans `scripts/figma-capture-id-pool.json`  
   → Regénérer avec **Figma MCP** : `generate_figma_design` + `fileKey: TvO91gJNuCUY5YJ7X52FTY` (un appel = un ID = une page)

## Commandes

| Commande | Effet |
|----------|--------|
| `npm run figma:capture` | Toutes les pages **desktop** (listes + 4 fiches détail) |
| `npm run figma:capture -- --mobile` | Même parcours en **427×952** (accueil mobile, bottom nav…) |
| `npm run figma:capture -- --both` | Desktop puis mobile (2× plus d’IDs dans le pool) |
| `npm run figma:capture -- accueil` | Une seule page (slug) |
| `npm run figma:capture:prod` | Base Vercel au lieu de localhost |

Pages listées dans `scripts/figma-capture-pages.mjs` (analyses, coffre, veille, plus, abonnement, etc.).

## Étapes manuelles

1. Lancer la commande → Chromium s’ouvre.
2. Se connecter si demandé (2 min max).
3. **Ne pas fermer** la fenêtre jusqu’à la fin (~3–8 min selon le nombre de pages).
4. Ouvrir Figma → page des captures récentes.

## Erreur 409

L’ID a déjà été utilisé. Ajoutez de **nouveaux** IDs au pool (ne jamais réutiliser).

## Code Connect (optionnel, autre sujet)

Pour lier des **composants** Figma au code React (`MobileEconomiesCard`, etc.), il faut un plan Figma **Org/Enterprise**, des composants **publiés**, et des fichiers `.figma.ts` — voir la skill `figma-code-connect`.
