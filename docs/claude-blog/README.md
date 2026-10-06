# claude-blog sur Tarineo

Suite [claude-blog](https://github.com/AgriciDaniel/claude-blog) (MIT) pour rédiger, auditer et optimiser les articles du blog marketing.

## Installation (une fois)

```bash
chmod +x scripts/install-claude-blog.sh
./scripts/install-claude-blog.sh
```

Cela :

1. Clone `vendor/claude-blog` (tag `v2.2.0` par défaut).
2. Lance l’installer officiel vers `~/.claude/` (Claude Code).
3. Copie les skills `blog` et `blog-*` dans `.cursor/skills/` (local, gitignored).
4. Installe le skill projet **`tarineo-blog`** (règles Next.js + `lib/site/blog/`).

Prérequis optionnels : Python 3.11+ et `pip install -r vendor/claude-blog/requirements.txt` pour les scripts de score / preflight.

## Utilisation dans Cursor

- Nouvel article : « Rédige un article blog plombier avec tarineo-blog ».
- Audit SEO : lire `blog-analyze` ou demander une relecture selon le contrat 5 gates (résumé dans `tarineo-blog`).
- Marque : `branding/BRAND.md`, `branding/VOICE.md` (chargés par les workflows claude-blog).

## Où vont les articles

Les posts publiés restent dans le code Tarineo :

- Données : `lib/site/blog/posts.ts`, `lib/site/blog/metier-hubs.ts`
- Idées futures : `lib/site/blog/content-ideas.ts`
- Dernier audit SEO : `docs/claude-blog/seo-audit.md`
- Pages : `app/(site)/blog/`, hubs `/blog/metier/[metierSlug]`
- SEO : `app/sitemap.ts`, `lib/seo/json-ld.ts`

Ne pas inventer de stats ; ton BTP français, pas de mention Cedéo sur la landing (voir skill tarineo-blog).

## Licence

claude-blog est sous MIT ; voir `vendor/claude-blog/LICENSE` après install.
