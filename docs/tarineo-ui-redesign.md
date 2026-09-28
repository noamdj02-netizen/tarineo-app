# TARINEO — Refonte UX/UI (contenu uniquement)

Sidebar, navigation, APIs et logique métier : **intouchables**.

## Checklist phases

| Phase | Statut | Notes |
|-------|--------|-------|
| A Tokens + app-ui | done | bg `#f3f3f2`, ErrorState, SectionHeader, MetricStrip |
| B Shell header | done | PageHead sans titres marketing |
| C Accueil | done | SectionHeader sur HomeDashboard |
| D Docs distributeur | done | copy + DocumentBrowser filtres |
| E Docs entreprise | done | copy + filtres lifecycle |
| F Fiche document | done | MetricStrip + sections |
| G Chantiers | done | copy + empty filtre + badge statut fiche |
| H Achats / fournisseurs | done | headers + EmptyState |
| I Hausses / comparateur | done | cartes + table écarts |
| J Entreprise / tarifs / support | done | `/support` (sidebar mailto inchangé) |
| K Assistant | done | libellés panneau + presets |
| L Empty / loading / error | done | loading routes + `app/(app)/error.tsx` |
| M Responsive + QA | done | tsc / lint / build |

---

## PHASE A — Tokens + composants globaux

### Fichiers
- `app/globals.css` — `--color-bg` / `--color-search` → `#f3f3f2`
- `components/app-ui/error-state.tsx` — créé
- `components/app-ui/section-header.tsx` — créé
- `components/app-ui/metric-strip.tsx` — créé
- `components/app-ui/index.ts` — créé
- `components/app-ui/empty-state.tsx` — `action` optionnel

### Métier
Aucune.

---

## PHASE B — Shell header

### Fichiers
- `components/shell/page-head.tsx` — `tail` ignoré (titres produits clairs)

### Métier
Aucune. Sidebar / topbar non modifiés.

---

## PHASES C–E — Accueil + documents

### Fichiers
- `components/home/home-dashboard.tsx` — SectionHeader
- `components/metier/piece-kind-page.tsx` — DocumentBrowser
- `components/metier/document-browser.tsx` — créé (filtres UI pure)
- Routes `distributeur/*`, `client/*` — copy produit

### Métier
Filtres dérivés de `sent_at`, `source_document_id`, `chantier_id` — pas de nouvelles tables.

---

## PHASES F–G — Pièces + chantiers

### Fichiers
- `app/(app)/pieces/[id]/page.tsx` — meta strip + sections
- `app/(app)/chantiers/page.tsx` — description clarifiée
- `components/metier/chantier-fiche.tsx` — badge statut client
- `components/metier/chantier-grid.tsx` — EmptyState filtre

---

## PHASES H–J — Achats, fournisseurs, hausses, comparateur, entreprise, tarifs, support

### Fichiers
- `app/(app)/achats/page.tsx`, `fournisseurs/page.tsx`, `hausses/page.tsx`, `comparateur/page.tsx`
- `app/(app)/entreprise/page.tsx`, `components/metier/entreprise-form.tsx`
- `app/(app)/abonnement/page.tsx` — titres clairs (prix inchangés)
- `app/(app)/support/page.tsx` — **créé** (FAQ + mailto) ; sidebar Support reste mailto
- `app/(app)/compte/page.tsx` — lien Support

---

## PHASES K–L — Assistant + états

### Fichiers
- `components/assistant/assistant-panel.tsx`, `chat.tsx` — libellés / presets
- `app/(app)/error.tsx` — ErrorState
- `app/(app)/accueil/loading.tsx`, `chantiers/loading.tsx`, `client/devis/loading.tsx`

---

## PHASE M — QA

- Sidebar : non touchée
- Navigation mobile : non touchée
- Backend / Agent Core / APIs : non touchés

### Problèmes connus
- Filtres « Brouillons » vs « À envoyer » : distinction via présence de lignes (pas de statut DB dédié).
- Impact € des hausses : non affiché (donnée absente — conforme au brief).
