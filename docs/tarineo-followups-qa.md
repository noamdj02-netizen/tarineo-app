# TARINEO — QA relances

Date : 28 sept. 2026  
Verdict : **NOT READY** pour un client payant tant que les migrations n’ont pas été appliquées en base réelle et que le parcours e-mail / cron n’a pas été joué sur un compte authentifié.

## Migration

- `20260928140000_follow_ups.sql` : table `follow_ups`, FK `document_id` / `chantier_id`, `user_id`, index user+status+scheduled, RLS `owner_all` (`user_id = auth.uid()`).
- Manquait : `attempt_number`, `updated_at`, statut `cancelled`. Ajoutés **dans une seconde migration** `20260928150000_follow_ups_hardening.sql` (la première n’a pas été réécrite).
- À appliquer sur le projet Supabase. Non vérifié ici que les migrations sont live.

## RLS / ownership

- Politique authenticated : lecture/écriture seulement si `user_id = auth.uid()`.
- Requêtes app (session) : `.eq("user_id", db.user.id)` sur list/upsert/update.
- Cron : client admin, filtré par `follow_ups.user_id` puis documents du même `user_id`.
- `getDocument` / `listDocuments` sont scopés à la session : le compte A ne charge pas les pièces de B. `send_follow_up` passe par ces listes.

## Cron

- `GET /api/cron/follow-ups` uniquement.
- `CRON_SECRET` obligatoire (plus d’exception hors production).
- Bearer comparé avec `timingSafeEqual`.
- Claim avant envoi (`scheduled` + `sent_at` null + `attempt_number`).
- Une erreur d’un item n’arrête pas la boucle (`try/catch`).
- Resend : `idempotencyKey: follow-up:{id}` pour une double exécution.

Tests unitaires (`npx tsx --test lib/metier/follow-ups.test.ts`) : auth bearer + éligibilité.

Non joué en live : appel Vercel cron, envoi Resend réel.

## Email

- Réutilise `sendEmailWithPdf` / Resend / `EMAIL_FROM` / `BRAND` TARINEO.
- PDF joint, sujet et corps fournis par l’artisan.
- Pas d’APP_URL dans le corps (l’infra existante n’en mettait pas).
- `EMAIL_FROM` local peut encore pointer vers une ancienne marque : à vérifier dans l’env, pas dans le code.

## Assistant

- `list_follow_ups` : données session.
- `send_follow_up` : `confirm=true` obligatoire, document de la session, éligibilité.

Non joué : conversation réelle avec clé Anthropic.

## UX

- `/relances` : table dense (statut, contact, chantier, document, montant, dernière / prochaine action).
- Pas dans la sidebar. Accès ⌘K, chantier, document, Accueil.
- Statuts = `follow_ups.status` (+ lignes virtuelles « À relancer » seulement si `extract.sent_at` et 3 jours, non transformé).

## Tests checklist

| Cas | Résultat |
|---|---|
| A créer une relance | Logique en place ; **pas d’essai UI connecté** |
| B programmer 1/3/7 j | Code : exige document déjà envoyé (`sent_at`) |
| C annuler | Bouton Annuler → `cancelled` |
| D relancer maintenant | Action + mail existant |
| E transformé avant échéance | Cron : `followUpStillEligible` → pas d’envoi, statut `done` |
| F document erreur | Refusé (`document-invalid`) |
| G sans email | Refusé |
| H double cron | Claim + idempotency Resend ; **pas d’essai double GET live** |
| I compte A / B | RLS + filtres `user_id` ; **pas d’essai deux sessions** |
| J assistant | confirm ; **pas d’essai chat live** |
| K chantier | `listDocuments({ chantierId })` |
| L vues globales | `PieceKindPage` filtre `kind` + même `id` |

Typecheck : OK  
Lint ciblé : OK  
Build : OK  
Tests unitaires éligibilité + cron auth : 10/10  
Cron local sans secret : HTTP 401

## BLOCKERS

1. Migrations `follow_ups` (+ hardening) **non confirmées** sur la base distante.
2. `CRON_SECRET` doit être défini (sinon 401).
3. Relances programmées **e-mail réel** non envoyées dans cette passe.
4. Isolation A/B non testée avec deux comptes.
5. Chaîne facture : le métier actuel met souvent `source_document_id` = devis, pas commande. **Ne pas changer** ; l’UI montre la descendance réelle.

Ne pas déclarer READY tant que 1–4 ne sont pas faits sur un environnement réel.
