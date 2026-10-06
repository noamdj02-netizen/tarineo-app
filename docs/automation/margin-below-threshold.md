# Spec — Alerte « marge sous seuil »

## Objectif

Alerter l’artisan lorsque la **marge estimée** sur un devis client (ou chantier) passe **sous son seuil cible**, distinct des **hausses fournisseur** (`price_alerts`).

## Distinction obligatoire

| Signal | Donnée | Question métier |
|--------|--------|-----------------|
| **Hausse fournisseur** | `price_alerts`, `recordPriceAlerts` | « Ce produit coûte plus cher qu’avant chez ce fournisseur ? » |
| **Marge sous seuil** | Calcul buy/sell sur document out | « Mon devis client laisse-t-il assez de marge ? » |

Ne pas réutiliser `price_alerts` pour la marge : sémantique et UI (`/hausses`) différentes.

## Automatisation `margin_below_target`

### Config (`automation_definitions.config`)

```jsonc
{
  "enabled": true,
  "floorMarginPct": null,     // null = hériter entreprise (margeCiblePct || marge_par_defaut_pct)
  "minLinesWithCost": 1,      // ignorer devis sans ligne d'achat renseignée
  "notifyInApp": true,
  "notifyEmail": false,       // Email 05 — phase ultérieure
  "cooldownHours": 24         // pas plus d'une alerte / document / fenêtre
}
```

**Seuil effectif :**

```ts
floor =
  config.floorMarginPct
  ?? settings.commercial.margeCiblePct
  ?? company.marge_par_defaut_pct
  ?? 25;
```

## Calcul de marge (MVP)

### Périmètre documents

- `direction === 'out'`
- `kind === 'devis'` (phase 1)
- `status === 'ready'`
- Au moins une ligne avec `buy_price > 0` et `sell_price > 0`

### Formule (HT, par document)

```text
costHt  = Σ (buy_price × qty)
sellHt  = Σ (sell_price × qty)   // fallback sell_price || buy_price × markup si absent
marginHt = sellHt - costHt
marginPct = sellHt > 0 ? (marginHt / sellHt) × 100 : null
```

Arrondi affichage : 1 décimale (`marginPct`).

### Cas limites

| Cas | Comportement |
|-----|----------------|
| `sellHt === 0` | Pas d’alerte (`margin-null`) |
| Lignes sans `buy_price` | Exclues du coût ; si `minLinesWithCost` non atteint → skip |
| Devis issu de transform (`source_document_id`) | **Point de déclenchement prioritaire** après création/mise à jour lignes |

## Points de déclenchement

| Événement | Fichier hook (futur) |
|-----------|----------------------|
| `document.analyzed` inbound | **Non** — pas de sell côté fournisseur |
| Devis client créé / transformé | `transformImportedDocument` / actions devis (`app/(app)/metier/actions.ts`) |
| Mise à jour manuelle lignes (sell) | `updateDocumentLines` (si existe) — phase 2 |
| Recalcul marge après hausse fournisseur | Option P1 : réévaluer devis liés au chantier |

**MVP :** hook unique après création/màj devis **out** avec lignes sell+buy.

## Workflow

```
evaluateMarginBelowTarget(documentId)
  → charger doc + settings
  → marginPct := computeDocumentMarginPct(doc)
  → si marginPct === null → skip
  → si marginPct >= floor → skip (CONDITION_NOT_MET)
  → idempotency := margin_below:{documentId}:{floorKey}:{dayBucket}
       floorKey = floor arrondi 1 décimale
       dayBucket = YYYY-MM-DD (UTC) ou cooldownHours glissant
  → si execution/notif existe → skip
  → notifyMarginBelowTarget({ documentId, marginPct, floor, sellHt, costHt })
  → automation_executions completed phase=notify
```

## Emitter — `notifyMarginBelowTarget`

Nouveau dans `lib/notifications/emitters.ts` :

```ts
type MarginBelowTargetInput = {
  documentId: string;
  chantierId?: string | null;
  marginPct: number;
  floorPct: number;
  sellHt: number;
  costHt: number;
};
```

| Champ notif | Valeur |
|-------------|--------|
| `type` | `margin_below_target` (nouveau type libre, text check ≤64) |
| `title` | `Marge sous votre seuil` |
| `message` | `Marge estimée ${marginPct} % (objectif ${floorPct} %).` + montant HT si utile |
| `priority` | `high` si `marginPct < floor - 5`, sinon `normal` |
| `action_url` | `/pieces/{documentId}` |
| `preferenceChannel` | Nouveau canal `margins` ou réutiliser `quotes` — **décision :** `quotes` + event `quote_margin_low` (à ajouter aux prefs) |
| `idempotencyKey` | `margin_below:document:{documentId}:{floorKey}:{dayBucket}` |

**Email (phase 5) :** template `emails/margin-alert.tsx`, respect `emailQuotes` ou flag dédié.

## Relation avec `recordPriceAlerts`

```
document inbound ready
  → recordPriceAlerts (inchangé)
  → notifySupplierIncreases

document outbound devis ready (post-transform)
  → evaluateMarginBelowTarget (nouveau)
  → PAS d’insert price_alerts
```

Option P1 : si hausse fournisseur sur chantier, recalculer marge du **dernier devis client** ouvert sur ce chantier.

## Sécurité

- Évaluation uniquement avec session user ou admin cron scoping `user_id` du document.
- Pas d’exposition cross-tenant : `documents.user_id` + RLS.

## Observabilité

| `slug` | `phase` | `metadata` |
|--------|---------|------------|
| `margin_below_target` | `evaluate` | `{ marginPct, floorPct, sellHt, costHt }` |
| `margin_below_target` | `notify` | `{ notificationId }` |
| skipped | | `{ reason: 'above-floor' \| 'margin-null' \| 'cooldown' }` |

## Tests

- Marge 30 %, floor 25 % → pas d’alerte
- Marge 22 %, floor 25 % → 1 notification
- Double appel même jour → 1 seule (idempotence)
- Document fournisseur in → pas d’évaluation
- IDOR : user B ne déclenche pas sur doc user A

## Fichiers prévus (implémentation)

| Fichier | Rôle |
|---------|------|
| `lib/automation/margin.ts` | `computeDocumentMarginPct`, `evaluateMarginBelowTarget` |
| `lib/notifications/emitters.ts` | `notifyMarginBelowTarget` |
| `lib/settings/notification-preferences.ts` | Event `quote_margin_low` (optionnel) |
| `app/(app)/metier/actions.ts` | Hook post-transform |
