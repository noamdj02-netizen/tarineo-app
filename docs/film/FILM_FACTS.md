# FILM_FACTS — Tarinéo (lancement 30–35 s)

Document de référence pour le motion designer IA. Chaque fait cite sa source `chemin:ligne`. Libellés UI entre guillemets. Statuts produit : **LIVE** | **BÊTA** | **BIENTÔT**.

> **Dashboard** : l’accueil produit est **`/accueil`** (titre page « Tableau de bord »), pas `/`. La racine `/` est la landing marketing (`app/(site)/page.tsx`).

---

## A. Carte de l’app

### A.1 Routes et titres de page

Titres issus de `export const metadata` sauf mention « absent » (titre rendu par composant).

| Route | Titre document / page | Source |
|-------|------------------------|--------|
| `/` | (SEO landing — voir `app/(site)/page.tsx`) | `app/(site)/page.tsx:11` |
| `/accueil` | « Tableau de bord » | `app/(app)/accueil/page.tsx:20-22` |
| `/devis/analyser` | « Analyse IA · documents » | `app/(app)/devis/analyser/page.tsx:7` |
| `/devis/nouveau` | « Nouveau devis » | `app/(app)/devis/nouveau/page.tsx:5` |
| `/copilote` | « Analyse » | `app/(app)/copilote/page.tsx:12` |
| `/distributeur/devis` | « Devis distributeur » | `app/(app)/distributeur/devis/page.tsx:4` |
| `/distributeur/bon-commande` | « Bons de commande distributeur » | `app/(app)/distributeur/bon-commande/page.tsx:4` |
| `/distributeur/bon-enlevement` | « Bons d’enlèvement » | `app/(app)/distributeur/bon-enlevement/page.tsx:4` |
| `/distributeur/facture` | « Factures distributeur » | `app/(app)/distributeur/facture/page.tsx:4` |
| `/client/devis` | « Devis clients » | `app/(app)/client/devis/page.tsx:4` |
| `/client/bon-commande` | « Commandes clients » | `app/(app)/client/bon-commande/page.tsx:4` |
| `/client/facture` | « Factures clients » | `app/(app)/client/facture/page.tsx:4` |
| `/relances` | « Relances » | `app/(app)/relances/page.tsx:7` |
| `/hausses` | « Hausses de prix » | `app/(app)/hausses/page.tsx:13` |
| `/chantiers` | « Chantiers » | `app/(app)/chantiers/page.tsx:9` |
| `/chantiers/[slug]` | absent (nom du chantier dans l’UI) | — |
| `/pieces/[id]` | absent (titre du document) | — |
| `/fournisseurs` | « Fournisseurs » | `app/(app)/fournisseurs/page.tsx:17` |
| `/comparateur` | « Comparateur » | `app/(app)/comparateur/page.tsx:12` |
| `/achats` | « Achats » | `app/(app)/achats/page.tsx:11` |
| `/achats/produits` | « Produits — Achats » | `app/(app)/achats/produits/page.tsx:16` |
| `/achats/produits/[slug]` | absent | — |
| `/achats/export` | « Export comptable » | `app/(app)/achats/export/page.tsx:13` |
| `/notifications` | « Notifications » | `app/(app)/notifications/page.tsx:10` |
| `/abonnement` | « Abonnement » | `app/(app)/abonnement/page.tsx:20` |
| `/parametres` | « Paramètres » | `app/(app)/parametres/layout.tsx:5` |
| `/parametres/entreprise` | « Entreprise · Paramètres » | `app/(app)/parametres/entreprise/page.tsx:10` |
| `/parametres/tarification` | « Tarification · Paramètres » | `app/(app)/parametres/tarification/page.tsx:7` |
| `/parametres/notifications` | « Notifications · Paramètres » | `app/(app)/parametres/notifications/page.tsx:10` |
| `/parametres/ia` | « IA & Copilote · Paramètres » | `app/(app)/parametres/ia/page.tsx:9` |
| `/automatisations` | « Automatisations & connexions » (redirige vers `/accueil`) | `app/(app)/automatisations/page.tsx:13`, `next.config.ts:63` |
| `/login` | « Connexion » | `app/(auth)/login/page.tsx:5` |
| `/inscription` | « Créer un compte » | `app/(auth)/inscription/page.tsx:5` |
| `/onboarding` | « Bienvenue » | `app/(onboard)/onboarding/page.tsx:6` |

Chemins produit centralisés : `lib/routes.ts:2-31`.

Utilisateur connecté : redirection vers `/accueil` — `lib/supabase/middleware.ts:140,168`.

### A.2 Barre latérale (desktop)

Sections et ordre — `lib/nav.ts:142-150` :

| Section (libellé) | Entrées (ordre) | Icône Lucide |
|-------------------|-----------------|--------------|
| « Aujourd’hui » | « Accueil » → `/accueil` | `House` |
| | « Analyse IA » → `/devis/analyser` | `Sparkles` |
| « Documents » | Tiroir « Documents fournisseur » | `Truck` |
| | → « Devis », « Bons de commande », « Bons d’enlèvement », « Factures » | `FileText`, `FileSpreadsheet`, `Truck`, `Receipt` |
| | Tiroir « Documents entreprise » | `Building2` |
| | → « Devis », « Bons de commande », « Factures » | `FileSpreadsheet`, `FileText`, `Receipt` |
| « Chantiers » | « Chantiers » | `HardHat` |
| « Achats » | « Fournisseurs », « Comparateur », « Hausses », « Relances », « Produits », « Export comptable », « Achats » | `Store`, `ArrowLeftRight`, `Bell`, `Mail`, `Package`, `FileSpreadsheet`, `FolderTree` |

Sous-menus documents — routes : `lib/nav.ts:112-131`, `lib/routes.ts:11-19`.

**LIVE** : navigation `lib/nav.ts`. **BÊTA** : entrée « Analyse IA » distincte du chat Copilote (`lib/nav.ts:56-61`, `/copilote`).

### A.3 Deux espaces documents

| UI | Code (`direction`) | Routes entrantes (achat) | Routes sortantes (vente client) |
|----|--------------------|---------------------------|----------------------------------|
| « Documents fournisseur » | `in` | `/distributeur/devis`, `/distributeur/bon-commande`, `/distributeur/bon-enlevement`, `/distributeur/facture` | — |
| « Documents entreprise » | `out` | — | `/client/devis`, `/client/bon-commande`, `/client/facture` |

Labels tiroirs : `lib/nav.ts:114,125`. Pas de « bon d’enlèvement » côté client dans la nav — `lib/nav.ts:123-131`.

Distinction achat / vente à l’import :

- Champ select « Sens » : « Entrant (achat) » / « Sortant (client) » — `lib/metier/types.ts:201-204`, `components/metier/document-drop.tsx:309-314`
- Champ « Rôle » : « Client », « Fournisseur », « Distributeur », « Atelier » — `lib/metier/types.ts:206-211`, `document-drop.tsx:317-325`
- Lecture affichée : `{KIND_LABEL} · {DIRECTION_LABEL} · {PARTY_LABEL}` — `document-drop.tsx:280-281`

Page type distributeur (exemple devis) : titre « Devis distributeur », texte « Retrouvez les documents reçus de vos fournisseurs. », dépôt « PDF devis fournisseur / enseigne. » — `app/(app)/distributeur/devis/page.tsx:17-21`.

### A.4 Dashboard `/accueil` — **LIVE**

**En-tête** (`components/home/home-dashboard-client.tsx:258-284`) :

| Bouton | Effet |
|--------|--------|
| « Nouveau devis » | Lien `R.devisNouveau` → `/devis/nouveau` |
| « Importer » | Ouvre dialogue import (`HomeImportButton` → `DocumentImportPanels`) |
| « Nouveau chantier » | `R.nouveauChantier` → `/chantiers#nouveau` |
| « Composer » / « Terminer » | Mode édition layout dashboard (`DashboardCustomize`) |
| « Ajouter » | Panneau widgets (même composant, mode édition) — `dashboard-customize.tsx:122,135` |

**Bandeau KPI** (ordre gauche → droite, grille 5 colonnes) — `home-dashboard-client.tsx:288-334` :

| Libellé | Source du chiffre | Lien |
|---------|-------------------|------|
| « Devis à envoyer » | `devisAEnvoyer.length` — devis sortants sans envoi (`sent_at`) ni suite BC/facture | `accueil/page.tsx:44-46` → `R.clientDevis` |
| « Hausses » | `alerts.length` — `listAlerts()` | `accueil/page.tsx:33` → `R.hausses` |
| « Factures client » | Nombre de pièces `kind === "facture"` sortantes | `accueil/page.tsx:47` → `R.clientFacture` |
| « Relances » | `relancesDue.length` — relances statut `due` | `accueil/page.tsx:49-50` → `R.relances` |
| « Achats du mois » | Dernier mois de `spendByMonth(inbound)` — hint « HT lignes » | `accueil/page.tsx:93`, `home-dashboard-client.tsx:156` → `R.achats` |

Hints KPI : `home-dashboard-client.tsx:294-331`.

**Blocs widgets** (ordre par défaut, personnalisable) — `lib/home/dashboard-prefs.ts:44-70` :

- Colonne gauche : « Analyser un document », « Chantier en cours », « Actions rapides », « Mes chantiers »
- Colonne droite : « Dernières analyses », « Planning »
- Section optionnelle widget « Sections métier » : « À traiter », « Hausses fournisseurs » — `home-dashboard-sections.tsx:31,139`

Titres visibles : « Bonjour, {prénom} », « Voici ce qui mérite votre attention. » — `home-dashboard-client.tsx:262-263`.

« À traiter » (liste actions) : titre section + lien « Voir tout » → `/notifications` — `home-dashboard-sections.tsx:31`.

« Hausses fournisseurs » : lien « Voir les hausses » — `home-dashboard-sections.tsx:139`.

« Chantiers actifs » : badges « En cours » / « Pause » — `home-dashboard-sections.tsx:77,100-101`.

---

## B. Dépôt et lecture — **LIVE**

### B.4 Zones de dépôt

Composant principal : `DocumentDrop` — `components/metier/document-drop.tsx` (alias produit « DocumentDropzone » : `components/tarineo/documents/document-dropzone.tsx` réexporte ou enveloppe — vérifier import ; page analyse utilise `DocumentAnalyseAgent`).

| Paramètre | Valeur | Source |
|-----------|--------|--------|
| Formats accept | `application/pdf,image/jpeg,image/png,image/heic,image/webp` | `document-drop.tsx:213` |
| Texte formats | « PDF, JPEG, PNG ou HEIC — cliquez pour parcourir vos dossiers » | `document-drop.tsx:231-232` |
| Pastilles | « PDF », « JPEG », « PNG », « HEIC » | `document-drop.tsx:239-246` |
| Taille max (fichier unique) | 12 Mo — erreur « Fichier trop lourd (12 Mo max). » | `app/(app)/metier/actions.ts:65` |
| Import lot | 150 fichiers — « Maximum 150 fichiers par lot. » | `document-bulk-import.tsx:12,59,175` |

**États zone** (`document-drop.tsx:224-266`) :

| État | Textes |
|------|--------|
| Repos | hint ou « Glissez vos documents ici » ; bouton mobile « Choisir un fichier » |
| Survol | « Déposez ici » |
| Lecture | « Lecture du document… » + spinner |
| Erreur | message `error` (ex. taille, échec ingest) |
| Terminé | Formulaire « / Lecture /// » + actions enregistrer / transformer |

Hints contextuels : ex. distributeur devis « PDF devis fournisseur / enseigne. » — `distributeur/devis/page.tsx:21`.

### B.5 Extraction IA — **LIVE** (modèle + règles déterministes)

**Champs lecture** (formulaire post-ingest) : Titre, Partie, Type, Sens, Rôle, Chantier, totaux, lignes — `document-drop.tsx:283-390`.

**Lignes** : Libellé « Ligne », « Qté », « Unité », « Prix » (prix d’achat sur entrée) — `document-drop.tsx:372-387`.

**Totaux** : « Total HT », « Éco-contribution », « PMCB », « Poids (kg) » — `document-drop.tsx:349-367` ; types `ExtractTotals` — `lib/metier/types.ts:96-108`.

**Récapitulatif agent** — **LIVE** :

- Titre section « Récapitulatif agent » — `document-read-recap.tsx:49`
- Score `/ 100` — `document-read-recap.tsx:54-55`
- Niveaux : « Lecture fiable » (≥78), « À vérifier » (≥52), « Lecture incertaine » (&lt;52) — `assess-recap.ts:36-39`, `document-read-recap.tsx:11-25`
- Checklist (ids) : enseigne, émetteur, n° document, lignes, concordance totaux, etc. — `assess-recap.ts:55-80+`

**Modifiable avant enregistrement** : tous les champs du formulaire + lignes ; boutons « Enregistrer sans transformer », « Annuler » — `document-drop.tsx:444-450`.

---

## C. Transformations — **LIVE**

### C.6 Matrice

| Source | Cibles | UI |
|--------|--------|-----|
| Document **entrant** (`in`) après lecture | « Devis client », « Bon de commande client », « Bon d’enlèvement », « Facture client » | `CLIENT_OUT_LABEL` — `types.ts:179-184`, pills `document-drop.tsx:397-410` |
| **Devis client** sortant | « Commande client », « Facture client » | `convert-devis.tsx:29-30,78` |
| **Bon de commande client** | « Facture client » uniquement | `convert-devis.tsx:30` |

Bouton création inbound : « Créer {label minuscule} » — `document-drop.tsx:440`.

Bloc : « Transformer le fichier » — `document-drop.tsx:393`.

**Marge** :

- Défaut formulaire import : « Marge (%) » = `35` — `document-drop.tsx:429-430`
- `bon_enlevement` : marge cachée `0` → coefficient 1 — `document-drop.tsx:425-426`, `actions.ts:290`
- Coefficient 35 % → `1,35` — `types.ts:190-193`
- Marge cible entreprise : paramètre « Marge cible (%) » — `parametres/tarification/page.tsx:35`
- Suite devis → commande/facture : **recopie des prix** (`copySell: true`, markup 1) — `actions.ts:298-304`, `queries.ts:857-859`

**Arrondi** : `sell_price = Math.round(buy_price * markup * 100) / 100` — `queries.ts:857-859`.  
Ex. 24,60 × 1,35 = 33,21 (pas 33,20) — calcul Node aligné code.

**Numérotation** auto sortie : `{CLIENT_OUT_LABEL[kind]} n°{NNN}` (pad 3) — `queries.ts:790-794`. Ex. test « Devis client n°001 » — `piece-pdf.test.ts:12`. PDF : numéro depuis `extract.document_number` ou titre `n°…` — `piece-model.ts:118-123`.

### C.7 Statuts documents

**Statuts techniques** : `uploading`, `reading`, `ready`, `error` — `types.ts:9`.

**Cycle de vie** (`documentLifecycleLabel`) — `follow-ups.ts:62-79` :

| Contexte | Libellés possibles |
|----------|-------------------|
| Devis client | « Prêt », « Envoyé », « Commande créée », « Facturé » |
| Bon de commande client | « Créée », « Envoyée », « Facturée » |
| Facture | « Créée », « Envoyée » |
| Entrant | « Lié » si suite, sinon libellé kind ; « Envoyé » si `sent_at` |

Carte liste entrante : « à transformer » / « déjà transformé » — `document-list.tsx:82`.

Chaîne affichée chantier : « Suite devis → commande → facture » — `chantier-fiche.tsx:251` ; composant `DocumentChain` — `document-chain.tsx:6-31`.

---

## D. Clients et relances

### D.8 Acceptation devis — **BIENTÔT** (pas de flux signature / lien client)

- Envoi : e-mail PDF via dialogue envoi ; `sent_at` posé à l’envoi — `follow-up-queries.ts:71-72,220`
- Préférences notif « Devis accepté » / « Devis refusé » — `notification-preferences.ts:87-88` — **pas d’UI métier** pour enregistrer acceptation/refus client
- Relances : bouton « Réponse reçue » (`MarkAnsweredButton`) — clôture relance, pas statut devis commercial — `relance-dialog.tsx:242,258`

**Refaire un devis** : absent (pas de « nouvelle version » dédiée) ; duplication / nouvelle pièce non documentée comme flux unique.

### D.9 Relances — **LIVE** (déclenchement + envoi manuel)

| Aspect | Fait |
|--------|------|
| Déclencheur virtuel | 3 jours après `extract.sent_at` — `follow-ups.ts:137,174-177` |
| Éligibilité | Devis ou BC sortant **ou** devis/BC entrant ; pas si déjà transformé — `follow-ups.ts:170-172,57-58` |
| Canal | E-mail (`sendDocumentMail` / `sendFollowUpNowAction`) — `follow-up-queries.ts:181-221` |
| Texte message | Brouillon `draftDocumentMail` : défaut « Bonjour {who},… Veuillez trouver ci-joint… » — `draft-mail.ts:13-22` ; variante IA si `ANTHROPIC_API_KEY` — `draft-mail.ts:38-76` |
| Validation humaine | **LIVE** : l’utilisateur édite et clique envoi dans « Relancer » — `relance-dialog.tsx:102+` ; envoi pièce idem `sendDocumentAction` — `actions.ts:331-349` |
| Landing | « Tout ce qui sort… passe par vous » — `HumanLoop.tsx:67-69` ; `controlLevels` vide dans `landing-v2-content.ts:371` (section peut être vide côté données) |

**Statuts relance** : « À relancer », « Programmée », « Envoyée », « Réponse reçue », « Terminée », « Annulée » — `follow-ups.ts:34-41`.

**Où** : `/relances`, KPI « Relances », widget « À traiter », onglet relances chantier — `relances/page.tsx`, `home-dashboard-client.tsx:317-323`, `chantier-fiche.tsx:214`.

Relance auto cron : voir `lib/automation/handlers/quote-followup.ts` — **BÊTA** selon config workspace.

---

## E. Hausses de prix — **LIVE**

### E.10 Calcul

- « Prix habituel » : **dernier** document entrant avec **même libellé** de ligne (case insensitive), tri `created_at` — `queries.ts:529-533`
- Seuil alerte : `supplierThresholdPct` défaut **5 %** — `queries.ts:527`, `notification-preferences.ts:79`
- Seed démo : 22,4 → 24,6 sur « Tube PVC Ø 500 » — `queries.ts:255-264` (+9,82 % affichable +9,8 %)

**Où** : `/hausses`, KPI « Hausses », section « Hausses fournisseurs », fiche produit `/achats/produits/{slug}`, notifications — voir `hausses/page.tsx`, `home-dashboard-sections.tsx:136-159`.

**Badge « Exemple »** : `DEMO_MARK = "Exemple"` sur cartes `seed_key` — `lib/site/tarineo.ts:33`, `document-list.tsx:71` ; note seed `DEMO_NOTE = "Exemple"` — `lib/metier/demo.ts:3`.

---

## F. Jeu de démo cohérent (proposition — **non seedé** sans validation)

### F.11 Incohérences actuelles

| Problème | Source |
|----------|--------|
| `sell_price: 33.2` en seed vs **33,21** attendu par `queries.ts:857-859` | `queries.ts:251` |
| Landing `proofTable` : « Tube PVC évacuation Ø 100 », fournisseur générique, 4 lignes marketing | `landing-v2-content.ts:63-75` |
| Mail démo « Devis n° 2026-014 » | `landing-v2-content.ts:155` |

### F.11 Proposition unique (montants via code)

| Élément | Valeur |
|---------|--------|
| Chantier | « Chantier Madame Dupont », slug `madame-dupont` | `queries.ts:167-168` |
| Devis fournisseur | « Devis Cedeo - tubes PVC », Cedeo Lyon, 1 ligne « Tube PVC Ø 500 », 18 ml @ 24,60 € → **442,80 € HT** | `queries.ts:190-196,231-236` |
| Devis client (35 %) | PU **33,21 €**, total **597,78 € HT** | `Math.round(24.6*1.35*100)/100`, `18*33.21` |
| BC / facture client | Même lignes/prix (suite `copySell`) | `actions.ts:304` |
| Relance | Devis client envoyé (`sent_at` &gt; 3 j) → statut « À relancer » | `follow-ups.ts:174-177` |
| Acceptation | **BIENTÔT** — simuler visuellement via « Réponse reçue » ou document sans `sent_at` pour « sans réponse » |
| Hausse | Historique 22,40 → 24,60 (+9,8 %) sur « Tube PVC Ø 500 » chez Cedeo | `queries.ts:261-263` |

**Alignements landing à prévoir** : `proofTable` → Cedeo Lyon, « Tube PVC Ø 500 », 1 ligne, mêmes montants ; sections hero/analyse cohérentes — `landing-v2-content.ts:63+`.

---

## G. Design system

### G.12 Tokens — `app/globals.css:21-75`

- Fond `bg` #f5f5f3, surface #ffffff, encre #0a0a0a, muted #6e6e6e
- Orange `--tarineo-orange` #ff6b1a
- Polices : Barlow, Space Grotesk — `globals.css:8-10`, `app/layout.tsx` (lien fonts)
- Rayons : `--radius-control` 10px ; cartes `rounded-[14px]`/`rounded-card` en composants

**Icônes** : `lucide-react` — `lib/nav.ts:1-18`.

**Composants (chemins)** :

| Nom film | Fichier |
|----------|---------|
| DocumentDropzone | `components/metier/document-drop.tsx` (`DocumentDrop`) |
| DocumentAnalyseAgent | `components/metier/document-analyse-agent.tsx` |
| DocumentImportPanels | `components/metier/document-import-dialog.tsx` |
| ConvertDevisActions | `components/metier/convert-devis.tsx` |
| document-edit | `components/metier/document-edit.tsx` |
| Carte hausse / KPI | `components/home/home-dashboard-client.tsx`, `dashboard-metier-widgets.tsx` |
| Sidebar | `components/shell/sidebar.tsx` |

### G.13 Assets

- **Logo app** : PNG `/brand/tarineo-logo-light.png` — `components/brand/tarineo-logo.tsx:5-7` — **pas de SVG logo produit** dans le repo (illustrations SVG marketing séparées).
- **Mascottes HD** : `lib/tarineo-hd-mascots.ts` — PNG `public/illustrations/tarineo-hd/`. Usages app (extraits) :
  - `06-loupe` : analyse, copilote, palette — `document-analyse-agent.tsx:21`, `copilote/page.tsx:34`
  - `09-devis-valide` : pages pièces — `piece-kind-page.tsx:25`
  - `05-bras-croises` : topbar — `topbar.tsx:141`
  - `14-bulle` : auth — `login-form.tsx:178`
  - `12-erreur-404` : 404 — `app/not-found.tsx:10`
  - Liste complète : clés `01-pouce-leve` … `15-coucou-bord` — `tarineo-hd-mascots.ts:9-114`

---

## H. Captures d’écran

**Playwright** : non exécuté dans cette passe (serveur / compte requis). Voir `docs/film/captures/README.md`.

| # | URL | État à préparer |
|---|-----|-----------------|
| 01 | `http://localhost:3000/accueil` | Compte avec données ; widget par défaut |
| 02 | `/accueil` | Sidebar desktop ouverte, tiroirs documents dépliés |
| 03 | `/distributeur/devis` | Liste + zone dépôt |
| 04 | `/devis/analyser` | Zone vide |
| 05 | `/devis/analyser` | Fichier en cours — « Lecture du document… » |
| 06 | `/devis/analyser` | Après ingest : récap agent + formulaire |
| 07 | Même | Bloc « Transformer le fichier », 4 pills visibles |
| 08 | `/pieces/{id}` | Devis client créé + aperçu PDF |
| 09–10 | `/pieces/{id}` | BC puis facture client |
| 11 | `/client/devis` | Liste documents entreprise |
| 12 | `/relances` | Relance `due`, dialogue ouvert pour texte |
| 13 | `/client/devis` | Un doc avec `sent_at` + un sans (sans réponse) |
| 14 | `/hausses` | Liste alertes |
| 15 | `/achats/produits/{slug}` | Produit « Tube PVC Ø 500 » |
| 16 | `/chantiers/madame-dupont` | Vue + « Suite devis → commande → facture » |

IDs pièces : UUID en base (seed `demo-doc-*` — résoudre via UI après login open-access). Masquage Copilote : **absent** — `captures/README.md`.

---

*Généré depuis le code Tarinéo — ne pas inventer de libellés hors sources citées.*
