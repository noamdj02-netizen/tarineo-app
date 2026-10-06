---
name: tarineo-blog
description: >-
  Blog marketing Tarineo avec claude-blog (AgriciDaniel). Use when writing,
  auditing, outlining, or SEO-optimizing articles for /blog, artisans BTP France,
  or when the user mentions claude-blog, tarineo blog, or blog SEO.
---

# Tarineo Blog (claude-blog + Next.js)

Combine le moteur **[claude-blog](https://github.com/AgriciDaniel/claude-blog)** (skills `blog`, `blog-write`, `blog-analyze`, etc. dans `.cursor/skills/`) avec le **blog codé en dur** de ce repo.

## Avant d’écrire

1. Lire `branding/BRAND.md` et `branding/VOICE.md`.
2. Pour la méthode complète, ouvrir `vendor/claude-blog/skills/blog/SKILL.md` ou le skill copié `.cursor/skills/blog/SKILL.md`.
3. Sous-skill utile : `blog-write` (rédaction), `blog-outline` (plan), `blog-seo-check`, `blog-schema`, `blog-geo` (citation IA), `blog-cannibalization` (doublons avec posts existants).

## Plateforme cible : Next.js App Router (pas MDX fichier seul)

| Élément | Chemin |
|--------|--------|
| Types | `lib/site/blog/types.ts` |
| Articles | `lib/site/blog/posts.ts` (`BLOG_POSTS`, helper `post()`) |
| Hubs métier | `lib/site/blog/metier-hubs.ts` |
| Index | `app/(site)/blog/page.tsx` |
| Article | `app/(site)/blog/[slug]/page.tsx` |
| Hub métier | `app/(site)/blog/metier/[metierSlug]/page.tsx` |
| UI | `components/site/blog/*` |
| Sitemap | `app/sitemap.ts` |
| JSON-LD | `lib/seo/json-ld.ts` |

## Format d’un article (`BlogPost`)

- `slug` kebab-case, unique, français sans accents dans l’URL.
- `metier` + `metierSlug` alignés sur `BLOG_METIERS` / `BlogMetierSlug`.
- `metaDescription`, `keywords[]`, `problems[]` (puces terrain), `sections[]` (heading + paragraphs).
- `publishedAt` / `updatedAt` ISO ; mettre à jour `updatedAt` lors d’une révision SEO.
- Pas de Cedéo dans les exemples fournisseurs publics ; préférer Point.P, Rexel, Brossette, négoce générique.

## Workflow recommandé (contrat qualité simplifié)

1. **Brief** : métier, intention de recherche, lien avec produit Tarinéo (analyse devis, marge).
2. **Outline** : appliquer les principes `blog-outline` ; vérifier cannibalisation avec les slugs existants dans `posts.ts`.
3. **Rédaction** : contenu en français dans `posts.ts` (pas de markdown orphelin hors repo).
4. **SEO** : title/description, breadcrumb, `blogPostingJsonLd` déjà branchés sur `[slug]/page.tsx` ; ajouter URL hub métier au sitemap si nouveau métier.
5. **Relecture** : lisibilité, pas de stats inventées ; CTA vers `/inscription` ou `/#devis-facture`.

## Commandes claude-blog (Claude Code)

Si l’utilisateur a installé via `scripts/install-claude-blog.sh`, les commandes `/blog write`, `/blog analyze`, etc. fonctionnent dans **Claude Code**. Dans **Cursor**, invoquer les skills par nom (`blog-write`, `blog-analyze`) ou ce skill `tarineo-blog`.

## Hors scope

- Billing, ingest API, app authentifiée, landing v2 (sauf liens CTA).
- Génération d’images hero obligatoire claude-blog : optionnelle ; le blog Tarineo n’utilise pas encore de hero image par article.

## Install / mise à jour

```bash
./scripts/install-claude-blog.sh
```

Voir `docs/claude-blog/README.md`.
