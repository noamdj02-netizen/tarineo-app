# Spec — Agent fournisseur (veille) · plan Pro

> Statut : **spec validée pour chiffrage, non implémentée.**
> Auteur : Alan, d'après la demande de Noam (16 septembre 2026).
> Contrainte fondatrice explicite : **veille des promos, pas de scraping agressif sans accord.**

---

## 1. Le problème qu'on résout

Aujourd'hui Tarineo est **réactif** : l'artisan subit une hausse, l'importe, et découvre après coup qu'il a payé 12 % plus cher. La valeur est réelle mais arrive trop tard.

L'agent fournisseur rend Tarineo **proactif** : il surveille en continu ce que font les enseignes de l'artisan (promos, nouveaux tarifs, ruptures, délais) et le prévient **avant** qu'il commande, sur les seules références qu'il achète vraiment.

Promesse tenable en une phrase, celle qu'on mettra sur la page tarifs :

> « Vous recevez une alerte quand une référence que vous achetez régulièrement est en promo, change de tarif, ou part en rupture chez l'un de vos fournisseurs. »

Ce que ça n'est pas — à répéter dans l'UI pour ne pas créer d'attente fausse :

- ❌ Pas un comparateur public de prix (on reste sur l'historique personnel de l'artisan, règle non négociable du projet).
- ❌ Pas un flux d'actualité du BTP ni un agrégateur de news.
- ❌ Pas un robot qui commande à la place de l'artisan.
- ❌ Pas un aspirateur de catalogues fournisseurs.

---

## 2. Garde-fous d'acquisition de données (le point dur)

C'est la partie qui peut tuer le produit si on la rate : un scraping massif des sites Cedeo / Point P / Rexel nous expose à un blocage IP, à une mise en demeure (CGU + droit *sui generis* du producteur de base de données, art. L342-1 du Code de la propriété intellectuelle), et surtout à griller la relation commerciale que Noam veut construire avec ces enseignes.

**Règle d'or : on ne collecte que ce qui est public, volontairement diffusé, et en volume négligeable.**

### Hiérarchie des sources, de la plus sûre à la plus risquée

| Niv. | Source | Statut | Verrou |
|------|--------|--------|--------|
| **S1** | **Les documents de l'artisan lui-même** (déjà en base : `Document`, `PriceHistory`) | ✅ 100 % légitime | Aucun — c'est sa donnée |
| **S2** | **E-mails promo que l'artisan reçoit déjà** de ses enseignes, réexpédiés vers une adresse Tarineo dédiée | ✅ Légitime, l'artisan est le destinataire | Consentement explicite + opt-in par boîte |
| **S3** | **PDF de promos / catalogues** que l'artisan dépose lui-même (il en reçoit en agence) | ✅ Légitime | Aucun |
| **S4** | **Flux publics volontairement diffusés** : RSS, pages « nos promotions », newsletters publiques | 🟡 À valider CGU par CGU | 1 requête/jour/page max, `robots.txt` respecté, User-Agent identifié `TarineoBot/1.0 (+https://tarineo.fr/bot)` |
| **S5** | **API / flux partenaires** obtenus par accord commercial signé | ✅ Idéal, à viser | Nécessite le travail commercial de Noam |
| **S6** | **Scraping de pages produit, prix connecté, espace client de l'artisan** | ⛔ **Interdit sans accord écrit** | — |

**Décision :** on démarre en **S1 + S2 + S3 uniquement**. S4 ne s'ouvre qu'enseigne par enseigne, après lecture des CGU, avec une trace écrite dans ce fichier. S6 reste fermé même si techniquement trivial.

### Conséquence produit

La V1 de l'agent est **alimentée par l'artisan**, pas par le web. C'est moins « magique » sur le papier, mais :

- ça marche dès le premier jour sans aucune négociation,
- c'est défendable juridiquement sans avocat,
- ça crée l'argument commercial pour aller voir Cedeo ensuite (« j'ai N artisans qui vous achètent X € par an, ouvrez-moi un flux »).

---

## 3. Fonctionnalités

### F1 — Veille promos par e-mail réexpédié *(cœur de la V1)*

L'artisan reçoit déjà les newsletters de ses enseignes. On lui donne une adresse dédiée — `veille+<token>@in.tarineo.fr` — et il crée une règle de transfert automatique dans sa boîte.

À réception : l'e-mail est parsé par Claude (le corps HTML + les PDF joints), on en extrait les références en promo, le prix promo, la date de fin, puis **on croise avec son `PriceHistory`**. Seules les références qu'il achète réellement génèrent une alerte. Le reste est archivé sans notification.

C'est ce croisement qui fait la valeur : un mail Cedeo contient 200 promos, 3 le concernent.

### F2 — Suivi de référence

Depuis n'importe quelle ligne de document, bouton **« Surveiller cette référence »**. L'artisan choisit un seuil (« préviens-moi si ça repasse sous 540 € HT »). Toute nouvelle donnée — un de ses propres documents, une promo F1, un dépôt PDF — déclenche l'évaluation du seuil.

### F3 — Résumé hebdomadaire

Un e-mail le lundi matin : ce qui a bougé sur ses 20 références les plus achetées, les promos qui expirent cette semaine, où il en est de ses objectifs BFA (`DistributorGoal` existe déjà). Un seul e-mail, pas de notification à l'unité — les artisans sont sur chantier.

### F4 — Détection de dérive silencieuse ✅ *(livrée le 16/09/2026)*

Implémentée dans `src/lib/derivePrix.ts`, affichée sur `/veille` et résumée par une carte sur le dashboard. Seuils retenus : au moins **3 achats** de la même référence chez le même distributeur sur **12 mois**, aucune hausse d'un achat à l'autre au-dessus de **3 %** (sinon l'alerte de hausse existante l'a déjà signalée, ce ne serait plus « silencieux »), et une hausse **cumulée > 5 %**. Le surcoût annuel est estimé en multipliant l'écart unitaire par la quantité achetée sur la période.

Le volet « écarts entre enseignes d'un même groupe » n'est pas dans cette livraison : il recoupe largement le comparateur inter-enseignes existant, à reprendre seulement si l'usage montre que ça manque.

Pas besoin de source externe : purement calculé sur `PriceHistory`. On détecte les hausses répétées et discrètes (+2 % trois fois en six mois = +6 %, chacune sous le seuil d'alerte de 3 %), et les écarts entre enseignes d'un même groupe (le catalogue `fournisseursConnus.ts` connaît déjà les groupes : Saint-Gobain, Rexel, Descours & Cabaud…).

**F4 est la fonctionnalité au meilleur ratio valeur/risque : zéro donnée externe, zéro question juridique, et elle marche dès le premier artisan.** Si on ne devait en faire qu'une, c'est celle-là.

### F5 — Délais & ruptures *(V3, nécessite S5)*

Hors périmètre tant qu'aucun accord fournisseur n'est signé. Documenté ici pour mémoire, pas pour la roadmap.

---

## 4. Modèle de données

Trois tables, dans l'esprit simple du schéma existant.

```prisma
model SourceVeille {
  id        String   @id @default(cuid())
  userId    String
  type      String   // "email_transfere" | "pdf_depose" | "flux_public"
  libelle   String   // "Promos Cedeo", "Newsletter Rexel"
  token     String?  @unique // partie +<token> de l'adresse de réception
  actif     Boolean  @default(true)
  consentAt DateTime // horodatage RGPD du consentement à traiter ces e-mails
  createdAt DateTime @default(now())

  user        User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  observations Observation[]

  @@index([userId])
}

model Observation {
  id                   String    @id @default(cuid())
  userId               String
  sourceId             String
  distributor          String
  distributorNorm      String
  referenceNorm        String?
  manufacturerRefNorm  String?
  designation          String
  prixHt               Decimal?  @db.Decimal(12, 2)
  prixHabituelHt       Decimal?  @db.Decimal(12, 2) // recopié au moment du calcul, pour l'affichage historique
  valableJusquA        DateTime?
  fichierKey           String?   // PDF source, pour que l'artisan vérifie
  confiance            Float
  createdAt            DateTime  @default(now())

  user   User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  source SourceVeille @relation(fields: [sourceId], references: [id], onDelete: Cascade)

  @@index([userId, referenceNorm])
  @@index([userId, manufacturerRefNorm])
}

model SurveillanceReference {
  id                  String   @id @default(cuid())
  userId              String
  referenceNorm       String?
  manufacturerRefNorm String?
  designation         String
  seuilPrixHt         Decimal? @db.Decimal(12, 2)
  actif               Boolean  @default(true)
  createdAt           DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}
```

Les alertes produites réutilisent la table **`Alert` existante**, avec deux nouveaux `type` : `promo_detectee` et `derive_silencieuse`. Pas de table d'alertes parallèle.

Le rapprochement des références suit exactement la règle déjà en vigueur : `referenceNorm` pour comparer **chez le même distributeur**, `manufacturerRefNorm` pour comparer **d'une enseigne à l'autre** (voir `src/lib/comparaisonPrix.ts`).

---

## 5. Architecture technique

Volontairement sans file d'attente ni worker dédié : Vercel Cron + routes API suffisent au volume attendu (quelques centaines d'artisans).

```
E-mail transféré ──▶ Webhook Resend inbound ──▶ POST /api/veille/email
                                                      │
                     PDF déposé ───────────────────────┤
                                                      ▼
                                        Extraction Claude (vision + texte)
                                        Validation Zod, confiance < 0.7 → rejet
                                                      ▼
                                              table Observation
                                                      │
Cron Vercel 06:00 ──▶ /api/veille/analyser ──────────▶ croisement PriceHistory
                                                      │  + seuils SurveillanceReference
                                                      │  + détection dérive (F4)
                                                      ▼
                                               table Alert  ──▶ UI + e-mail Resend
```

**Points de vigilance :**

- **Authentification du cron** : `CRON_SECRET` en en-tête, sinon n'importe qui déclenche une analyse de masse.
- **Signature du webhook inbound** Resend à vérifier, comme pour Stripe. Un webhook non signé = injection d'observations arbitraires dans la base d'un artisan.
- **Isolation `userId`** : le `token` de l'adresse de réception résout l'utilisateur. Un token fuité permet d'injecter des données chez lui → token long (32 octets), révocable depuis les réglages, et l'observation reste toujours visible/supprimable par l'artisan.
- **Réutilisation maximale de l'existant** : `extraction.ts`, `normalisation.ts`, `comparaisonPrix.ts`, `fournisseursConnus.ts` couvrent déjà 80 % du besoin. L'agent est surtout de la plomberie autour de briques déjà écrites.

---

## 6. Interface

- **`/veille`** — journal antéchronologique des observations, filtrable par distributeur, avec le document source consultable. Chaque ligne affiche l'écart avec le prix habituel de l'artisan.
- **Réglages `/veille/sources`** — adresse de transfert à copier, mode d'emploi du transfert automatique (Gmail, Outlook, Apple Mail), dépôt de PDF, désactivation d'une source.
- **Bouton « Surveiller »** sur chaque ligne de `/documents/[id]`.
- **Dashboard** — une carte « Veille » : *3 promos utiles cette semaine · 1 dérive détectée*.
- **Sidebar** — entrée « Veille » avec pastille de compte non lu.

L'état vide doit être honnête et actionnable, comme sur `/devis-clients` : expliquer qu'il faut transférer un premier e-mail, avec le mode d'emploi directement dans l'écran.

---

## 7. Positionnement tarifaire

| Plan | Veille |
|------|--------|
| Starter 29 € | F4 seule (dérive silencieuse) — zéro coût marginal, sert d'appât vers Pro |
| **Pro 49 €** | **F1 + F2 + F3 + F4, 3 sources, 60 observations/mois** |
| Premium 89 € | Sources illimitées, résumé quotidien, export comptable |

Gating **côté serveur** à chaque requête (`subscriptionStatus`), jamais déduit du client — règle de sécurité n° 3 du projet.

### Coût réel

Une newsletter fournisseur ≈ 15 000 tokens en entrée sur Claude, soit ~0,05 € l'analyse. À 60 observations/mois, on est autour de **1 € par artisan Pro**, sur 49 € encaissés. La marge tient largement ; le plafond de 60 sert à borner un abus, pas à protéger la marge.

---

## 8. RGPD

Le contenu d'une boîte e-mail est une donnée sensible : le sujet mérite d'être traité sérieusement, pas en case à cocher.

- Consentement **explicite, non pré-coché, horodaté** (`SourceVeille.consentAt`), distinct du consentement d'inscription.
- Ne sont conservés que les champs extraits (référence, prix, date). **Le corps de l'e-mail est supprimé après extraction**, jamais stocké.
- Purge automatique des observations à 24 mois.
- Désactivation d'une source depuis l'UI = arrêt immédiat du traitement + suppression des observations liées.
- L'existante suppression de compte doit cascader sur les trois nouvelles tables (`onDelete: Cascade` ci-dessus, à vérifier par un test).
- Mention dans la politique de confidentialité avant la mise en ligne, pas après.

---

## 9. Phasage proposé

L'agent arrive **après** la monétisation : c'est une fonctionnalité de rétention, elle n'a d'intérêt que s'il y a des abonnés à retenir et un historique à surveiller.

| Étape | Contenu | Charge | Dépendance |
|-------|---------|--------|------------|
| **V1** ✅ | F4 seule — dérive silencieuse, 100 % calcul local | livrée le 16/09/2026 | Aucune |
| **V2** | F1 + F2 + F3 — e-mail transféré, seuils, résumé hebdo | ~8 j | Resend inbound + Stripe (gating Pro) |
| **V3** | S4 flux publics, enseigne par enseigne | ~4 j / enseigne | Lecture des CGU, accord écrit |
| **V4** | S5 API partenaires, F5 délais et ruptures | — | Négociation commerciale Noam |

**Recommandation :** sortir **V1 maintenant** (aucun risque, aucune dépendance, et elle démontre la promesse), garder V2 pour juste après Stripe, et ne toucher à V3 qu'avec un accord écrit en main.

**État au 16/09/2026 :** V1 livrée. V2 reste bloquée sur Resend inbound + Stripe, V3/V4 sur des accords écrits.

---

## 10. Décisions à trancher par Noam

1. ~~**V1 (F4 dérive silencieuse) tout de suite, ou après Stripe ?**~~ → tranché : livrée tout de suite, page `/veille`.
2. **Adresse de réception : sous-domaine `in.tarineo.fr` chez Resend ?** À trancher avant d'acheter/configurer les DNS.
3. **Quelles enseignes en premier pour S4 ?** Nécessite de lire les CGU de chacune ; proposer Cedeo, Point P, Rexel puisque ce sont celles qui reviennent le plus dans les tests.
4. **F4 dans Starter ou réservée à Pro ?** Recommandation : Starter — elle ne coûte rien et elle crée l'envie de passer Pro.
