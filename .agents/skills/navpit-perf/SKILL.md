---
name: navpit-perf
description: Performance et fluidité Navpit (Next.js 15). Utiliser avant d’ajouter du JS client lourd, des images, ou des sections marketing.
---

# Navpit — performance

## Principes

1. **Hero léger** — pas de gros chunks (démo cockpit, carousel, pricing) dans le premier paint.
2. **`DeferredMount`** (`components/ui/deferred-mount.tsx`) — sections sous la ligne de flottaison.
3. **`landing-deferred.tsx`** — `dynamic()` + skeleton pour Pricing, témoignages, FAQ, carousel solution.
4. **Product preview** — intro chat seule au chargement ; `product-preview-stage.tsx` après clic.
5. **Images** — mascottes `loading="lazy"` sauf `priority` ; logo.dev `unoptimized` OK (petit).
6. **Next** — `optimizePackageImports` pour `lucide-react` et `framer-motion` dans `next.config.ts`.
7. **App lourde** — `@excalidraw/excalidraw` uniquement sur routes schémas (déjà lazy côté éditeur).

## Checklist avant merge

- [ ] `npm run build` OK
- [ ] Pas de nouveau `"use client"` sur une page entière sans raison
- [ ] Animations respectent `useReducedMotion`
- [ ] Pas d’images PNG mascottes en `priority` hors above-the-fold critique

## Déploiement

Vercel : push sur la branche connectée → build automatique. Variables d’env production identiques à `.env.local` (Stripe, Supabase, `NEXT_PUBLIC_LOGO_DEV_TOKEN`, etc.).
