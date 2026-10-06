# TARINEO — bundle Remotion (code + assets)

Archive pour Studio / render hors du monorepo Next.js.

## Contenu

| Dossier | Rôle |
|---------|------|
| `remotion/` | Compositions : **Template 4K**, Product V2, Compare showreel, Explainer, Dashboard motion |
| `public/brand/` | Logos TARINEO (`staticFile("brand/…")`) |
| `public/illustrations/tarineo-hd/` | Mascottes 3D HD |
| `public/remotion-audio/` | Bed + SFX (compare showreel) |
| `public/videos/` | Vidéos produit / posters (optionnel) |
| `promo/` | Projet Remotion **Navpit** legacy (launch video) — sans `node_modules` |
| `lib/brand.ts` | Dépendance de `dashboard-motion/data.ts` |
| `remotion.config.ts` | Config CLI à la racine du repo |

## Utilisation (dans le repo Tarineo complet)

```bash
npm install
npm run remotion                    # Studio
npm run remotion:render             # TarineoTemplate-4K
npm run remotion:render-product
npm run remotion:render-compare
```

**Composition canonique marketing :** `TarineoTemplate-4K` (3840×2160, ~25 s).

## Assets

Voir `remotion/ASSETS.md` pour l’inventaire détaillé et les chemins `staticFile()`.

Polices : `@remotion/google-fonts` (Inter Tight, JetBrains Mono) — pas de fichiers locaux.

## Promo (sous-dossier)

```bash
cd promo && npm install && npx remotion studio
```

Projet séparé ; assets dans `promo/public/`.
