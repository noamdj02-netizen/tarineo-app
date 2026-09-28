# TARINEO — organisation UX autour du chantier

Une pièce = une ligne `documents`. Les pages sont des **vues**, pas des copies.

## Relations

```
chantier
  └── documents.chantier_id

document A (devis client)
  └── document B.source_document_id = A.id   (commande)
        └── document C.source_document_id = B.id  (facture, si la chaîne le permet)
```

La transformation existante **ne supprime pas** le devis. Elle crée une nouvelle pièce avec `source_document_id` **égal à la pièce source**. Si on transforme un devis en facture, `facture.source_document_id = devis.id` (pas forcément la commande). C’est le métier actuel, non modifié.

Relances : `follow_ups` + durcissement `attempt_number` / `cancelled` / `updated_at` (`20260928150000_follow_ups_hardening.sql`).

Cron : `GET /api/cron/follow-ups`, `Authorization: Bearer CRON_SECRET` (obligatoire, comparaison en temps constant). Claim `status=scheduled` + `sent_at is null` + `attempt_number`. Clé d’idempotence Resend `follow-up:{id}`.

```
follow_ups.document_id → documents.id
```

Les relances pointent vers le document. Pas de second devis.

## Vues

| Surface | Filtre |
|---|---|
| `/client/devis` | `direction=out`, `kind=devis` |
| `/client/bon-commande` | commandes client |
| `/client/facture` | factures client |
| `/chantiers/[slug]` | `chantier_id` du dossier |
| `/relances` | suivis `follow_ups` + devis éligibles (envoyés / anciens, non transformés) |

Sidebar inchangée. `/relances` n’y figure pas : Accueil (carte Relances), page Chantiers (lien), ⌘K, fiche chantier, fiche document.

## Statuts document affichés

Uniquement dérivés des champs existants :

- `extract.sent_at` → Envoyé
- enfant `source_document_id` commande → Commande créée
- enfant facture → Facturé / Facturée

Pas de statut inventé (Acceptée, À payer).

## Phases

1. Fiche chantier = dossier (onglets Vue / Documents / Achats / Relances / Activité) + cartes chantier sans bouton Relancer (pastille « n relance(s) à traiter » seulement).
2. Chaîne visuelle devis → commande → facture via `source_document_id`.
3. Page `/relances` (table dense).
4–5. Modal Relancer depuis la fiche document et depuis l’onglet Relances du chantier.
6. Cron `GET /api/cron/follow-ups` (horaire Vercel) : envoi serveur, jamais `setTimeout` navigateur. Contrôles : pièce prête, propriétaire, e-mail, non transformée, relance pas déjà envoyée / close.
7. Outils assistant `list_follow_ups` et `send_follow_up` (`confirm=true`).
8. Polish : PageHeader, statuts pastilles, empty copy courte.

## Métier non modifié

Pas de changement des règles de transformation, Stripe, Auth, tables documents/chantiers (hors table **nouvelle** `follow_ups` nécessaire au suivi). `extract.sent_at` est un cache d’envoi sur le JSON existant.
