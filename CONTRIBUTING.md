# Contribuer à Tarineo (Noam & Allan)

Dépôt : **https://github.com/noamdj02-netizen/tarineo-app**

| Branche | Rôle |
|---------|------|
| `main` | Version stable (production / Vercel). **Ne pas pousser directement.** |
| `noam` | Travail quotidien de Noam |
| `allan` | Travail quotidien d'Allan |

Flux : **Cursor → branche perso → commit → push → Pull Request → review → `main` → Vercel**

---

## Avant de coder (chaque session)

### Noam

```bash
git checkout main
git pull origin main
git checkout noam
git merge main
```

### Allan

```bash
git checkout main
git pull origin main
git checkout allan
git merge main
```

En cas de conflit au `merge main` : ne pas deviner — en parler et résoudre ensemble (voir section Conflits).

---

## Pendant le travail

Travailler **uniquement** sur sa branche (`noam` ou `allan`), jamais sur `main`.

```bash
git status          # vérifier la branche
# … modifications dans Cursor …
git add <fichiers>  # ou git add . si tu sais ce que tu inclus
git commit -m "Description claire en français"
git push origin noam   # ou origin allan
```

---

## Intégrer une fonctionnalité dans `main`

1. Synchroniser sa branche avec `main` (commandes ci-dessus).
2. Tester en local : `npm run dev` (et `npm run build` avant une grosse PR).
3. Sur GitHub : **New Pull Request**  
   - `noam` → `main` ou `allan` → `main`
4. Décrire ce qui change et comment tester.
5. L’autre relit, approuve, merge (pas de merge automatique si gros conflits métier).

---

## Règles pour éviter de s’écraser

1. Ne **jamais** travailler directement sur `main`.
2. Toujours `git pull origin main` avant de commencer.
3. Commits **petits** et messages **explicites**.
4. Éviter de modifier en parallèle les mêmes gros fichiers sans se coordonner (`prisma/schema.prisma`, `package-lock.json`, refontes navigation).
5. Se prévenir quand une feature touche auth, Stripe, Prisma ou l’import documents.
6. **Jamais** `git push --force` sur `main` (ni sur la branche de l’autre).
7. **Jamais** committer `.env`, `.env.local`, clés API, tokens.
8. Avant une PR : `git merge main` sur sa branche et retester.
9. Tester avant de demander le merge.
10. En cas de doute sur un conflit : pause, capture `git status` / les deux versions, décision à deux.

---

## Secrets et environnement

- Fichiers locaux (ignorés par Git) : `.env`, `.env.local`
- Modèle sans secrets : `.env.example` — copier vers `.env` et remplir chez soi.
- Vercel / Supabase / Stripe : secrets dans les dashboards respectifs, pas dans le repo.

---

## Premier clone (Allan)

```bash
git clone https://github.com/noamdj02-netizen/tarineo-app.git
cd tarineo-app
cp .env.example .env
# remplir .env (Noam t’envoie les valeurs par un canal sécurisé, pas par GitHub)
npm install
npx prisma generate
git checkout allan
git pull origin allan
```

Si la branche `allan` n’existe pas encore sur le remote :

```bash
git checkout -b allan origin/main
git push -u origin allan
```

---

## Conflits Git

Si Git marque un conflit :

```text
<<<<<<< HEAD   (ta version, "ours" sur ta branche)
=======
>>>>>>> main   (ou l’autre branche, "theirs")
```

1. Ouvrir le fichier, comprendre les deux blocs.
2. Fusionner à la main ou choisir avec accord.
3. `git add <fichier>` puis `git commit` (merge) ou continuer le rebase si utilisé.

Ne pas utiliser `git checkout --theirs` / `--ours` sur tout le projet sans lecture.

---

## Protection de `main` (GitHub — à faire par un admin du repo)

Chemin recommandé :

```text
GitHub → noamdj02-netizen/tarineo-app → Settings → Branches → Add branch protection rule
```

- Branch name pattern : `main`
- ☑ Require a pull request before merging
- ☑ Require approvals (1)
- ☑ Do not allow bypassing the above settings (selon votre plan GitHub)
- Optionnel : Require status checks (CI / Vercel) quand un check existe

---

## Cursor

- Ouvrir le **même** dossier cloné depuis GitHub (pas deux copies « projet copié » sans remote).
- Vérifier en bas de l’IDE / terminal : branche `noam` ou `allan`, pas `main`.
- L’agent IA peut committer : relire `git diff` avant tout push.
