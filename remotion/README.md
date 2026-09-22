# Tarineo — Vidéo promo Remotion

Vidéo motion design 30 s présentant Tarineo (1920×1080 et 1080×1920).

## Scènes

1. **Intro** — Logo, tagline, enseignes (Cedeo, Point P…)
2. **Problème** — Impact des hausses silencieuses sur la marge
3. **Documents** — Page réelle `Devis fournisseurs` (QuotaStrip, En bref, liste)
4. **Analyse IA** — Page détail document (`BandeauAnalyseIA`, cartes lignes avec alertes)
5. **Accueil** — Dashboard réel (stats, fournisseurs, documents récents)
6. **Devis clients** — Page facturation (stats + tableau)
7. **Outro** — CTA essai gratuit

Les frames UI reprennent `AppShell`, les tokens `globals.css` et les composants shadcn (Card, Badge…) via `src/ui/primitives.tsx`.

## Commandes

```bash
cd remotion
npm install
npm run studio      # Prévisualiser dans Remotion Studio (port 3000)
npm run render      # Exporter → out/tarineo-promo.mp4
npm run render:hq   # Export haute qualité
```

## Formats

| Composition | Dimensions | Usage |
|---|---|---|
| `TarineoPromo` | 1920×1080 | Site, YouTube, LinkedIn |
| `TarineoPromoVertical` | 1080×1920 | Instagram, TikTok, Stories |
