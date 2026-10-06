# Audit — Générateur devis client gratuit (landing)

**Dernière mise à jour :** 2026-10-06  
**Section :** `#devis-facture` — `QuoteToInvoice` + `LandingQuoteTransformPanel`

## Composants & fichiers

| Rôle | Fichier |
|------|---------|
| Section landing | `components/site/landing-v2/sections/QuoteToInvoice.tsx` |
| UI upload / marge / téléchargement | `components/site/landing-v2/components/ui/LandingQuoteTransformPanel.tsx` |
| Aperçu visuel | `components/site/landing-v2/components/ui/scenes/DocumentTransformScene.tsx` |
| Quota PDF (1 essai) | `lib/site/landing-quote-demo-quota.ts` + `hooks/useLandingQuoteDemoQuota.ts` |
| Client API upload + PDF | `lib/site/landing-quote-transform-demo.ts` |
| Validation fichier | `lib/site/landing-demo-file.ts` |
| Rate limit extraction | `lib/site/landing-demo-rate-limit.ts` |
| Types + mapping extraction | `lib/site/landing-quote-extract.types.ts`, `landing-quote-extract-map.ts` |
| Extraction serveur | `lib/site/landing-quote-extract.server.ts` → `ingestDocumentWithAgent` |
| PDF serveur | `lib/site/landing-quote-pdf.server.ts` → `genererPdfPiece` |
| API extraction | `POST /api/landing/devis-demo/extract` (multipart, **ne consomme pas** l’essai PDF) |
| API PDF | `GET/POST /api/landing/devis-demo` (POST client + cookie quota **après succès**) |
| Middleware public | `lib/supabase/middleware.ts` — `/api/landing`, `/api/analytics/event` |

## Architecture (extraction réelle)

1. Le navigateur envoie le fichier en `multipart/form-data` (`file`) vers `/api/landing/devis-demo/extract`.
2. Le serveur valide taille (15 Mo), magic bytes (PDF / JPEG / PNG / WebP / GIF), puis appelle **`ingestDocumentWithAgent`** (même chaîne que l’app métier, sans persistance Supabase document).
3. Le résultat `ExtractResult` est mappé en `LandingExtractPayload` (lignes, client/chantier si détecté, qualité / caveats).
4. L’UI affiche l’aperçu des lignes, préremplit le client si présent, marge via slider (défaut 25 %).
5. Le téléchargement `POST /api/landing/devis-demo` exige les **`lines` extraites** (sanitisées côté serveur) + nom client ; génère le PDF en mémoire et pose le cookie d’essai consommé.

**Stockage :** aucun bucket Supabase pour les visiteurs anonymes ; buffer en mémoire uniquement.

**Données d’exemple :** `LANDING_QUOTE_DEMO` reste pour l’aperçu avant upload et le PDF fournisseur d’exemple (`GET ?kind=supplier`). Le PDF client **ne** retombe **plus** sur ces lignes si `lines` est absent (400).

## Sécurité

| Mesure | État |
|--------|------|
| Validation MIME (magic bytes) | Oui — `landing-demo-file.ts` |
| Taille max 15 Mo | Oui |
| Rate limit extraction | Oui — 5/heure, cookie HttpOnly (`landing-demo-rate-limit.ts`) |
| Rate limit PDF POST | Non dédié (quota 1 essai + cookie) |
| Taille upload (middleware) | `middlewareClientMaxBodySize: 16mb` dans `next.config.ts` (aligné 15 Mo app + marge multipart) |
| Timeout extraction | `maxDuration` 60s sur route extract |
| Essai non consommé si échec extract/PDF | Oui |
| Service role côté client | Non |

## Analytics `demo_*`

Émis depuis le panel : `demo_started`, `demo_file_uploaded`, `demo_document_analyzed` (succès extract uniquement), `demo_margin_applied`, `demo_pdf_generated`, `demo_pdf_downloaded`, `demo_signup_clicked`.

## Limites restantes (honnêtes)

- **Marge métier complète** (automations / `settings.commercial` / profil) : non applicable sans compte ; slider + défaut 25 %.
- **Qualité OCR / scans** : dépend du modèle et de `read_assessment` ; message d’incertitude si `uncertain`.
- **TVA par ligne** : mapping actuel force souvent 20 % si non extrait finement.
- **Anti-abus fort** : quota PDF contournable (cookie + localStorage) ; rate limit seulement sur l’extraction.
## Migrations / RLS

Aucune table ou bucket pour cette démo.

## Tests automatisés

- `lib/site/landing-demo-file.test.ts` — magic bytes / fichier vide
- `npm run typecheck` / `npm run build` — OK après branchement extraction

Scénarios manuels recommandés : PDF propre, sans client, TVA, multi-pages, scan, invalide, >15 Mo, 2e essai, mobile, téléchargement.
