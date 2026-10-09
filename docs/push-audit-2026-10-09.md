# TARINEO — Audit global pré-push (2026-10-09)

> **Branche :** `preview/alan-devis` → tracking `tarineo/preview/alan-devis`  
> **HEAD :** `3683fa0` — Fix blog JSX lint for Vercel build.  
> **Verdict push (après ménage 2026-10-09) :** **GO conditionnel** — `.gitignore` caches/`recordly`/doublons, Accueil distillé, 143 doublons Finder supprimés, `tsc` OK.  
> **Reste :** stage ciblé + commit (pas `git add .`) ; migrations ; smoke ; lint CI.

Réf. UI détaillée : [`docs/app-ui-audit-2026-10-09.md`](./app-ui-audit-2026-10-09.md) · critique Accueil `.impeccable/critique/2026-10-09T12-32-19Z__app-app-accueil-page-tsx.md`

---

## Scoreboard gate

| Gate | Résultat | Note |
|------|----------|------|
| Typecheck (`tsc --noEmit`) | **PASS** | Exit 0 |
| Tests métier ciblés (26) | **PASS** | spend, signature, delivery, prior-prices, assess-recap, workspace-settings… |
| Lint full (`npm run lint`) | **INCONNU / HANG** | ESLint sans sortie après &gt;2 min — ne pas bloquer sur silence ; relancer ciblé ou CI |
| Secrets | **PASS** | `.env.local` gitignored ; seul `.env.example` modifié (placeholders) |
| Migrations présentes | **PASS** | `20261007160000_rls_…`, `20261009140000_parties_contacts.sql` (untracked → à inclure) |
| Working tree propre | **FAIL** | ~365 chemins dirty ; **143** doublons `* 2.*` ; caches `.next-*` ; `recordly/` **2.1 Go** |
| Asset landing film | **ATTENTION** | `public/landing/produit-demo.mp4` **~12 Mo** — OK pour preview, lourd pour GitHub |

**Verdict :** ne pas `git add .` / `git push` sans filtre. Après exclusion des artefacts, le delta produit est pushable vers `preview/alan-devis`.

---

## À EXCLURE du push (bloquant)

| Chemin | Raison |
|--------|--------|
| `.next-build-test/`, `.next-dev-test/`, `.next-dev-turbo/`, `.next-dev-turbo2/`, `.next-dev-warm/` | Caches de build locaux — ajouter à `.gitignore` |
| `.tmp/` | Scratch local |
| `recordly/` (**2.1 Go**) | App / capture locale — **jamais** dans le repo |
| `public/**/* 2.*`, `docs/** 2.md`, `scripts/** 2.*`, `remotion/** 2.*`, etc. (**~143**) | Doublons Finder macOS |
| `.impeccable/` | Optionnel local ; OK à committer seulement si voulu pour polish |

**Action recommandée :**

```bash
# 1) Ignorer caches + recordly
# 2) Ne jamais git add les "* 2.*"
# 3) Stage ciblé (app/components/lib/supabase/migrations + assets voulus)
```

Compléter `.gitignore` :

```
/.next-dev*/
/.next-build-test/
/.tmp/
/recordly/
```

---

## À INCLURE (delta produit pertinent)

### Features / métier
- Création devis manuelle : `devis-create-form.tsx`, `createManualDevisAction`, hub manual
- Objectifs fournisseurs mois/année + jauges : `supplier-spend*`, `distributor-goals-form`, `fournisseurs/page`
- Signature mail IA : `email-signature-*`, panel entreprise, wire mails
- Contact fournisseur / delivery / renegotiate / densify recap (fichiers metier + pieces)
- Migrations RLS + `parties` contacts

### Marketing / landing
- Landing v2 sections (Hero, Journey, Proof, Terrain, film `#produit`…)
- `produit-demo.mp4` + poster (12 Mo) — décider si LFS / CDN ou commit direct
- `.env.example` Resend / secrets docs (pas de secrets réels)

### Onboarding
- Wizard allégé (screens Navpit-era supprimés), PDF step, banner

### Docs audit
- `docs/app-ui-audit-2026-10-09.md`, `docs/push-audit-2026-10-09.md`
- Optionnel : `docs/tarineo-rls-security-audit.md`, `docs/film/`

---

## Risques push

| Risque | Sévérité | Mitigation |
|--------|----------|------------|
| Commit accidentel `recordly/` ou caches | **P0** | `.gitignore` + stage manuel |
| 143 doublons `* 2.*` | **P0** | `scripts/remove-finder-duplicates.mjs` ou exclude |
| Film 12 Mo dans git | **P1** | Accepter pour preview, ou Git LFS / asset externe |
| Migrations untracked non appliquées en prod | **P1** | Inclure + `supabase db push` / pipeline |
| Lint hang local | **P2** | CI Vercel / `eslint` scoped ; élargir ignore |
| Accueil UX warehouse (24/40) | **P2 produit** | Non bloquant preview ; backlog distill |

---

## Checklist avant `git push`

- [ ] Mettre à jour `.gitignore` (`.next-dev*`, `.tmp`, `recordly`)
- [ ] Ne pas stage les `* 2.*` ni `recordly/` ni `.next-*`
- [ ] Stage migrations `20261007*` + `20261009*`
- [ ] Stage code métier + landing voulue + `produit-demo*` (si décidé)
- [ ] `npm run typecheck` (déjà PASS)
- [ ] Relancer tests ciblés (déjà PASS 26/26)
- [ ] Smoke local `/accueil`, `/devis/nouveau`, `/fournisseurs`, `/` `#produit`
- [ ] Confirmer remote : `tarineo/preview/alan-devis` (pas `main` accidentel)
- [ ] **Ne pas force-push**

---

## Commandes stage suggérées (après ignore)

```bash
git add .env.example \
  app/ components/ lib/ \
  supabase/migrations/20261007160000_rls_hardening_legacy_and_backend_only.sql \
  supabase/migrations/20261009140000_parties_contacts.sql \
  public/landing/produit-demo.mp4 \
  public/landing/produit-demo-poster.jpg \
  styles/landing-v2.css next.config.ts package.json tsconfig.json \
  docs/app-ui-audit-2026-10-09.md docs/push-audit-2026-10-09.md \
  PRODUCT.md DESIGN.md

# Vérifier : aucun path " 2." / recordly / .next-
git status
```

Puis commit + push **uniquement si demandé**.

---

## UI (rappel Accueil)

| Score | Bande |
|------:|-------|
| UX 24/40 | Acceptable |
| Tech UI 10/20 | Acceptable |

P0 Accueil (dual h1, warehouse insights) = dette post-push preview OK, pas de blocker build.

---

*Audit généré le 2026-10-09 — sauvegarde pour le push `preview/alan-devis`.*
