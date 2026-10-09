# TARINEO — Audit UI app (2026-10-09)

> **Statut :** audit uniquement — document de sauvegarde.  
> **Sources :** Impeccable critique Accueil (dual-agent) + audit technique Operate (a11y / perf / thème / responsive / intégrité).  
> **Snapshot critique :** `.impeccable/critique/2026-10-09T12-32-19Z__app-app-accueil-page-tsx.md`

---

## Synthèse

| Piste | Score | Bande |
|-------|------:|-------|
| UX Accueil (Nielsen ×10) | **24/40** | Acceptable |
| Technique UI (5 dimensions) | **10/20** | Acceptable |

**Verdict :** le cœur métier (« À traiter », chantiers, copy BTP, orange/ivoire) est crédible. Accueil est trop dense (warehouse analytics), avec défauts a11y (dual `h1`) et coût client (insights toujours montés). Landing `#produit` a basculé du mock dashboard vers un film (~12 Mo).

---

## Scores techniques

| # | Dimension | Score | Finding clé |
|---|-----------|------:|-------------|
| 1 | Accessibility | 2 | Dual `h1` Accueil (`PageHeader` + `PromptHero`) |
| 2 | Performance | 2 | Home client sans `dynamic()` ; `TarineoDashboardInsights` toujours monté ; film produit ~12 Mo |
| 3 | Theming | 2 | Tokens OK ; ~135× `#FF6B1A` en dur ; violet/blue résiduels |
| 4 | Responsive | 2 | Mobile nav solide ; cluster CTA Accueil + cibles &lt; 44px |
| 5 | Implementation integrity | 2 | `DEMO_MARK` honnête ; Accueil ↔ insights / film « même interface » à clarifier |
| **Total** | | **10/20** | **Acceptable** |

---

## Scores UX Accueil (Nielsen)

| # | Heuristic | Score | Issue |
|---|-----------|------:|-------|
| 1 | Visibility of system status | 3 | Achats « — » sans CTA |
| 2 | Match system / real world | 3 | « Composer » / modèle IA hors métier |
| 3 | User control & freedom | 3 | Analytics incontournable |
| 4 | Consistency & standards | 2 | Patterns section / hausses dupliquées |
| 5 | Error prevention | 2 | CTAs / listes dupliquées |
| 6 | Recognition rather than recall | 3 | « À traiter » scannable |
| 7 | Flexibility & efficiency | 3 | ⌘K OK ; layout défaut lourd |
| 8 | Aesthetic & minimalist | 1 | ~10k px scroll / ~12 panels |
| 9 | Error recovery | 2 | Empty states partiels |
| 10 | Help & documentation | 2 | Peu d’aide in-situ charts |
| **Total** | | **24/40** | **Acceptable** |

---

## Issues prioritaires

### P0

1. **Accueil dual `h1`** — `components/app-ui/page-header.tsx` + `components/home/prompt-hero.tsx`  
   → Un seul greeting / un seul `h1`. Commande : `/impeccable clarify`

2. **Warehouse analytics Accueil** — `TarineoDashboardInsights` toujours monté (`home-dashboard-client.tsx`, `dashboard-insights.tsx`)  
   → Triage-first ; charts → `/achats` ou ≤2 cards. Commande : `/impeccable distill`

3. **Bundle Accueil sans code-split** — insights / charts / calendar dans le client graph  
   → `next/dynamic` + lazy. Commande : `/impeccable optimize` (ou distill en premier)

### P1

4. **Cluster CTA header Accueil (mobile)** — 4–5 actions avant triage  
   → 1 primary + overflow. Commande : `/impeccable adapt`

5. **Film landing ~12 Mo** — `public/landing/produit-demo.mp4`, `AppCapturePastilles.tsx`  
   → HLS / qualité plus basse / lazy poster-first. Commande : `/impeccable optimize`

6. **Theme drift `#FF6B1A`** — metier / home / tarineo vs `--tarineo-orange`  
   → Tokens uniquement. Commande : `/impeccable colorize` ou polish tokens

### P2

7. **`TopPriceIncreases` doublé** dans `dashboard-insights.tsx`  
8. **Overlap Accueil ↔ Fournisseurs insights**  
9. **Touch targets `size-9`** (topbar) / « Ajouter » fournisseurs petit  
10. **Footer film « Même interface que dans votre compte »** — film statique, pas shell live

### P3

11. Tokens violet / blues `studio.css`  
12. `AssistantPanel` toujours dans le layout app

---

## Points positifs à conserver

- Langage métier + noyau Operate (`ActionsSection`, `ProjectsSection`).
- `DEMO_MARK` (« Exemple ») sur données seed.
- Mobile nav : `aria-current`, reduced-motion, safe-area.
- Jauges fournisseurs mensuel / annuel (`SupplierSpendGauge`, `distributorGoalsMonthlyHt`).
- Landing `#produit` : video + poster + bouton lecture + `prefers-reduced-motion`.
- Accueil data fetch serveur (`Promise.all` queries).

---

## État produit récent (contexte audit)

| Domaine | État |
|---------|------|
| Création devis manuelle | Formulaire lignes + `createManualDevisAction` (hub mode manual) |
| Objectifs fournisseurs | Mensuel + annuel + jauges sur fiches |
| Signature mail IA | Paramètres Entreprise branchée |
| Landing `#produit` | Mock Dashboard remplacé par `/landing/produit-demo.mp4` |

---

## Actions recommandées (ordre)

1. **`/impeccable distill`** — Accueil triage-only ; sortir la ferme analytics  
2. **`/impeccable layout`** — Premier viewport : KPI → À traiter  
3. **`/impeccable clarify`** — Un greeting / un `h1`  
4. **`/impeccable adapt`** — Header mobile 1 CTA + Plus  
5. **`/impeccable quieter`** — Dédoublonner hausses / labels Composer  
6. **`/impeccable polish`** — Pass final après fixes  

---

## Notes détecteur

- CLI `impeccable detect` sur TSX Accueil → `[]` (couverture limitée, **non fiable**).  
- Browser inject Accueil → ~286 findings (surtout `undersized-ui-text` — beaucoup de faux positifs possibles).  
- Ne pas traiter le CLI vide comme « clean ».

---

*Généré le 2026-10-09 — sauvegarde pour `/impeccable polish` et suivi produit.*
