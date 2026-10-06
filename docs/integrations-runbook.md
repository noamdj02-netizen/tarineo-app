# Runbook — Hub intégrations (`/automatisations`)

## Vérifier Resend (E-mails TARINEO)

1. `RESEND_API_KEY` et domaine vérifié sur l’environnement.
2. Ouvrir `/automatisations#connexions` → carte **E-mails TARINEO**.
3. Statut attendu : **Connecté** + message de santé après test serveur.
4. Si **Configuration requise** : clé absente ou test Resend échoué (pas de faux « Connecté »).

## Vérifier Google

1. **Connecter Google** → OAuth → retour `?bound=gmail`.
2. Message « connecté et vérifié » si profil Gmail OK.
3. Si **Reconnexion requise** : session sans `provider_token` → **Reconnecter**.
4. Déconnexion : supprime `tool_connections` gmail.

## Vérifier iCal

1. Configurer le flux sur `/accueil`.
2. Hub : **Tester la connexion** ou rechargement page (health auto).
3. Flux invalide → statut **Erreur**, pas Connecté.

## Vérifier API TARINEO

1. Créer une clé dans **Paramètres → Compte → agents**.
2. Hub : statut **Connecté** uniquement si test clé active OK.

## Vérifier Billing Stripe

1. Carte **Abonnement TARINEO** — lien **Abonnement**.
2. **Connecté** si plan actif / essai / fondateur ; **Disponible** si gratuit.
3. Ne pas confondre avec Stripe artisan (`/outils`).

## OAuth redirect

- Défaut : `/automatisations?bound=gmail#connexions`
- Paramètre optionnel : `return` sur `/api/connect/google` (chemin interne via `safeNext`).

## Permissions

- Section `integrations` : **edit** admin seulement (`lib/settings/roles.ts`).
- Actions serveur : `canEditSection(role, "integrations")`.

## Crons liés (pas le hub)

- Relances : `CRON_SECRET` + `/api/cron/follow-ups`
- Exports compta : `/api/cron/accounting-exports`
