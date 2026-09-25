# Chrome pixel + helpers Remotion

## AppShell (1920×1080)

```
[ bg #f3f3f2 ]
  [ sidebar 252 #111 | main card white radius 18, margin 8 8 8 0 ]
      [ topbar 60 h : search 400, pill plan, avatar 40 ]
      [ main max 1080, pad 24 32 ]
```

Onglets sidebar (ordre produit) : Accueil, Projets, Ressources, Outils, Schémas, Anatomie, Composants, Composants 2, Thèmes, Mes sites.

Bloc bas sidebar : `/ Démarrage` 3/5, barre blanche, « Ensuite : … ».

## Reveal Remotion

```ts
import { Easing, interpolate } from "remotion";
export const EASE = Easing.bezier(0.2, 0.8, 0.2, 1);
// start frame + index * 2 → 18 frames
```

## StatusBadge

Pill radius 999, mono 10.5, tracking 0.1 em, point 6 px + halo 3 px de la couleur statut.

## PromptBox

Surface blanche radius ~28, ombre soft, clip 44, micro 44, send 44 noir rond. Chips pill `shadow-soft`.
