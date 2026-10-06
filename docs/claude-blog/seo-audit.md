# Audit SEO blog Tarineo — 2026-10-06

## Périmètre

16 articles publiés (dont pilier facturation électronique) (`lib/site/blog/posts.ts`), 10 hubs `/blog/metier/*`, sitemap + JSON-LD automatiques.

## Cannibalisation (mots-clés proches)

| Risque | Articles | Action |
|--------|----------|--------|
| Faible | Un pilier par `metierSlug` | OK : titres et slugs distincts |
| Moyen | « devis fournisseur » sur tous | Variantes dans `keywords` (ex. devis showroom, devis sinistre) |
| À surveiller | Futurs articles `content-ideas.ts` | Ne pas dupliquer l’intention du pilier métier |

## Meta descriptions

| Slug | Statut |
|------|--------|
| `plombier-devis-fournisseur-marge-chantier` | Ajustée (Point.P, longueur ~155 car.) |
| Articles courts (carreleur, menuisier avant enrichissement) | Corps enrichi ; meta inchangée mais suffisante |
| `serrurier-devis-securite-marge-intervention` | Nouvelle, unique sur « serrurier devis » |

## Actions appliquées

- `updatedAt` : **2026-10-06** sur tout le parc.
- Sections supplémentaires sur chaque article (profondeur, E-E-A-T terrain).
- `keywords` : +1 terme cible par article quand la liste était courte.
- Nouveau métier **serrurier** : type, hub, article, sitemap via `generateStaticParams`.
- Calendrier : **71 idées** dans `lib/site/blog/content-ideas.ts` (7–8 par métier, slugs réservés).

## Prochaines passes recommandées

1. Publier 1 article / mois depuis `content-ideas.ts` (publiés : `electricien-irve-borne-recharge-devis`, `couvreur-refection-toiture-devis`, `entreprise-marge-par-chantier-tableau`).
2. Vérifier dans GSC les requêtes « devis + métier » après 4–6 semaines.
3. Maillage interne : depuis chaque article, le hub métier est déjà lié ; ajouter des liens croisés entre 2 articles seulement quand un second article existe.

## Hors scope audit

- Pas de stats de trafic inventées.
- Pas de Cedéo dans les exemples publics (règle marque).
