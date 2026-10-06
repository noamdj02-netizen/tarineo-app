# Migration automation engine — procédure

Fichier : `supabase/migrations/20261006120000_automation_engine.sql`

## Contenu

| Objet | Détail |
|-------|--------|
| `automation_definitions` | `(user_id, slug)` unique, RLS owner, trigger `touch_updated_at` |
| `automation_executions` | `(user_id, idempotency_key)` unique, RLS owner |
| `follow_ups.sequence_number` | défaut 1, index unique actif `(user_id, document_id, sequence_number)` où `status in ('scheduled','sent')` |

**Pas de seed global** : chaque utilisateur obtient ses lignes via `ensureAutomationDefinitions()` (UI `/automatisations` ou premier chargement).

## Local

```bash
supabase db reset   # ou supabase migration up
```

Vérifier :

```sql
select * from automation_definitions limit 1;
select column_name from information_schema.columns where table_name = 'follow_ups' and column_name = 'sequence_number';
```

## Staging

1. Merger la migration sur la branche staging.
2. `supabase db push` (ou pipeline CI migrations).
3. Smoke : activer `quote_followup` pour un compte test via `/automatisations`.
4. Appeler le cron avec secret : `curl -H "Authorization: Bearer $CRON_SECRET" https://<staging>/api/cron/follow-ups`
5. Contrôler `automation_executions` et `follow_ups`.

## Production

1. **Fenêtre** : hors heures de pointe (cron relances ~ matin).
2. Appliquer la même migration (pas de modification manuelle prod).
3. Déployer le code **après** migration réussie.
4. Vérifier logs Vercel `[cron] follow-ups phase A|B`.
5. Rollback code possible ; rollback SQL uniquement si aucune donnée `automation_*` critique (sinon migration inverse dédiée).

## Ne pas faire

- Modifier les tables prod à la main.
- Activer `autoScheduleEnabled` pour tous les users sans QA staging.
