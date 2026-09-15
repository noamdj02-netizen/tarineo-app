# CLAUDE.md — Projet Tarineo

## Vision produit

Tarineo est un SaaS pour artisans du bâtiment français (plombiers-chauffagistes, électriciens, multi-corps d'état). Il protège leur marge en analysant leurs devis et factures fournisseurs.

**Cœur du produit :** l'artisan importe un devis fournisseur (photo, PDF, ou transfert email) provenant d'enseignes comme Cedeo, Point P, Rexel, Brossette, Richardson, Aubade. L'IA extrait les références, quantités, prix unitaires, remises et le nom du distributeur. Chaque prix est ensuite comparé à **l'historique personnel d'achats de cet artisan** (jamais un comparateur public) : si un prix a augmenté par rapport à ses achats précédents, une alerte s'affiche avec le montant et le pourcentage de hausse.

**Fonctionnalités autour du cœur :**
1. Archivage chronologique des factures (filtres par mois, distributeur, référence)
2. Tableau de bord : dépenses mensuelles/annuelles, répartition par distributeur
3. Comparateur inter-enseignes : pour une même référence, chez quel fournisseur habituel l'artisan a les meilleures conditions
4. Générateur de devis client : matériel + taux horaire + frais → PDF professionnel avec logo, SIRET, mentions légales
5. Alerte "remise de fin d'année" quand le volume annuel chez un distributeur atteint un seuil

**Modèle économique :** abonnement Stripe — Starter 29 €/mois, Pro 49 €/mois, Premium 89 €/mois. Essai bêta gratuit sans CB pour les premiers inscrits.

## Stack imposée

- **Next.js 14+ (App Router) + TypeScript** — front et API routes dans le même projet
- **PostgreSQL** (hébergé UE : Supabase région eu-west, Neon Frankfurt, ou Scaleway) via **Prisma**
- **Auth.js (NextAuth)** — connexion par email + mot de passe (Credentials, bcrypt) + option Google, session JWT
- **API Anthropic (Claude)** pour l'extraction et l'analyse des devis — modèle avec vision pour lire photos et PDF
- **Stripe** : Checkout Sessions (mode subscription) + Customer Portal + Webhooks
- **Stockage fichiers** : bucket S3-compatible en UE (Scaleway Object Storage ou Supabase Storage), fichiers privés, accès par URL signée courte durée
- Déploiement : Vercel (région cdg1/Paris) ou Scaleway

## Décisions déjà prises (ne pas remettre en question sans validation du fondateur)

- **Authentification par email + mot de passe** (provider `Credentials`, hash bcrypt via `bcryptjs`, `src/lib/password.ts`), avec Google en complément — remplace le lien magique/Resend, retiré le 2026-08-30 à la demande explicite du fondateur (ce point contredisait la décision précédente documentée ici ; changement confirmé et voulu, raison métier non détaillée). Écrans séparés `/connexion` (login) et `/inscription` (création de compte + consentement RGPD).
  - **Session en JWT, pas "database"** (`src/auth.ts`) : le flux Credentials d'Auth.js encode toujours la session en JWT, quelle que soit la stratégie configurée (vérifié dans `@auth/core/lib/actions/callback/index.js` — `adapter.createSession` n'est jamais appelé pour ce provider). La table `Session` n'est donc plus peuplée ; rien d'autre dans le code n'en dépendait (vérifié).
  - `RESEND_API_KEY`/`EMAIL_FROM` : plus utilisés pour la connexion elle-même, réutilisés pour le flux "mot de passe oublié" (`/mot-de-passe-oublie` → `/reinitialiser-mot-de-passe`, ajouté le 2026-08-30). Token à usage unique stocké dans `VerificationToken` (table du schéma Auth.js, réutilisée telle quelle — hash SHA-256 du token, jamais le token brut), valable 1h, supprimé après consommation.
  - `AUTH_URL` volontairement absent de `.env` en dev (voir `src/lib/origine.ts`) : les liens envoyés par email (reset mot de passe) utilisent l'origine de la requête en cours (`headers()`), pas une valeur fixe — fonctionne aussi bien depuis `localhost` que depuis l'IP réseau du téléphone. **En production, remettre `AUTH_URL`** sur le vrai domaine.
  - Testé de bout en bout (inscription → hash → session → page protégée) avant livraison, pas seulement compilé.

## Règles de sécurité — NON NÉGOCIABLES

1. **Aucun secret côté client.** `ANTHROPIC_API_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `DATABASE_URL` vivent uniquement dans les variables d'environnement serveur. Jamais de préfixe `NEXT_PUBLIC_` sur un secret. Seule la clé publique Stripe (`pk_...`) peut être exposée.
2. **Tout appel IA passe par une API route serveur.** Le navigateur envoie le fichier au serveur ; le serveur appelle Anthropic. Jamais d'appel direct navigateur → Anthropic.
3. **Les droits d'abonnement sont vérifiés côté serveur** à chaque requête (middleware ou vérification dans chaque route), jamais déduits d'un état côté client.
4. **Webhooks Stripe : vérifier la signature** avec `stripe.webhooks.constructEvent` et le `STRIPE_WEBHOOK_SECRET`. C'est le webhook (et lui seul) qui active/désactive l'abonnement en base. Événements à gérer : `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`.
5. **Isolation des données par utilisateur** : chaque requête SQL filtre par `userId` de la session. Un artisan ne doit JAMAIS pouvoir voir les devis, factures ou prix d'un autre. Écrire des tests qui le vérifient.
6. **Validation des entrées** avec Zod sur toutes les API routes. Uploads : limiter à PDF/JPEG/PNG/HEIC, taille max 15 Mo, vérifier le type MIME réel (magic bytes), renommer avec un UUID.
7. **Rate limiting** sur les routes coûteuses (analyse IA : ex. 20 analyses/heure/utilisateur) et sur l'auth.
8. **RGPD** : consentement explicite non pré-coché à l'inscription (horodaté en base), page de confidentialité, export des données, suppression de compte qui efface réellement tout (base + fichiers), hébergement UE, cookies limités à la session.
9. Headers de sécurité (CSP, X-Frame-Options), HTTPS partout, cookies `httpOnly` + `secure` + `sameSite`.
10. `.env` dans `.gitignore` dès le premier commit. Fournir un `.env.example` sans valeurs.

## Fonctionnalité IA — extraction et comparaison de devis

C'est LA fonctionnalité prioritaire. Pipeline :

1. **Upload** : l'artisan envoie photo/PDF → stockage privé + enregistrement `Document` en base (statut `processing`)
2. **Extraction** : API route serveur envoie le document à Claude (vision) avec un prompt demandant une réponse JSON strict :
   ```json
   {
     "distributeur": "Cedeo",
     "date_document": "2025-06-14",
     "type": "devis" | "facture" | "bon_commande" | "bon_enlevement",
     "numero": "...",
     "lignes": [
       {
         "reference": "THERMOR-DURALIS-200L",
         "reference_fabricant": "DURALIS200L",
         "designation": "Chauffe-eau Thermor Duralis 200L stable",
         "quantite": 1,
         "prix_unitaire_ht": 595.00,
         "remise_pct": 0,
         "total_ligne_ht": 595.00
       }
     ],
     "total_ht": 0,
     "tva": 0,
     "total_ttc": 0,
     "confiance": 0.95
   }
   ```
   Valider ce JSON avec Zod. Si `confiance` < 0.7 ou JSON invalide → statut `needs_review`, l'artisan corrige à la main dans l'UI.
3. **Normalisation des références** : même produit ≠ même libellé selon l'enseigne. Stratégie : normaliser (majuscules, sans espaces/accents) + demander à l'IA un champ `reference_normalisee` + rapprochement flou (pg_trgm) avec l'historique. En cas de doute, proposer le rapprochement à l'artisan (« Est-ce le même produit que… ? ») plutôt que de fusionner silencieusement.
4. **Comparaison** : pour chaque ligne, chercher dans `PriceHistory` de CET utilisateur les achats précédents de la même référence normalisée. Calculer : dernier prix payé, prix moyen 12 mois, écart en € et %. Seuil d'alerte : hausse > 3 %.
5. **Restitution** : carte d'analyse par ligne — prix actuel, prix habituel, moyenne 12 mois, badge ▲/▼, impact total en € sur le document.
6. **Comparateur inter-enseignes** ✅ : `reference` / `referenceNorm` est le code interne du distributeur, propre à chaque enseigne (ex. "7381813" chez Cedeo) — inutilisable pour rapprocher un même produit d'un distributeur à l'autre. Le rapprochement se fait sur `reference_fabricant` / `manufacturerRefNorm`, un champ distinct que l'IA tente d'extraire de la désignation (ex. "Réf. PA1951BTNE" noyé dans le texte), avec un input optionnel dans le formulaire de correction pour que l'artisan la saisisse quand l'IA la rate. Toujours scopé à l'historique personnel de l'artisan (`userId`), jamais un référentiel public. Voir `src/lib/comparaisonPrix.ts`.

Les calculs de comparaison se font en SQL/TypeScript, pas par l'IA : l'IA extrait, le code calcule. C'est plus fiable, moins cher, et testable.

## Modèle de données (Prisma, tables principales)

- `User` (id, email, name, trade, consentAt, stripeCustomerId, subscriptionStatus, plan, createdAt)
- `Document` (id, userId, type devis/facture/bon_commande/bon_enlevement, distributor, distributorNorm, documentDate, fileKey, status, totalHt, totalTtc, rawExtraction Json, createdAt)
- `LineItem` (id, documentId, userId, reference, referenceNorm, manufacturerRef, manufacturerRefNorm, designation, quantity, unitPriceHt, discountPct, totalHt) — `manufacturerRef`/`manufacturerRefNorm` (optionnels) : référence fabricant, distincte du code interne du distributeur, utilisée pour le comparateur inter-enseignes
- `PriceHistory` (id, userId, referenceNorm, manufacturerRefNorm, distributor, distributorNorm, unitPriceHt, documentDate, documentId) — alimentée à chaque extraction validée
- `DistributorGoal` (id, userId, distributor, distributorNorm, targetHt, periodStartMonth, periodStartDay) — objectif annuel facultatif par distributeur (BFA), un par utilisateur/distributeur ; période glissante configurable (1er janvier par défaut), certains distributeurs ne calculant pas leur BFA sur l'année civile
- `ClientQuote` (id, userId, clientName, lines Json, laborRate, hours, extraFees, totalHt, totalTtc, pdfKey, createdAt)
- `Alert` (id, userId, type price_increase/year_end_discount, payload Json, seenAt)

`distributorNorm` (sur `Document` et `PriceHistory`) : normalisation du nom de distributeur (accents/casse/ponctuation ignorés, voir `src/lib/normalisation.ts`) — le champ `distributor` reste un texte libre extrait par l'IA, jamais une liste fermée d'enseignes ; toute comparaison ou regroupement par distributeur doit se faire sur `distributorNorm`, jamais sur `distributor` brut.

`TYPES_ACHAT_REEL` (`src/lib/documentLabels.ts`) : liste les types comptant comme achat réellement engagé (facture, bon_commande, bon_enlevement) — à utiliser pour tout calcul de dépenses. `devis` en est toujours exclu (ce n'est qu'une proposition de prix, pas un achat).

## Stripe — à faire EN DERNIER (phase 4)

- 3 produits/prix dans le dashboard Stripe (29/49/89 €/mois), IDs en variables d'env
- Route `POST /api/stripe/checkout` : crée une Checkout Session (mode subscription) liée au `stripeCustomerId`
- Route `POST /api/stripe/webhook` : signature vérifiée, met à jour `subscriptionStatus` et `plan` en base
- Route `POST /api/stripe/portal` : ouvre le Customer Portal (changement de plan, annulation, factures — ne rien recoder soi-même)
- Middleware serveur : fonctionnalités premium accessibles seulement si `subscriptionStatus = active` (ou `trialing`)
- Tester tout le cycle en mode test avec `stripe listen --forward-to localhost:3000/api/stripe/webhook` avant toute clé live
- TVA : activer Stripe Tax

## Plan de développement par phases

**Phase 1 — Socle** : projet Next.js + TS, Prisma + PostgreSQL, Auth.js lien magique, layout de l'app (reprendre l'identité visuelle de la landing : fond nuit, accent orange, typo Barlow), page compte avec suppression RGPD.

**Phase 2 — Cœur IA** : upload sécurisé, extraction Claude + validation Zod, écran de vérification/correction, alimentation de PriceHistory, comparaison à l'historique + alertes de hausse. Tests sur de vrais devis Cedeo/Point P/Rexel.

**Phase 3 — Valeur autour** : liste chronologique des factures avec filtres ✅, tableau de bord dépenses par distributeur avec objectifs/BFA ✅, comparateur inter-enseignes ✅, générateur de devis client PDF ✅ (+ transformation devis→facture, navigation "Facturation clients" regroupée, dashboard "En bref", modification d'un devis existant avec reconstruction IA, suggestion de prix par historique d'achat — voir ci-dessous), alerte remise de fin d'année (à faire).

Comparateur inter-enseignes : implémenté relié à l'alerte de hausse existante (pas un écran séparé) — quand une ligne augmente chez le distributeur habituel, la page document affiche aussi, sous l'alerte, si un prix plus bas existe ailleurs dans l'historique personnel de l'artisan pour la même référence fabricant, avec le nom du distributeur, le prix et la date. Trois états distincts affichés pour ne pas induire en erreur : réf. fabricant non identifiée sur la ligne / réf. connue mais aucun prix plus bas trouvé / prix plus bas trouvé. Voir `src/lib/comparaisonPrix.ts` et `src/app/documents/[id]/page.tsx`.

Générateur de devis client ✅ (`src/app/(app)/devis-clients/`) : création manuelle ou assistée par IA (prompt texte ou dictée vocale, `src/lib/genererDevisIA.ts`), aperçu éditable avant validation, PDF via le profil "Mon entreprise" (`CompanyProfile`), transformation en facture (`ClientInvoice`) qui verrouille le devis en modification. Sidebar : "Devis clients"/"Factures clients" regroupés sous "Facturation clients" (`/facturation-clients`, même pattern de sous-menu que "Mes documents"), avec dashboard "En bref" (nombre de devis, taux de transformation). Un devis non transformé peut être corrigé manuellement ou via instruction en langage naturel/vocal (l'IA reconstruit les lignes concernées en conservant les autres, `FormulaireDevis.tsx` généralisé avec prop `devisExistant`). Quota mensuel de génération IA (création + modification confondues) suivi via la table `GenerationIA`, voir `quotaDevisIA()` (`src/lib/quota.ts`) et `etatQuotaDevisIA()` (`src/lib/devisClients.ts`).

Suggestion de prix par historique d'achat ✅ (`src/lib/suggestionPrix.ts`) : sur chaque ligne de devis (création et modification), un champ "Référence fournisseur (optionnel)" déclenche un lookup débouncé (500 ms) qui cherche par inclusion (substring, pas de trigram pour cette V1) dans `PriceHistory.referenceNorm`/`manufacturerRefNorm` sur l'historique personnel de l'artisan. Prix suggéré = moyenne des 3 achats les plus récents (tous distributeurs confondus) × (1 + `CompanyProfile.margeParDefautPct`, réglable dans "Mon entreprise", 25% par défaut) — jamais appliqué automatiquement, un bouton "Utiliser" explicite reporte le prix sur la ligne. Aucune suggestion si la recherche fait moins de 3 caractères ou si rien ne correspond (message dédié, distinct du cas "recherche en cours").

**Phase 4 — Monétisation** : Stripe (checkout, webhooks, portal, gating des plans), page tarifs branchée, emails transactionnels (Resend).

**Phase 5 — Durcissement** : rate limiting, tests d'isolation entre utilisateurs, audit `npm audit`, page confidentialité + CGV, monitoring erreurs (Sentry).

## Conventions de travail avec Claude Code

- Travailler phase par phase : ne pas commencer Stripe avant validation de la phase 2 par le fondateur
- Après chaque fonctionnalité : expliquer en français simple ce qui a été fait et comment le tester
- Commits atomiques avec messages en français
- Toute décision de sécurité prise doit être signalée explicitement
- Le fondateur n'est pas développeur professionnel : privilégier la simplicité, éviter la sur-ingénierie, pas de microservices
