---
name: navpit-promo
description: Recreate Navpit product videos and Remotion scenes that clone the live dashboard (Mono Lead shell, Accueil, Projets, Planning, Abonnement). Use when making a promo, presentation, MotionVid-style explainer, Remotion composition, or any marketing animation of the app.
---

# Navpit promo — filmer l’app réelle

La vidéo n’est pas un motion graphics SaaS générique. Chaque plan est le cockpit tel qu’on l’utilise : barre noire, carte blanche, tokens Mono Lead, Reveal.

## Workflow

1. Lire `app/globals.css` `@theme` et `components/motion/reveal.tsx` — ne jamais inventer de couleurs ni d’easing.
2. Cloner le chrome (`AppShell`) avant le contenu de la scène.
3. Animer uniquement `opacity`, `translateY` et `blur`, avec l’easing produit.
4. Interdits dans les noms Remotion `Folder` / `Composition` : accents, espaces, `_`. ASCII `A-Z a-z 0-9 -` seulement.

## Chrome (layout `(app)`)

- Fond page `#f3f3f2`. Sidebar `#111111` 252 px, labels mono 11.5 px uppercase tracking 0.1 em, item actif = dégradé blanc 16 % → 0.
- Zone principale : carte `#ffffff` radius 18, `shadow-soft`, topbar search + pastille plan + avatar.
- Contenu max 1080 px, padding 24. Logo Space Grotesk 24 bold, point `#9a9a9a`.
- Mobile : barre bas `#1f1f1f` uniquement si le plan est un viewport téléphone.

## Tokens (copier, ne pas approximer)

| Token | Valeur |
| --- | --- |
| bg / surface / ink / muted | `#f3f3f2` / `#ffffff` / `#111111` / `#8c8c8c` |
| line | `rgba(17,17,17,0.08)` |
| glow 1 / 2 / 3 | `#f7c6a3` / `#cbbdf3` / `#b3cbf6` |
| Focus / Pause / Fini | `#16a34a` + `#e8f7ee` + `#166534` · `#eab308` + `#fdf6dc` + `#854d0e` · `#dc2626` + `#fdecec` + `#991b1b` |
| shadow-soft | `0 0 0 1px rgba(0,0,0,0.04), 0 2px 6px rgba(0,0,0,0.04), 0 16px 40px -18px rgba(0,0,0,0.18)` |
| Titres | Inter Tight 600, tracking `-0.045em` |
| Labels | JetBrains Mono, `/ LABEL ///` |

## Motion produit (pas marketing bounce)

Source : `EASE = [0.2, 0.8, 0.2, 1]` = `cubic-bezier(0.2, 0.8, 0.2, 1)`.

| Effet | Recette |
| --- | --- |
| Reveal | `opacity 0→1`, `y 14→0`, `blur 6→0`, 0.6 s (18 f à 30 fps), ease-out-soft |
| Stagger | 0.07 s (2 f) entre enfants |
| Entrée carte | jamais `scale(0)` — si scale, `0.95` |
| Barres semaine | `scaleY(0)→1`, origin bottom, 0.7 s, delay 50 ms / jour |
| Caret prompt | clignote 45 % on / 50 % off |
| Transitions de scènes | fade 14 f, pas de wipe 3D |

Marketing (CTA final) peut durer plus longtemps. Le reste reste dans le langage produit.

## Scènes = routes réelles

| Plan | Route | Contenu à cloner |
| --- | --- | --- |
| Accueil | `/accueil` | GlowCard « Bonjour {prénom} », titre « Comment puis-je t’aider aujourd’hui ? », PromptBox + chips AUTOMATIONS, calendrier, Ma semaine, 3 actions rapides |
| Copilote | barre d’accueil | mascotte / caret, texte tapé, chips « Rédiger un mail », « Résumer un fichier », « Schéma du parcours » |
| Projets | `/projets` | cartes `card-soft`, StatusBadge (pastille + point), StageBar 6 étapes (Valider…Scale), « Prochaine action » |
| Planning | carte Accueil | grille mois L M M J V S D, jour actuel en noir |
| Prix | `/abonnement` | paliers 15 / 12 / 9 €, cartes loyalty, pas un bar chart inventé |
| CTA | landing / ink | fond `#111`, logo Grotesk, bouton pill blanc |

Données démo stables : projet Focus « Studio Devis », Pause « Menu QR », Fini « Portfolio ». Prénom « Noam ». Plan gratuit.

## Interdit

- Cartes flottantes hors shell, gros titres seuls sur halo pastel, bar charts de prix, mascotte qui flotte.
- Couleurs, typos ou easings qui ne sont pas dans `@theme`.
- Texte Lorem ou features qui n’existent pas dans l’app.

Voir [reference.md](reference.md) pour le chrome pixel et les helpers Remotion.
