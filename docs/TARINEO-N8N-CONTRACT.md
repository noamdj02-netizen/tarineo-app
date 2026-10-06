# TARINEO ↔ n8n — Contrat d’intégration

## Auth

```text
n8n HTTP Request
  → Header: Authorization: Bearer npk_…
  → Clé créée dans TARINEO (Paramètres → Compte → Clés API)
  → Scope write obligatoire pour l’import
  → Plan Pro requis (entitlement mcp_business)
```

Ne jamais utiliser `CRON_SECRET` pour un workflow utilisateur.

---

## Upload document

**URL :** `POST https://<ton-domaine>/api/integrations/ingest-document`

**Headers :**

| Header | Valeur |
|--------|--------|
| `Authorization` | `Bearer <TARINEO_API_KEY>` |
| `Idempotency-Key` | 8–128 caractères, unique par fichier logique |
| `Content-Type` | `multipart/form-data` |

**Champs form :**

| Champ | Obligatoire | Description |
|-------|-------------|-------------|
| `file` | oui | PDF ou image (JPEG, PNG, WebP) — max **12 Mo** |
| `document_kind` | oui | Voir tableau ci-dessous |
| `metadata` | non | JSON string : `{ "chantier_id": "uuid", "title": "…" }` |

### `document_kind`

| Valeur | Sens TARINEO |
|--------|----------------|
| `supplier_quote` | Entrant — devis fournisseur |
| `supplier_invoice` | Entrant — facture fournisseur |
| `supplier_purchase_order` | Entrant — bon de commande |
| `supplier_delivery_note` | Entrant — bon de livraison |
| `customer_quote` | Sortant — devis client |
| `customer_invoice` | Sortant — facture client |
| `customer_purchase_order` | Sortant — bon de commande client |

---

## Idempotence

```text
Même Idempotency-Key + même contenu fichier
  → 200 + même JSON (idempotent_replay: true)

Même Idempotency-Key + fichier différent
  → 409 idempotency_conflict
```

n8n : générer une clé stable par e-mail/PJ (ex. hash message-id + nom fichier).

---

## Réponse succès (201 ou 200)

```json
{
  "document_id": "uuid",
  "type": "supplier_quote",
  "direction": "in",
  "kind": "devis",
  "title": "Devis Point P",
  "supplier": { "name": "Point P" },
  "customer": null,
  "chantier_id": null,
  "lines": [
    {
      "description": "Tube PVC",
      "quantity": 10,
      "unit": "u",
      "unit_price_ht": 12.5
    }
  ],
  "totals": {
    "total_ht": 125,
    "total_tva": null,
    "total_ttc": 150
  },
  "extraction": { "vendor_key": "point_p" },
  "idempotent_replay": false
}
```

---

## Erreurs

| HTTP | `error` | Quand |
|------|---------|--------|
| 401 | `unauthorized` | Clé absente / invalide / révoquée |
| 403 | `feature_requires_pro` | Plan Starter (feature `mcp_business`) |
| 403 | `forbidden` | Scope `write` manquant |
| 400 | `invalid_file` | Format ou fichier vide |
| 400 | `invalid_request` | Champs manquants / metadata JSON invalide |
| 413 | `file_too_large` | > 12 Mo |
| 409 | `idempotency_conflict` | Même clé, autre fichier |
| 422 | `extraction_failed` | IA / lecture impossible |
| 429 | `rate_limited` | Trop d’imports / heure |
| 500 | `internal_error` | Erreur serveur (sans détail interne) |

Exemple Pro requis :

```json
{
  "error": "feature_requires_pro",
  "feature": "mcp_business"
}
```

---

## MCP (alternative HTTP)

Endpoint : `/api/mcp` (même clé API).

Tools métier :

- `tarineo_ingest_document` (base64 + metadata)
- `tarineo_list_documents`
- `tarineo_get_document`

Les tools Navpit (projets, notes…) restent séparés et exigent `api_access`.

---

## Workflow n8n de test (manuel)

```text
Manual Trigger
      ↓
Read Binary File (PDF fournisseur local)
      ↓
HTTP Request
  Method: POST
  URL: /api/integrations/ingest-document
  Authentication: Header Auth (Bearer)
  Body: multipart form-data
    file: binary
    document_kind: supplier_quote
  Header: Idempotency-Key: test-{{ $execution.id }}
      ↓
document_id + lignes JSON
```

---

## Gmail → n8n → TARINEO (workflow officiel)

**Guide pas à pas (non développeur) :** [`TARINEO-N8N-GMAIL-WORKFLOW.md`](./TARINEO-N8N-GMAIL-WORKFLOW.md)

TARINEO **ne lit pas** Gmail. C’est **n8n** qui :

1. reçoit l’e-mail (Gmail Trigger) ;
2. filtre les pièces jointes (PDF / images, pas les logos) ;
3. appelle `POST /api/integrations/ingest-document` avec la clé API **Pro** + scope **write**.

OAuth Google dans TARINEO (`/api/connect/google`) = surtout **envoi** (`gmail.send`) et liaison compte — **pas** l’import automatique des PJ.

### Idempotence Gmail (recommandé)

```http
Idempotency-Key: gmail:<messageId>:<attachmentId>
```

Helper repo (même règle) : `buildIngestIdempotencyKeyFromGmail` dans `lib/integrations/n8n-gmail.ts`.

### Réponse JSON (champs réels)

Voir section « Réponse succès » plus haut + champ additionnel :

| Champ | Type | Description |
|-------|------|-------------|
| `idempotent_replay` | boolean | `true` si l’import avait déjà été fait avec la même clé + même fichier |

Il n’y a **pas** de champ `warnings` ni `status` document dans la réponse ingest actuelle.

---

## Scénario « Devis fournisseur par e-mail »

| Étape | Statut |
|-------|--------|
| n8n reçoit PDF | 🟡 après config Gmail n8n |
| TARINEO ingest + IA | 🟢 API Phase 6 |
| Document + lignes en base | 🟢 |
| Marge + devis client UI | 🟢 (manuel app) |
| Relance auto Resend | 🟢 Pro + automatisations |
