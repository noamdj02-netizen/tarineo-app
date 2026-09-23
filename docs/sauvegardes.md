# Sauvegardes automatiques — Tarineo

Tarineo ne gère pas de sauvegarde applicative maison : la continuité repose sur les
sauvegardes natives des fournisseurs cloud (hébergement UE).

## Base de données (PostgreSQL / Supabase)

- **Sauvegardes quotidiennes** automatiques côté Supabase (rétention selon le plan).
- **Point-in-Time Recovery (PITR)** disponible sur les plans payants Supabase — à
  activer dès la mise en production réelle des données clients.
- Les migrations Prisma (`prisma migrate deploy`) sont versionnées dans Git ; un
  restore DB + redéploiement Vercel suffit pour reconstruire l'état applicatif.

## Fichiers (Supabase Storage)

- Les documents uploadés vivent dans le bucket privé `documents` (région UE).
- Activer la réplication / rétention proposée par Supabase Storage sur le plan prod.
- Les clés objets sont référencées en base (`Document.fileKey`, etc.) : un restore
  DB sans restore Storage casse les URLs signées — restaurer les deux ensemble.

## Application (Vercel)

- Chaque déploiement est immuable ; rollback en un clic depuis le dashboard Vercel
  (ou `git revert` + push sur `main`).
- Variables d'environnement : documentées dans `.env.example`, synchronisées via
  le dashboard Vercel (jamais dans Git).

## Checklist périodique (fondateur)

1. Vérifier dans Supabase → Database → Backups que la dernière sauvegarde est < 24 h.
2. Tester une restauration sur un projet staging au moins une fois avant le go-live
   clients payants.
3. Exporter périodiquement un dump logique (`pg_dump`) hors Supabase si le volume
   critique augmente (stockage local chiffré / autre cloud UE).

## Contacts / runbook incident

En cas de perte de données suspectée : ne pas écrire en base, contacter le support
Supabase avec l'heure approximative de l'incident, puis restaurer un PITR / backup
quotidien sur un projet temporaire avant bascule DNS.
