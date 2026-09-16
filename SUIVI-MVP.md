# Tarineo — Suivi MVP & déploiement

> Fichier de référence partagé (Noam + Alan). Mis à jour à chaque jalon important du projet.

**Dernière mise à jour :** 16 septembre 2026 — backlog phases A→F

---

## Avancement global

```
████████████████░░░░░░░░░░░░░░  55 % MVP
```

| Phase | Contenu | Statut global | Test de validation |
|-------|---------|---------------|-------------------|
| **A** | Nav + dashboard honnête | ✅ ~90 % | Cliquer chaque lien menu, mobile + desktop |
| **B** | Devis clients réels + wizard/anim | 🟡 ~70 % | Créer devis → PDF → transformer facture |
| **C** | Documents reskin + stockage | ⏳ 0 % | Upload PDF → alerte → comparateur |
| **D** | Factures clients + menu | 🟡 ~85 % | Cycle devis → facture complet |
| **E** | Prod, OAuth, smoke tests | ⏳ ~30 % | Test sur tarineo-app-chi.vercel.app |
| **F** | Analyses + fournisseurs réels | 🟡 ~80 % | Dashboard + analyses cohérents |

**Objectif :** MVP utilisable par de vrais artisans (upload → alerte hausse → confiance → paiement).

---

## Liens utiles

| Ressource | URL |
|-----------|-----|
| App prod (Vercel) | https://tarineo-app-chi.vercel.app |
| Repo GitHub | https://github.com/noamdj02-netizen/tarineo-app (privé) |
| Parcours test | Inscription → `/documents` → import PDF → alerte hausse |
| Spec agent fournisseur (veille) | [`SPEC-AGENT-FOURNISSEUR.md`](./SPEC-AGENT-FOURNISSEUR.md) — V1 (dérive silencieuse) livrée sur `/veille` ; V2 bloquée sur Resend inbound + Stripe, V3/V4 sur accords écrits |

---

# Backlog par phase (mode auto A→F)

Légende : `[x]` fait · `[~]` partiel · `[ ]` à faire

---

## Phase A — Navigation & dashboard honnête

**Implémenter :** P1-01 à P1-04 + P1-17 à P1-19  
**Test :** Cliquer chaque lien menu, mobile + desktop

### P1 — Navigation & orientation
- [x] **P1-01** — « Mes documents » → `/documents` (plus `/devis-clients` démo)
- [x] **P1-02** — Bottom nav mobile : Documents → `/documents`
- [x] **P1-03** — Sous-menu clair : types fournisseur sous Mes documents ; devis/factures clients sous Facturation
- [x] **P1-04** — Liens sidebar, top bar, CTA dashboard corrigés

### P1 — Dashboard & données
- [x] **P1-17** — Bandeau si `DEMO_DASHBOARD` injecté (`utiliseDemo`)
- [x] **P1-18** — Texte explicite « Données d'exemple »
- [~] **P1-19** — Notifications : marquées « (exemples) » + lien import — **pas encore branchées sur table `Alert`**

### Tests Phase A
- [ ] Desktop : sidebar (Dashboard, Mes documents + sous-menus, Facturation, Analyses, Paramètres)
- [ ] Desktop : top bar (Dashboard, Mes documents, Fournisseurs, Facturation, Analyses)
- [ ] Mobile : bottom nav (4 onglets)
- [ ] Aucun lien « Mes documents » ne mène à la démo devis clients

---

## Phase B — Devis clients réels + wizard

**Implémenter :** P1-11 à P1-16 + P2-07 à P2-10  
**Test :** Créer devis → PDF → transformer facture

### P1 — Devis clients (moteur Alan)
- [x] **P1-11** — Liste `/devis-clients` : Prisma `ClientQuote`
- [x] **P1-12** — Création `/devis-clients/nouveau` : `FormulaireDevis` + actions Alan
- [x] **P1-13** — Détail `/devis-clients/[id]` : plus de branche démo `dv-*`
- [x] **P1-14** — Création, liste, détail, modification rebranchés
- [~] **P1-15** — PDF devis : génération OK — **vérifier téléchargement depuis UI**
- [x] **P1-16** — Transformation devis → facture (`BoutonTransformerEnFacture`)
- [x] **Bug bloquant corrigé (16/09)** — `/devis-clients/nouveau` renvoyait une **erreur 500 systématique** : la page passait `actionGenererIA={async (texte) => genererDepuisPrompt(texte)}`, une fermeture inline non sérialisable vers un composant client. La server action est désormais passée telle quelle. **La création de devis était totalement inaccessible**, `npm run build` ne le détectait pas (erreur au rendu, pas à la compilation).

### P2 — Wizard & animation (DA Figma)
- [x] **P2-07** — Wizard branché sur `FormulaireDevis` : Description → Client → Prestations → Aperçu (le « Chantier » du mock Figma est fusionné dans Client, on n'a pas encore les champs chantier en base)
- [x] **P2-08** — Attente IA animée : logo qui respire + barre de balayage, et cascade d'apparition des lignes générées
- [x] **P2-09** — Micro-interactions : glissement des étapes selon le sens, fil d'étapes cliquable en arrière, coches sur étapes faites, balayage sur le bouton d'envoi
- [~] **P2-10** — Suggestion prix historique : backend OK, désormais isolée dans l'étape Prestations — **reste à afficher la suggestion avant la saisie du prix, pas après**

### Tests Phase B
- [ ] Créer devis manuel (Mon entreprise rempli)
- [ ] Créer devis via prompt IA
- [ ] Régénérer / télécharger PDF
- [ ] Transformer en facture → visible dans `/factures-clients`
- [ ] Modifier devis non facturé

---

## Phase C — Documents reskin & stockage

**Implémenter :** P1-05 à P1-07 + P2-01 à P2-03  
**Test :** Upload PDF → alerte → comparateur

### P1 — Cœur produit fournisseur
- [ ] **P1-05** — Reskin `/documents` (liste + filtres + upload) : `PageHeader`, `DataTable`, DA Figma
- [ ] **P1-06** — Reskin `/documents/[id]` (cartes ligne, badges hausse, comparateur inter-enseignes)
- [ ] **P1-07** — Test bout en bout : upload → IA → validation → PriceHistory → alerte → comparateur

### P2 — Page stockage
- [ ] **P2-01** — Reskin liste documents (composants `tarineo/*`)
- [ ] **P2-02** — Reskin fiche document
- [~] **P2-03** — Archives chronologiques : filtres Alan existent — **clarifier UX « stockage » vs `/documents`**

### Tests Phase C
- [ ] Upload PDF Cedeo / Point P
- [ ] 2e doc même distributeur → historique suffisant
- [ ] Alerte hausse > 3 % visible
- [ ] Comparateur inter-enseignes sur réf. fabricant

---

## Phase D — Factures clients + menu

**Implémenter :** P1-20 à P1-22 + P2-11 à P2-12  
**Test :** Cycle devis → facture complet

### P1 — Factures clients
- [x] **P1-20** — Liste `/factures-clients` : Prisma `ClientInvoice`
- [~] **P1-21** — Création : **via transformation devis** (pas de `/factures-clients/nouveau` maquette)
- [x] **P1-22** — Détail facture + PDF (`facturePdf.tsx`, `genererEtStockerPdfFacture`)

### P2 — Menu & routes
- [x] **P2-11** — `/bons-de-commande` et `/bons-enlevement` → redirect `/documents?type=…`
- [x] **P2-12** — Menu Facturation : sous-menu Devis clients + Factures clients

### Tests Phase D
- [ ] Devis → Transformer en facture → PDF facture
- [ ] Lien devis source sur fiche facture
- [ ] Devis verrouillé après transformation

---

## Phase E — Prod, OAuth, smoke tests

**Implémenter :** P1-08 à P1-10 + P1-23 à P1-25  
**Test :** https://tarineo-app-chi.vercel.app

### P1 — Infra & onboarding
- [~] **P1-08** — Pooler Supabase local + Vercel — **OK en dev, à re-vérifier après deploy**
- [ ] **P1-09** — `AUTH_URL` prod + redirect Google OAuth configuré dans Google Console
- [~] **P1-10** — Onboarding guidé (`OnboardingDocuments`) — **à valider sur prod + 2 docs même distributeur**

### P1 — Stabilité & déploiement
- [~] **P1-23** — Build Vercel + migrations — **OK une fois, re-deploy après derniers commits**
- [ ] **P1-24** — Smoke prod : connexion, upload 1 PDF, 1 alerte, 1 devis client
- [~] **P1-25** — Compte seed documenté (`noamdj02@gmail.com` / `Tarineo2026!`)

### Tests Phase E
- [ ] Inscription prod
- [ ] Connexion Google prod
- [ ] Upload document prod
- [ ] Pas d'erreur Prisma en layout

---

## Phase F — Analyses & fournisseurs (si temps)

**Implémenter :** P2-13 à P2-15  
**Test :** Dashboard + analyses cohérents

### P2 — Données réelles
- [x] **P2-13** — `/analyses` : agrégations Prisma (dépenses, top hausses)
- [x] **P2-14** — `/fournisseurs` : données réelles (`calculerDepensesParDistributeur`)
- [x] **P2-15** — Scores inventés retirés → badge BFA réel ou absent

### Tests Phase F
- [ ] Dashboard fournisseurs = liste `/fournisseurs`
- [ ] Analyses donut = vraies dépenses
- [ ] Liens hausses → fiches documents

---

## Prochaine action recommandée

**Enchaîner Phase C** (reskin documents — page la plus importante visuellement) puis **finir Phase B** (wizard Figma P2-07–09) et **Phase E** (deploy + smoke prod).

---

## À traiter en priorité (liste Noam du 16/09)

- [ ] **SÉCURITÉ — régénérer les clés API exposées** dans une session Claude Code passée
      (`ANTHROPIC_API_KEY`, `STRIPE_SECRET_KEY`, `RESEND_API_KEY`, clés Supabase) puis
      mettre à jour `.env` local **et** les variables Vercel
- [ ] Vérifier le sandbox Resend hors mode test
- [ ] Rédiger CGV / mentions légales
- [ ] Statut d'entreprise à trancher
- [ ] Devis réels Cedeo / Point P / Rexel (attente collègue commercial)
- [ ] Audit UX complet avant test
- [ ] Tableau de bord dirigeant (plan Équipe) — suivi « enlevé par » + notifications
- [ ] Changement + réinitialisation d'adresse e-mail dans « Mon compte »
- [ ] Relance devis automatisée par e-mail
- [x] Catalogue enseignes (Saint-Gobain, Kingfisher, Adeo…) — `src/lib/fournisseursConnus.ts`

---

## Journal des check-ups

| Date | Check-up | Résultat |
|------|----------|----------|
| 16/09/2026 | Catalogue fournisseurs + groupes | 24 enseignes, cumul par groupe, prompt IA élargi |
| 16/09/2026 | Backlog phases A→F structuré | Todo P1/P2 par phase dans ce fichier |
| 16/09/2026 | Check-up dashboard UX | Onglets documents, fournisseurs/analyses/factures réels |
| 16/09/2026 | Phase B (P1-11–16) | Devis clients Prisma + FormulaireDevis |
| 16/09/2026 | Phase A (P1-01–04, 17–18) | Nav + bandeau démo |
| 15/09/2026 | Déploiement Vercel | Pooler Supabase + AUTH_URL |

---

## Infra & env

| Variable | Dev | Prod (Vercel) |
|----------|-----|---------------|
| `DATABASE_URL` | Pooler Supabase | Pooler `aws-0-eu-central-1.pooler.supabase.com` |
| `AUTH_URL` | Absent (origine requête) | `https://tarineo-app-chi.vercel.app` |
| Google OAuth redirect | localhost | `https://tarineo-app-chi.vercel.app/api/auth/callback/google` |
