---
name: navpit-landing
description: Construire une landing Navpit en cinq minutes. Lis le DESIGN.md du projet, suis les 12 frames, n'invente aucun hex. À utiliser pour une page d'accueil SaaS, un hero bibliothèque, ou un prompt Cursor collé depuis /bibliotheque/heros.
---

# Navpit landing (protocole Open Design)

Même contrat qu'Open Design : skill + DESIGN.md + artifact. Pas le studio desktop.

## Avant de coder

1. Lis le DESIGN.md du projet (tokens du thème kit, ou le bloc collé avec le brief hero).
2. Lis les variables `{{MARQUE}}` `{{TITRE}}` `{{COULEUR_*}}` `{{URL_PORTRAIT}}`.
3. Une ligne de lecture : « Landing [niche] pour [cible], tokens [thème], hero = image. »

## Sortie

- Un fichier : `components/hero.tsx` (client) **ou** un `index.html` self-contained si le brief le dit.
- CSS = tokens DESIGN.md seulement. Accent 2 fois max.
- Photo réelle via `{{URL_PORTRAIT}}`. Jamais un mesh vide, jamais un faux dashboard en divs.
- Copy réelle. Pas de lorem, pas de chiffres inventés.

## 12 frames (ordre)

Navbar → Hero → Preuve → Probleme → Marche → Fonctions → Demo → Temoignages → Resultats → Tarifs → FAQ → CTA.

Le hero EST l'image. Nav overlay, pas un split texte / petite photo.

## Interdits

Violet IA, mesh noir, crème + bronze + espresso, Inter sur void, serif par défaut, em-dash déco, trois cartes features égales.

## Après

Attacher le HTML au projet Navpit (`kind: landing`) ou coller le prompt dans Cursor. Rester dans Navpit.
