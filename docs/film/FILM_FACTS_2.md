# FILM_FACTS_2 — Compléments film (seed, captures, typo, relances, hausses)

Mêmes règles que `FILM_FACTS.md` : sources `chemin:ligne`, libellés entre guillemets, **LIVE** / **BÊTA** / **BIENTÔT**.

---

## 1. Jeu de démo appliqué (seed) — **LIVE** (dev open access)

Logique centralisée : `lib/metier/demo-seed-bundle.ts` ; synchronisation Supabase : `upsertDemoDocuments` appelée depuis `ensureMetierSeed` — `lib/metier/queries.ts:107-207`. Mémoire locale : `syncDemoMem` — `lib/metier/memory.ts:77-299`.

| Élément | Valeur | `seed_key` |
|---------|--------|------------|
| Chantier | « Chantier Madame Dupont » (`madame-dupont`) | `demo-chantier-dupont` |
| Entrant | « Devis Cedeo - tubes PVC » — 1 ligne « Tube PVC Ø 500 », 18 ml × 24,60 € → **442,80 € HT** | `demo-doc-devis-cedeo` |
| Client (relance) | « Devis client Dupont » — PU **33,21 €**, total **597,78 € HT**, `sent_at` ≈ J−4 | `demo-doc-devis-client` |
| Client (Prêt) | « Devis client — extension Dupont » — même ligne/prix, sans `sent_at` | `demo-doc-devis-client-pret` |
| Client (Commande créée) | « Devis client — cuisine Dupont » + enfant BC | `demo-doc-devis-client-commande` |
| BC | « Bon de commande client n°001 » — prix recopiés (`markup: 1`) | `demo-doc-bc-client` |
| Facture | « Facture client n°001 » — depuis BC, prix recopiés | `demo-doc-facture-client` |
| Hausse | « Tube PVC Ø 500 chez Cedeo » — 22,40 € → 24,60 € (+9,8 %) | `demo-alert-pvc` |

Constantes de calcul : `DEMO_SELL_UNIT = Math.round(24.6 * 1.35 * 100) / 100` → **33,21** — `lib/metier/demo-seed-bundle.ts:5-10`.

Relance virtuelle **LIVE** : « Devis client Dupont » avec `extract.sent_at` &gt; 3 jours → statut « À relancer » — `lib/metier/follow-ups.ts:174-177`.

IDs runtime (exemple session locale) : `GET /api/film/demo-ids` — `app/api/film/demo-ids/route.ts` (open access uniquement).

**UI** : badges cycle de vie sur les cartes devis sortants — `components/metier/document-list.tsx` (`documentLifecycleLabel`).

**Lecture film sans PDF** : `/devis/analyser?film=lecture` préremplit la zone Cedeo — `lib/metier/film-analyse-draft.ts`, `components/metier/document-drop.tsx`.

---

## 2. Captures Playwright

Script : `npm run film:captures` (`scripts/film-captures.mjs`). Sortie : `docs/film/captures/`.

| Fichier | URL / action |
|---------|----------------|
| `01-accueil.png` | `/accueil` |
| `02-sidebar.png` | `/accueil` + tiroirs « Documents fournisseur » et « Documents entreprise » ouverts |
| `06-analyse.png` | `/devis/analyser?film=lecture` |
| `08-piece-devis-client.png` | `/pieces/{docOut}` |
| `12-relances.png` | `/relances` (ligne « À relancer ») |
| `12b-relance-dialog.png` | « Relancer » → dialogue « Relancer » |
| `13-client-devis.png` | `/client/devis` (badges « Prêt », « Envoyé », « Commande créée ») |
| `14-hausses.png` | `/hausses` |
| `15-produit.png` | `/achats/produits/tube-pvc-o-500` |

Spec : 1920×1080, `deviceScaleFactor: 2`, thème clair ; masquage Copilote : `[data-copilot-fab]{display:none}` — `components/assistant/assistant-panel.tsx:144`, injecté dans le script.

**État** : les 9 PNG listés ci-dessus sont présents dans `docs/film/captures/` (génération OK avec dev sur port 3001). Le script attend le tableau desktop sur `/relances` (évite le doublon mobile `md:hidden`) et réessaie une fois les `goto` en cas de timeout Turbopack.

```bash
PORT=3001 npm run dev   # ou port actif
PORT=3001 npm run film:captures
```

---

## 3. Polices réelles (app connectée)

Tokens par défaut (hors `.theme-tarineo` landing) — `app/globals.css:127-132` :

| Rôle | `font-family` CSS (calculée) |
|------|------------------------------|
| `body` (`font-sans`) | `var(--font-inter-tight), ui-sans-serif, system-ui, sans-serif` |
| `h1` / `.font-display` | idem (`--font-display` = Inter Tight) |
| Boutons `/accueil` (« Nouveau devis », etc.) | `font-sans` via classes `text-[13px] font-medium` — `components/home/home-dashboard-model.ts:16-18` |

Chargement : variable CSS `--font-inter-tight` posée par `next/font` — `app/layout.tsx:19-24` sur `<body>`.

**Poids** : Inter Tight en police variable Google (pas de `weight` fixé sur `interTight`) ; l’UI utilise surtout `font-medium` (500) et `font-semibold` (600) — ex. titre analyse `font-semibold` — `components/metier/document-analyse-agent.tsx:24-25`, KPI `font-semibold` — `components/home/home-dashboard-client.tsx:81`.

**Barlow / Space Grotesk** : chargées via `<link>` Google — `app/layout.tsx:52-53`, `--font-barlow` / `--font-grotesk` — `app/globals.css:8-10`, `132` — utilisées pour `.theme-tarineo` (site public) — `app/globals.css:336-343`, **pas** pour le shell app (`app/(app)/layout.tsx`).

**Mesure runtime** (à refaire après chargement page) :

```js
// Console sur /accueil
getComputedStyle(document.body).fontFamily
getComputedStyle(document.querySelector('h1')).fontFamily
getComputedStyle(document.querySelector('a[href="/devis/nouveau"]')).fontFamily
```

---

## 4. Mail « Relancer » — Devis client Dupont

Source : `draftDocumentMail` — `lib/metier/draft-mail.ts:13-24` (fallback) ; dialogue — `components/metier/relance-dialog.tsx:150-166`.

### Sans clé `ANTHROPIC_API_KEY` (fallback exact)

Hypothèses seed : titre « Devis client Dupont », chantier « Chantier Madame Dupont », client « Madame Dupont », entreprise non renseignée → `companyName` = « L'entreprise » — `lib/metier/draft-mail.ts:18,28`.

- **Objet** : `Devis — Chantier Madame Dupont`
- **Corps** (texte brut) :

```text
Bonjour Madame Dupont,

Veuillez trouver ci-joint devis « Devis client Dupont » pour le chantier Chantier Madame Dupont.

Cordialement,
L'entreprise
```

(`KIND_LABEL.devis` = « Devis » → minuscule « devis » dans la phrase — `lib/metier/types.ts:171`, `draft-mail.ts:14-22`.)

Champs dialogue : « E-mail », « Objet », « Message » — `relance-dialog.tsx:140-165`. CTA : « Relancer maintenant », « Programmer dans », « 1 jour », « 3 jours », « 7 jours » — `relance-dialog.tsx:169-190`.

### Avec clé Anthropic (typique)

Modèle `claude-haiku-4-5`, JSON `subject` + `body`, 2–4 phrases + signature entreprise — `lib/metier/draft-mail.ts:42-64`. Contenu **non déterministe** ; contraintes : vouvoiement, mention du chantier si présent, pas de prix/date inventés. Exemple de forme (illustratif, pas garanti) :

```text
Objet : Devis — Chantier Madame Dupont

Bonjour Madame Dupont,

Je me permets de vous recontacter concernant le devis « Devis client Dupont » pour le chantier Chantier Madame Dupont. Je reste à votre disposition pour toute question.

Cordialement,
{raison_sociale ou « L'entreprise »}
```

---

## 5. Structure des pages `/hausses` et `/relances`

### 5.1 `/hausses` — **LIVE**

| Zone | Libellé / contenu | Composant |
|------|-------------------|-----------|
| Page | `metadata.title` = « Hausses de prix » | `app/(app)/hausses/page.tsx:13` |
| Fil d’Ariane | « Accueil » → « Hausses » | `page.tsx:24-26` |
| En-tête | label « Hausses », titre « Hausses de prix », sous-titre « Identifiez les augmentations qui peuvent réduire votre marge. » | `PageHead` — `page.tsx:21-29` |
| Bloc haut | Titre panneau « Principales hausses détectées » (défaut) | `TopPriceIncreases` — `components/tarineo/analytics/top-price-increases.tsx:11` |
| Liste lignes panneau | Nom produit, « {ancien} → {nouveau} », badge % orange | `top-price-increases.tsx:54-75` |
| Grille cartes | Pour chaque alerte : option « Exemple » (demo `seed_key`) | `page.tsx:42` |
| Carte | Titre alerte (ex. « Tube PVC Ø 500 chez Cedeo »), sous-texte chantier ou « Tous chantiers » | `page.tsx:45-48` |
| Carte | Badge `StatusBadge` avec `signedPct` (ex. « +9,8 % ») | `page.tsx:50` |
| Carte | Prix « {old} → {new} » en gros | `page.tsx:52-55` |
| Liens | « Voir la pièce », « Comparer » | `page.tsx:58-66` |
| Vide | « Aucune hausse détectée », « Importez des devis fournisseurs… », « Importer un devis » | `page.tsx:73-77` |

### 5.2 `/relances` — **LIVE**

| Zone | Libellé | Composant |
|------|---------|-----------|
| Page | titre « Relances » | `app/(app)/relances/page.tsx:7` |
| Fil d’Ariane | « Accueil » → « Relances » | `page.tsx:17-19` |
| En-tête | titre « Relances », texte « Ne laissez plus un devis ou une demande sans réponse. » | `page.tsx:14-22` |
| Filtres | « Toutes », « Clients », « Fournisseurs » | `RelancesTable` + `FilterPills` — `components/metier/relances-table.tsx:28-35` |
| Tableau desktop | Colonnes : « Statut », « Contact », « Chantier », « Document », « Montant », « Dernière action », « Prochaine action », (actions) | `relances-table.tsx:80-88` |
| Statut ligne | Pastille + « À relancer » (`FOLLOW_UP_STATUS_LABEL.due`) | `RelanceStatus` — `relance-dialog.tsx:198-217`, `follow-ups.ts:34-35` |
| Montant | `{montant} HT` ou « — » | `relances-table.tsx:114` |
| Boutons ligne | « Relancer », « Réponse reçue », « Annuler » (selon statut) | `relances-table.tsx:121-129` |
| Vide | « Aucune relance » / « Aucune relance dans ce filtre » | `relances-table.tsx:140-147` |
| Dialogue | Titre « Relancer », champs Client/Fournisseur, Document, Chantier, Montant, Dernier envoi, E-mail, Objet, Message | `relance-dialog.tsx:110-166` |

---

*Fin FILM_FACTS_2.*
