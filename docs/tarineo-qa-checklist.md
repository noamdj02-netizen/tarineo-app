# Checklist QA TARINEO (premier artisan payant)

Cocher après un passage réel (compte de test, pas le seed Dupont).

## AUTH

- [ ] inscription
- [ ] connexion
- [ ] confirmation
- [ ] reset password
- [ ] logout

## ENTREPRISE

- [ ] informations entreprise
- [ ] SIRET
- [ ] TVA
- [ ] logo

## CHANTIER

- [ ] création
- [ ] modification
- [ ] focus
- [ ] pause
- [ ] terminé

## DOCUMENT

- [ ] upload PDF
- [ ] extraction
- [ ] modification lignes
- [ ] sauvegarde

## CLIENT

- [ ] création
- [ ] devis
- [ ] PDF
- [ ] email

## TRANSFORMATION

- [ ] devis → commande
- [ ] devis → facture

## ACHATS

- [ ] fournisseur
- [ ] achat
- [ ] marge
- [ ] hausse

## ASSISTANT

- [ ] lecture données
- [ ] requête chantier
- [ ] requête marge
- [ ] requête hausse
- [ ] action avec confirmation

## BILLING

- [ ] checkout *(bloqué tant que les lookup `tarineo_*` n’existent pas dans Stripe)*
- [ ] webhook
- [ ] activation plan
- [ ] annulation

## SÉCURITÉ

- [ ] utilisateur non connecté
- [ ] accès autre compte
- [ ] anciennes routes Navpit
- [ ] API protégées

### Anciennes URLs (attendu : redirect ou 404, pas le kit Navpit)

- `/projets` → chantiers
- `/schemas` → hausses
- `/composants` → client
- `/composants-2` → client
- `/ressources` → distributeur
- `/themes` → accueil
- `/anatomie` → achats
- `/outils` → fournisseurs
- `/audit` → comparateur
- `/bibliotheque/heros` → accueil
- `/automatisations` → accueil
- `/assistant` → accueil

En preview/prod : `/api/mcp`, `/api/schemas/generate`, `/api/projects/seo` → 404.
