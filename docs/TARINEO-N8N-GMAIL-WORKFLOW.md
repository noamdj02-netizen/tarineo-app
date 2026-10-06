# Gmail → n8n → TARINEO — Guide simple

> Pour artisans et fondateurs : **pas besoin de coder**.  
> TARINEO ne lit pas Gmail tout seul : **n8n** lit la boîte mail et envoie les PDF à TARINEO.

Contrat API : [`TARINEO-N8N-CONTRACT.md`](./TARINEO-N8N-CONTRACT.md)

---

## Le parcours en une image

```text
📧 Gmail (devis fournisseur)
        ↓
⚙️ n8n (automation)
        ↓
📎 Pièce jointe PDF / image
        ↓
🔐 API TARINEO (clé Pro)
        ↓
🤖 IA TARINEO (lecture du PDF)
        ↓
🗄️ Supabase (stockage)
        ↓
📄 Document visible dans l’app TARINEO
```

---

## Ce qu’il faut avant de commencer

| Élément | Où |
|---------|-----|
| Compte **TARINEO Pro** | Paramètres → Abonnement |
| **Clé API** scope **Écriture** | Paramètres → Compte → Clés API |
| **n8n** (cloud ou self-hosted) | Hors TARINEO |
| Compte **Gmail** connecté dans n8n | Credentials Google dans n8n |

**Ne jamais** mettre la clé API dans Git, dans le site web, ou dans un e-mail.

Dans n8n : stocke la clé dans **Credentials** (variable secrète).

---

## Étapes du workflow n8n (ordre)

### 1. Déclencheur Gmail

- Node : **Gmail Trigger** (ou **Poll** si tu préfères).
- Filtre conseillé :
  - expéditeur contient `@cedeo.fr` (exemple) **ou**
  - sujet contient `devis` / `facture`
- Option : label Gmail dédié `TARINEO/Import`.

### 2. Vérifier qu’il y a une pièce jointe

- Si **aucune PJ** → arrêter (log : `AUCUNE_PIECE_JOINTE`).
- Ne pas appeler TARINEO.

### 3. Filtrer les fichiers utiles

Règle simple (alignée TARINEO) :

| Priorité | Type | Action |
|----------|------|--------|
| 1 | `.pdf` | Envoyer |
| 2 | `.jpg` / `.jpeg` / `.png` / `.webp` | Envoyer |
| 3 | Autre (`.txt`, `.html`, petit logo) | **Ignorer** |

Éviter les signatures : souvent petit `.png` ou `.gif` — tu peux ignorer les fichiers **&lt; 20 Ko** sauf PDF.

### 4. Plusieurs pièces jointes

- Trier : **PDF en premier**, puis images.
- **Boucle** : une requête TARINEO **par fichier** supporté.
- Résultat : 2 PDF différents → 2 documents TARINEO.

### 5. Choisir `document_kind`

Heuristique simple (sujet + nom de fichier) :

| Mots dans le mail / fichier | `document_kind` |
|----------------------------|-----------------|
| facture, invoice | `supplier_invoice` |
| bon de commande, BC | `supplier_purchase_order` |
| bon de livraison, BL | `supplier_delivery_note` |
| devis, offre, quote | `supplier_quote` |
| **Rien de clair** | **Ne pas envoyer** → log `REVIEW` |

Ne force pas `supplier_quote` si tu n’es pas sûr.

Référence code (même logique que ce guide) : `lib/integrations/n8n-gmail.ts` → `guessSupplierDocumentKindFromEmail`.

### 6. Clé d’idempotence (anti-doublon)

Header HTTP :

```http
Idempotency-Key: <clé stable>
```

Formule recommandée :

```text
gmail:<messageId>:<attachmentId>
```

Si trop long, n8n peut hasher (voir `buildIngestIdempotencyKeyFromGmail` dans le repo).

**Même e-mail traité 2 fois** → TARINEO renvoie le **même** `document_id` (`idempotent_replay: true`).

### 7. Appel HTTP TARINEO

| Paramètre | Valeur |
|-----------|--------|
| Method | `POST` |
| URL | `https://<ton-domaine>/api/integrations/ingest-document` |
| Header `Authorization` | `Bearer npk_…` (credential n8n) |
| Header `Idempotency-Key` | voir étape 6 |
| Body | `multipart/form-data` |

Champs form :

| Champ | Valeur |
|-------|--------|
| `file` | binaire de la PJ |
| `document_kind` | ex. `supplier_quote` |
| `metadata` | optionnel : `{"title":"Devis Cedeo - Mars"}` |

**Timeout** : prévoir au moins **120 s** (extraction IA).

### 8. Exploiter la réponse

Champs **réels** renvoyés par TARINEO :

| Champ | Signification |
|-------|----------------|
| `document_id` | ID du document dans TARINEO |
| `type` | ex. `supplier_quote` |
| `direction` | `in` (fournisseur) |
| `kind` | ex. `devis` |
| `title` | Titre du document |
| `supplier.name` | Nom fournisseur lu |
| `customer` | `null` pour un doc fournisseur |
| `chantier_id` | souvent `null` |
| `lines[]` | lignes (description, quantité, prix HT) |
| `totals.total_ht` / `total_tva` / `total_ttc` | totaux si l’IA les a lus |
| `extraction.vendor_key` | indice fournisseur (ex. profil) |
| `idempotent_replay` | `true` si doublon évité |

Pas de champ `warnings` dans la réponse actuelle.

### 9. Journalisation dans n8n (sans secrets)

Pour chaque e-mail, garde une trace :

```text
EMAIL_REÇU → messageId, sujet, expéditeur
PJ_TROUVÉE → nom, taille, mime
ENVOI_TARINEO → document_kind, idempotency (pas la clé API)
RÉPONSE → status HTTP, document_id, idempotent_replay
SUCCÈS ou ERREUR → code erreur TARINEO
```

---

## Que faire selon la réponse HTTP ?

| Code | `error` | Action n8n |
|------|---------|------------|
| 201 | — | Succès, nouveau document |
| 200 | — | Succès, replay idempotent (déjà importé) |
| 401 | `unauthorized` | Clé API invalide → alerte admin |
| 403 | `feature_requires_pro` | Compte Starter → upgrade Pro |
| 403 | `forbidden` | Clé sans scope **write** |
| 400 | `invalid_file` / `invalid_request` | PJ ignorée, log |
| 413 | `file_too_large` | &gt; 12 Mo, log |
| 409 | `idempotency_conflict` | Même clé, fichier différent → alerte |
| 422 | `extraction_failed` | IA n’a pas pu lire → review manuelle |
| 429 | `rate_limited` | Réessayer plus tard |
| 500 | `internal_error` | Réessayer 1–2 fois puis alerte |

---

## Exemple concret

**Situation :** Marie reçoit un e-mail de **Cedeo** avec `Devis_12345.pdf`.

1. Gmail reçoit le mail.
2. n8n se déclenche (filtre fournisseur ou label).
3. n8n voit 1 PDF → `document_kind = supplier_quote`.
4. n8n envoie le PDF à TARINEO avec sa clé Pro.
5. L’IA lit les lignes et le total.
6. Le document apparaît dans TARINEO (Achats / distributeur / pièce).
7. Marie peut ensuite faire un **devis client** dans l’app (hors ce workflow).

---

## Réponse e-mail (futur — pas obligatoire cette phase)

| Cas | Message type (futur) |
|-----|----------------------|
| Succès | « Votre document a été importé dans TARINEO. » |
| Erreur | « Votre document n’a pas pu être importé. » |

Pour l’instant : les e-mails **métier** TARINEO passent par **Resend**, pas par Gmail.

---

## Tests à faire (checklist)

| # | Test | Résultat attendu |
|---|------|------------------|
| 1 | Gmail → PDF → TARINEO | Document dans l’app |
| 2 | Même e-mail 2× | 1 seul document (`idempotent_replay`) |
| 3 | 2 PDF différents | 2 documents |
| 4 | Fichier .txt | Erreur 400, pas de document |
| 5 | Clé Starter | 403 `feature_requires_pro` |
| 6 | Clé Pro sans write | 403 `forbidden` |
| 7 | Clé Pro + write | 201 ou 200 |
| 8 | Même Idempotency-Key, autre fichier | 409 |

Tests automatisés côté repo (logique n8n) : `lib/integrations/n8n-gmail.test.ts` et `ingest-document.logic.test.ts`.

Test 1–4 et 7 : **manuel** dans n8n + compte réel.

---

## Ce que ce workflow ne fait PAS (volontairement)

- Pas de devis client automatique.
- Pas de marge automatique.
- Pas d’envoi au client final.
- Pas de lecture Gmail dans TARINEO.
- Pas de webhook TARINEO → n8n.

---

## Configuration n8n — node HTTP Request (résumé)

1. **Authentication** : Header Auth → Name `Authorization`, Value `Bearer {{ $credentials.tarineoApiKey }}`.
2. **Send Body** : ON, **Body Content Type** : Form-Data.
3. **Form fields** :
   - `file` : type File, binary de la PJ.
   - `document_kind` : string.
   - `metadata` : optionnel JSON string.
4. **Headers** :
   - `Idempotency-Key` : expression (messageId + attachmentId).

Utilise les **Credentials** n8n pour la clé — jamais en dur dans le JSON du workflow exporté.
