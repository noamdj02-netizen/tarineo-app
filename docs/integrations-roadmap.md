# Intégrations TARINEO — Roadmap (post-audit)

## Inventaire flows (Phase 1)

| Flow | Où | Connectable aujourd’hui ? |
|------|-----|---------------------------|
| E-mails TARINEO (Resend) | Plateforme `RESEND_API_KEY` | **Oui** — test `domains.list` |
| Google Gmail | OAuth `/api/connect/google` + `tool_connections` | **Oui** — test profil Gmail |
| Agenda iCal | `calendar_feeds` + accueil | **Oui** — test fetch 14j |
| API TARINEO | `api_keys` hash + `/api/mcp` | **Oui** — test clés actives |
| Abonnement Stripe | `subscriptions` + `/abonnement` | **Oui** — statut billing (pas OAuth artisan) |
| Microsoft / ERP | Catalogue | **Non** — waitlist |
| Fournisseurs API | Catalogue | **Non** — import PDF seul |
| Stripe `rk_*` artisan | `/outils` | **Oui** — hors hub Phase 1 |

**Hub unique :** `/automatisations#connexions` (paramètres `/parametres/integrations` → redirect).

**Doublon assumé :** `/outils` reste la stack copilote ; pas de fusion Phase 1.

## Phase 1 (cette livraison)

- [x] Hub sur `/automatisations`
- [x] Statuts vérifiés (`loadVerifiedIntegrationsSnapshot`)
- [x] Stripe **option A** — carte Billing (pas nouvelle connexion OAuth)
- [x] Auto-test Google après OAuth
- [x] `reconnection_required` conservé
- [ ] Staging : migration automation + smoke Resend (ops)

## Phase 2

- Gmail envoi métier (vault tokens)
- Webhooks Resend (bounces)
- Persistance dernier health check (DB)
- Auto-test post-OAuth sans action client (server redirect handler)

## Phase 3

- Microsoft Graph, ERP partenaires
- Unifier `/outils` Stripe artisan dans hub (optionnel)

## Phase 4

- JARVIS sur registry + `automation_executions`
