# Spec — Pont « due » → « scheduled » (relance devis)

## Objectif

Convertir les relances **virtuelles** (`status: due`, `id: virtual:{documentId}`) en lignes **`follow_ups.status = scheduled`** exécutables par le cron existant, selon les préférences utilisateur, sans double envoi.

## État actuel

| Élément | Comportement |
|---------|----------------|
| `buildFollowUpViews()` | Crée des lignes virtuelles si devis **out** envoyé (`extract.sent_at`) depuis **≥ 3 jours**, non transformé, sans `follow_up` actif |
| `THREE_DAYS` | Constante fixe dans `lib/metier/follow-ups.ts` |
| Cron | Ne traite que `status = scheduled` et `scheduled_at <= now` |
| Resend | `idempotencyKey: follow-up:{followUpUuid}` |
| In-app | `notifyClientFollowUp` + sync accueil (`client_followup:document:{id}:due`) |

**Gap :** l’artisan doit planifier manuellement ; le « due » n’alimente pas le cron.

## Définition produit — automatisation `quote_followup`

### Config (`automation_definitions.config`)

```jsonc
{
  "autoScheduleEnabled": true,       // false = comportement actuel (due UI only)
  "firstDelayDays": 3,               // remplace THREE_DAYS pour l’auto
  "betweenSequencesDays": 7,         // délai avant relance n+1
  "maxSequences": 2,                 // nombre max de relances auto (hors envoi initial)
  "scheduleHourLocal": 9,            // aligné scheduleAtNine()
  "audience": "client",              // MVP : devis client uniquement
  "requireValidClientEmail": true
}
```

**Defaults** (si pas de ligne `automation_definitions`) :

- `autoScheduleEnabled`: `false` en rollout (feature flag) puis `true` si `emailFollowups` && opt-in explicite UI
- `firstDelayDays`: 3
- `maxSequences`: 2
- `betweenSequencesDays`: 7

Mapping prefs existantes :

| Champ legacy | Rôle |
|--------------|------|
| `emailFollowups` | Canal email pour l’envoi cron (inchangé) |
| `events.followup_due` | In-app rappel (inchangé) |
| `events.followup_sent` | Après envoi (futur emitter) |

### Séquence (`sequence_number` sur `follow_ups`)

| Seq | Signification |
|-----|----------------|
| 1 | Première relance après envoi du devis |
| 2 | Deuxième relance si toujours pas de réponse |
| n | `n <= maxSequences` |

**Numérotation :** `sequence_number` entier ≥ 1, stable pour toute la vie du document.

## Workflow cible

```
[Cron daily — phase A: autoScheduleDueQuoteFollowUps]
  Pour chaque user avec quote_followup.enabled && config.autoScheduleEnabled
    docs + stored follow_ups
    Pour chaque candidat (même règles que buildFollowUpViews + audience client)
      seq := prochaine séquence (1 + max sequence_number déjà sent|scheduled pour ce doc)
      Si seq > maxSequences → skip (log skipped)
      Si pas email client valide → skip
      Si document transformé / BC / facture suite → skip
      Si lifecycle != "Envoyé" (pas de sent_at) → skip
      Si délai depuis sent_at (seq=1) ou depuis dernière relance sent (seq>1) insuffisant → skip
      idempotency := quote_followup:schedule:{documentId}:{seq}
      Si execution existe (completed|started récent) → skip
      INSERT follow_ups (scheduled, scheduled_at, sequence_number, draft subject/body)
      INSERT automation_executions (completed, phase=schedule)
[Cron daily — phase B: processScheduledFollowUps — existant]
  …
  Resend idempotency := quote_followup:send:{documentId}:{seq}  // migration depuis follow-up:{uuid}
```

## Garde-fous (ne jamais planifier / envoyer)

| Condition | `metadata.skip_reason` |
|-----------|-------------------------|
| Devis accepté (BC / facture enfant) | `transformed` |
| `follow_ups` closed (`cancelled`, `done`, `answered`) | `closed` |
| Relance déjà `sent` pour cette `sequence_number` | `sequence-already-sent` |
| `scheduled` futur pour même seq | `sequence-already-scheduled` |
| Email client absent / invalide | `email-invalid` |
| User automation disabled | `automation-disabled` |
| `document.status !== ready` | `document-invalid` |
| Fournisseur (`audience !== client`) | `audience-not-supported` (MVP) |

## Idempotence

### Clés canoniques

| Action | Clé | Stockage |
|--------|-----|----------|
| Planification auto | `quote_followup:schedule:{documentId}:{seq}` | `automation_executions` |
| Envoi email | `quote_followup:send:{documentId}:{seq}` | Resend + `automation_executions` |
| Rappel in-app due | `client_followup:document:{documentId}:due` | `notifications` (existant) |

**Règle :** `{documentId}` = UUID `documents.id` ; `{seq}` = `sequence_number`.

### Concurrence cron

1. **Schedule :** `insert automation_executions` avec contrainte unique → si conflit, skip.
2. **Send :** conserver claim `attempt_number` sur `follow_ups` + idempotence Resend.
3. **Follow-up row :** index unique `(user_id, document_id, sequence_number)` où `status in ('scheduled','sent')` — voir migration.

## Résolution email / contenu

| Champ | Source |
|-------|--------|
| `to_email` | `parties.email` lié au document, ou `extract.last_sent_to` |
| `subject` / `body` | Template Email 04 (futur) ; MVP : `draft-mail` / modèle existant relance-dialog |
| `scheduled_at` | `scheduleAtNine(betweenSequencesDays)` ou `firstDelayDays` depuis `sent_at` |

## Points d’intégration code (implémentation future)

| Fichier | Changement |
|---------|------------|
| `app/api/cron/follow-ups/route.ts` | Appeler `autoScheduleDueQuoteFollowUps()` puis `processScheduledFollowUps()` |
| `lib/automation/handlers/quote-followup.ts` | Nouveau — logique schedule |
| `lib/metier/follow-up-queries.ts` | `upsertFollowUp` accepte `sequence_number` ; Resend key |
| `lib/metier/follow-ups.ts` | `firstDelayDays` depuis config (fallback 3) pour virtual due |
| `markDocumentSent` / `sendDocumentMail` | Option : pre-seed seq=1 scheduled si auto enabled (hook `quote.sent`) |

## Observabilité

| `phase` | `status` | Exemple |
|---------|----------|---------|
| `schedule` | `completed` | Relance #1 programmée J+3 |
| `schedule` | `skipped` | `email-invalid` |
| `send` | `completed` | Email Resend ok |
| `send` | `failed` | Erreur Resend |

## Tests à écrire (Phase 8)

- Virtual due → 1 row scheduled seq=1
- Double cron même jour → 1 seule execution schedule
- Seq 2 seulement après sent seq 1 + délai
- Transformé entre due et cron → skip send, follow_up `done`
- maxSequences=1 → pas de seq 2

## Rollout

1. Migration SQL (`sequence_number`, automation tables)
2. `autoScheduleEnabled: false` par défaut
3. Beta interne + QA `docs/tarineo-followups-qa.md`
4. Toggle UI `/automatisations` + opt-in
