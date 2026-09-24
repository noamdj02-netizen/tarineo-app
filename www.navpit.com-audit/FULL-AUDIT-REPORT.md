# Audit SEO — navpit.com

**Date :** 24 sept. 2026  
**Type :** SaaS B2C — fondateurs solo (France)  
**Score santé SEO (estimé) :** **78 / 100** après correctifs code (avant déploiement ~62/100)

> Un score « 99 % » en organique pur est irréaliste sans autorité de domaine, contenu long-format et backlinks. L’objectif réaliste : **technique + schema + GEO à 95 %**, puis **contenu & netlinking** pour la croissance.

## Executive summary

| Priorité | Sujet |
|----------|--------|
| Critique | Déployer les changements schema / meta / robots (repo local ≠ prod actuelle) |
| Haute | Valider `GOOGLE_SITE_VERIFICATION` + soumettre sitemap dans Search Console |
| Haute | Contenu indexable : blog ou guides « cockpit fondateur / focus projet » |
| Moyenne | CrUX / CWV en prod (scripts tiers, hero motion) |
| IA | `llms.txt` + JSON-LD FAQ/SoftwareApplication (ajoutés) |

### Top quick wins (fait dans le repo)

- JSON-LD : Organization, WebSite, SoftwareApplication, FAQPage, BreadcrumbList (/prix)
- `public/llms.txt` pour citations ChatGPT / Perplexity / Google AI
- Canonical + `hreflang` fr-FR par page marketing
- Title/description home optimisés (intention « cockpit fondateur solo »)
- `robots.txt` : blocage étendu des routes app privées
- FAQ sémantique (`<article>`)

## Catégories

### Technique (82/100)

- HTTPS + www canonique (middleware) OK
- Sitemap : `/`, `/prix`, légal, auth — OK
- **Manque avant fix :** routes app partiellement listées en disallow → corrigé
- **Prod live :** HTML hero différent du repo (ancienne copy) → redéployer

### On-page (75/100)

- H1 unique, sections ancrées (#fonctions, #faq, #solution)
- Meta home enrichie dans le code
- Pages légales indexables — OK

### Schema (88/100 après déploiement)

- Avant : aucun JSON-LD détecté dans le rendu live
- Après : Organization, WebSite, SoftwareApplication, FAQPage

### GEO / IA (85/100 après déploiement)

- `llms.txt` avec définition produit et URLs à citer
- Pas de blocage GPTBot / ClaudeBot dans robots — OK
- FAQ structurée pour extraction de passages

### Performance (non mesuré lab ici)

- Utiliser CrUX / PageSpeed après déploiement

### Contenu & autorité (45/100)

- Site principalement marketing one-pager — peu de pages pour le long tail
- Pas de blog / comparatifs / études de cas indexables
- Backlinks : tier 0 (Common Crawl seul) — à construire

## Écart vs objectif « 99 % organique »

| Levier | Impact |
|--------|--------|
| Technique + schema + GEO | Plafond ~85–90 sans contenu |
| 10–20 pages SEO (guides FR) | +5–10 |
| Backlinks éditoriaux / communauté fondateurs | +5–15 sur 12–24 mois |
| Marque + recherches « Navpit » | Long terme |
