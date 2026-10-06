# Checklist smoke — staging TARINEO

À exécuter sur l’URL staging après déploiement.

## Automation engine

1. Migration `20261006120000_automation_engine.sql` appliquée (voir `docs/automation-migration-runbook.md`).
2. Compte test : `/automatisations` → relance devis **ON**, planification auto **ON**.
3. Cron :
   ```bash
   curl -sS -H "Authorization: Bearer $CRON_SECRET" "https://<staging>/api/cron/follow-ups"
   ```
   Attendu : JSON avec `schedule` et `send`, pas 401.
4. Supabase : lignes `automation_definitions` + au moins une `follow_ups` planifiée si devis éligible.
5. **1** e-mail Resend reçu (seq 1) ; second cron → pas de doublon (idempotence).

## Intégrations (`/parametres/integrations`)

1. Carte **E-mails TARINEO** → statut Connecté si `RESEND_API_KEY` sur staging.
2. **Tester la connexion** sur E-mails TARINEO → message succès Resend.
3. **Google** : Connecter → retour `?bound=gmail` → Connecté ou Reconnexion requise selon session.
4. **Tester la connexion** Google → profil Gmail ou message de reconnexion clair.
5. **Agenda iCal** : flux sur `/accueil` → test connexion OK.

## Sign-off

| Zone | OK | Date | Notes |
|------|----|------|-------|
| Automation cron | ☐ | | |
| Resend e2e | ☐ | | |
| Intégrations UI | ☐ | | |

Quand les trois lignes sont cochées : mettre **Exploitation** en **READY** dans `docs/automation-engine-qa.md`.
