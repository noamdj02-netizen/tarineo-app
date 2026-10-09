# Captures film (Playwright)

Génération : `PORT=<port> npm run film:captures` (serveur `npm run dev` + `TARINEO_OPEN_ACCESS=true`).

- 1920×1080, `deviceScaleFactor: 2`, thème clair
- Copilote masqué via `[data-copilot-fab]`
- IDs démo : `GET /api/film/demo-ids`
- Lecture analyse sans PDF : `/devis/analyser?film=lecture`

Liste des fichiers et état : voir `../FILM_FACTS_2.md` §2.
