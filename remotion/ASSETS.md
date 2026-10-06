# Médias Remotion — TARINEO

Inventaire des fichiers à fournir à Remotion (Studio / render).  
Tout est servi depuis le dossier **`public/`** du repo Next.js via `staticFile("…")` (racine = `public/`).

**Composition marketing canonique :** `TarineoTemplate-4K` (`remotion/template/`, ~25 s, 3840×2160).  
**Preview :** `npm run remotion` → ouvrir `TarineoTemplate-4K`.  
**Export :** `npm run remotion:render` → `out/tarineo-template-4k.mp4`.

---

## Dossier à copier tel quel (minimum)

Pour un projet Remotion autonome, copier ces arborescences dans `public/` :

```
public/brand/
public/illustrations/tarineo-hd/
public/illustrations/mascots/          # optionnel (landing app, pas le template HD)
public/remotion-audio/                   # compare showreel + SFX
public/landing/                          # optionnel (hero site, témoignages)
public/videos/                           # optionnel (product.mp4, etc.)
```

**Source Figma mascottes HD :** [Tarineo — Mascottes Originaux HD](https://www.figma.com/design/TvO91gJNuCUY5YJ7X52FTY/Tarineo) (réf. `lib/tarineo-hd-mascots.ts`).

**Polices :** chargées via `@remotion/google-fonts` — **Inter Tight** + **JetBrains Mono** (`remotion/fonts.ts`), pas de fichiers locaux.

---

## Logos & marque (`public/brand/`)

| Fichier | Usage Remotion | `staticFile()` |
|--------|----------------|----------------|
| `tarineo-mark.png` | Icône seule (pill Unlock, compare) | `brand/tarineo-mark.png` |
| `tarineo-logo-light.png` | Logo complet sur fond clair | `brand/tarineo-logo-light.png` |
| `tarineo-logo-dark.png` | Logo sur fond sombre | `brand/tarineo-logo-dark.png` |
| `tarineo-logo.png` | Variante générique | `brand/tarineo-logo.png` |
| `tarineo-logo-source.png` | Master / export (pas utilisé en runtime) | — |
| `navpit-mascot.jpg` | Legacy Navpit (hors template canon) | `brand/navpit-mascot.jpg` |
| `favicon/*` | PWA uniquement | — |

**Composant :** `remotion/components/TarineoLogoMark.tsx` — props `variant`: `mark` | `light` | `dark`.

---

## Mascottes 3D HD (`public/illustrations/tarineo-hd/`)

PNG fond transparent, ~1200–1500 px. Utilisées par `HdMascot` dans `remotion/product-v2/ui.tsx` :

`staticFile(\`illustrations/tarineo-hd/${pose}.png\`)`

| Fichier | Clé `pose` | Label |
|---------|------------|--------|
| `01-pouce-leve.png` | `01-pouce-leve` | Pouce levé |
| `02-clin-oeil.png` | `02-clin-oeil` | Clin d’œil |
| `03-salut.png` | `03-salut` | Salut |
| `04-coucou.png` | `04-coucou` | Coucou |
| `05-bras-croises.png` | `05-bras-croises` | Bras croisés |
| `06-loupe.png` | `06-loupe` | Loupe |
| `07-ordinateur.png` | `07-ordinateur` | Ordinateur |
| `08-pouce-ordi.png` | `08-pouce-ordi` | Pouce et ordinateur |
| `09-devis-valide.png` | `09-devis-valide` | Devis validé |
| `10-chrono.png` | `10-chrono` | Chrono |
| `11-equipe.png` | `11-equipe` | Équipe |
| `12-erreur-404.png` | `12-erreur-404` | Erreur 404 |
| `13-pancarte.png` | `13-pancarte` | Pancarte |
| `14-bulle.png` | `14-bulle` | Bulle |
| `15-coucou-bord.png` | `15-coucou-bord` | Coucou au bord |

**Utilisées dans les vidéos :**

| Composition / scène | Poses |
|---------------------|--------|
| Product V2 — Dashboard | `01-pouce-leve` |
| Product V2 — Métiers | `06-loupe` |
| Product V2 — Analyse | `09-devis-valide` |
| Product V2 — Copilote | `03-salut` |
| Template — Prompt (assistant) | `07-ordinateur` (analyse devis) |

---

## Mascottes 2D / landing (`public/illustrations/mascots/`)

Série **01–16** (PNG). Utilisées sur le **site Next.js** (`lib/mascots.ts`), pas dans le template 4K actuel.

| Fichier |
|---------|
| `01-ordi-check.png` … `16-presentation-graph.png` |

Ex. `06-casque-focus.png` = série mascots, **pas** dans `tarineo-hd/`.

---

## Photos & vidéos landing (`public/landing/`)

| Fichier | Usage |
|---------|--------|
| `hero.mp4`, `hero.webm` | Hero site |
| `hero-poster.webp`, `hero-poster-mobile.webp`, `hero-motion-poster.jpg` | Posters |
| `hero-motion.mp4` | Motion hero |
| `testimonials/ines.jpg` | Témoignage |
| `testimonials/lea.jpg` | Témoignage |
| `testimonials/karim.jpg` | Témoignage |
| `testimonials/marcus.jpg` | Témoignage |
| `testimonials/noam.jpg` | Témoignage |
| `testimonials/sarah.jpg` | Témoignage |

Le **template marketing** n’utilise plus de photos portraits : les scènes Devis / Mutate sont des **mocks document** (`DevisDocMock`, React).

---

## Vidéos produit (`public/videos/`)

| Fichier | Usage |
|---------|--------|
| `product.mp4` | Démo produit site |
| `product-poster.jpg` | Poster |
| `launch-poster.jpg` | Promo launch |

---

## Audio Remotion (`public/remotion-audio/`)

| Fichier | Usage |
|---------|--------|
| `bed.mp3` | Musique de fond compare showreel |
| `sfx-whoosh.mp3` | Transition |
| `sfx-pop.mp3` | UI pop |
| `sfx-tick.mp3` | Tick |
| `sfx-lock.mp3` | Verrouillage |

**Composant :** `remotion/compare-showreel/Soundtrack.tsx` (`TarineoCompareShowreel`).

---

## Compositions & médias raster

| ID composition | Médias fichiers |
|----------------|-----------------|
| **TarineoTemplate-4K** | Logos (`TarineoLogoMark`, `PillLogoBtn`) ; UI React (pas de photos) ; mascotte `07-ordinateur` (Prompt) |
| **TarineoProductV2** (si utilisé) | Logos + mascottes HD (tableau ci-dessus) |
| **TarineoCompareShowreel** | Logos + audio `remotion-audio/*` ; UI embeds |
| **TarineoExplainer** | Logos |
| **TarineoDashboard** (dashboard-motion) | Logos |

---

## Archive rapide (ligne de commande)

Depuis la racine du repo :

```bash
zip -r tarineo-remotion-medias.zip \
  public/brand \
  public/illustrations/tarineo-hd \
  public/illustrations/mascots \
  public/remotion-audio \
  public/landing \
  public/videos \
  remotion/ASSETS.md
```

---

## Checklist avant render

- [ ] `public/brand/tarineo-mark.png` et logos light/dark présents
- [ ] Les 15 PNG `public/illustrations/tarineo-hd/*.png` présents
- [ ] Pour le compare : les 5 MP3 dans `public/remotion-audio/`
- [ ] `npm run remotion` — composition `TarineoTemplate-4K` sans erreur `staticFile`

Dernière mise à jour : alignée sur le repo Tarineo (template ~25 s, mocks devis).
