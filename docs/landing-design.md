# Landing TARINEO — Direction design v2

Maquette : `docs/landing-mockup/index.html` (HTML statique, mobile-first, ouvrir dans le navigateur).
Code de l'app : NON modifié.

## 1. Audit (landing actuelle)

Constat :
- 12 sections + hero. Trop long : chaque module (devis IA, documents, chantiers, pipeline, copilote) a sa propre section "showcase" lourde, puis une grille de features qui répète les mêmes modules.
- ~36 composants `landing-*.tsx` (3 700 lignes), plusieurs doublons (feature-card / feature-grid / features, steps / step-card / how, showcase / product-showcase).
- Hero : très bien (message clair, marqueur orange, mouvement document→alerte). À garder.
- Preuve : pas de chiffres réels ni témoignages (données fictives marquées "Exemple") → honnête, mais la preuve est faible.
- Tarifs et FAQ : corrects (3 plans, toggle mensuel/annuel, FAQ par onglets).
- Copy centralisée dans `lib/site/tarineo.ts` : bonne pratique, à garder.

## 2. DA : on GARDE celle de Tarinéo (pas Navpit)

Tarinéo a une identité cohérente et déjà codée (`app/globals.css`) :
- Orange `#ff6b1a` + noir + ivoire chaud (`#f7f5f0`, hero `#faf8f4`).
- Inter Tight, mono JetBrains pour les labels, titre avec surlignage "marqueur".
- Boutons pilule, cartes arrondies, ombres douces.
Navpit (autre ADN) créerait une rupture avec l'app. Décision : zéro nouveau token, on réutilise l'existant.

## 3. Nouvelle structure (mobile-first, 9 blocs)

1. Nav sticky : logo + CTA "Commencer".
2. Hero : H1 "Vos fournisseurs augmentent leurs prix. Vous le voyez ?" + CTA unique + "1er mois offert" + carte d'exemple d'alertes (fictive, marquée). Mobile : texte puis carte.
3. Bandeau preuve (4 items) : hausses / devis / chantiers / hébergement France.
4. Problème (fond sombre `#1a100c`, seul contraste fort) : 3 points courts.
5. Comment ça marche : 3 étapes Importer / Analyser / Comparer.
6. Modules : 4 cartes (Devis IA, Documents, Chantiers, Copilote), chacune avec UNE capture réelle de l'app. Remplace les 5 showcases + la grille (-1/3 de scroll).
7. Qui / Pourquoi : fondateur + Alan, vraie photo, vraie citation.
8. Tarifs : Starter 17 / Pro 29 (mis en avant) / Équipe 49, HT, toggle annuel −20 %.
9. FAQ (accordéon, 3 groupes) puis CTA final noir "Construisez mieux." + footer.

Règles :
- Un seul CTA répété : "Essayer TARINEO gratuitement" → /inscription.
- Zéro faux chiffre, zéro faux témoignage. Démos = "Exemple · données fictives".
- Preuve réelle à ajouter dès qu'elle existe (voir §7).

## 4. Tokens (existants, à réutiliser)

Couleurs :
- canvas `--color-landing-canvas` #f7f5f0 · hero #faf8f4 · surface #fff
- ink #0a0a0a · muted #5a5a5a · line rgba(10,10,10,.08)
- orange `--tarineo-orange` #ff6b1a · wash #fff1e8 · texte sur wash #c94f12
- gain #16a34a/#34d399 (OK) · section sombre #1a100c · closer #0a0a0a
Typo :
- Inter Tight 600 titres (tracking −0.03em), 400 texte 18px mobile
- H1 clamp(2.1rem, 7vw, 4.25rem) · H2 clamp(1.7rem, 4.5vw, 2.75rem)
- Eyebrow 11px caps 0.18em (orange) · labels mono 11px
Espacement : base 8px · sections 72px mobile / 112px desktop · conteneur 1200px, marges 20px.
Rayons : carte 20px · boutons/badges pilule · contrôle 10px.
Ombre CTA : `--shadow-landing-cta`.
Cible tactile : ≥ 56px CTA, ≥ 44px le reste.

## 5. Animations

- Reveal : fade + translateY 16px, 600ms, `cubic-bezier(.2,.8,.2,1)`, une fois à l'entrée (déjà : `Reveal`/`InView`).
- Marqueur du H1 : scaleX 0→1 (déjà : `HeroHeadline`).
- Hero : document → alerte (déjà : `HeroDocumentFlow`).
- Hover CTA : translateY −2px, 200ms.
- Tout coupé avec `prefers-reduced-motion`.
- Pas de parallax, pas de glow, pas de dégradé violet.

## 6. Spec section par section

Hero : grille 1 col mobile ; 0.42fr/0.58fr dès 900px. CTA pleine largeur mobile. Carte alertes : 3 lignes (produit, fournisseur, ancien→nouveau prix, pastille % orange wash).
Preuve : 2×2 mobile, 4 colonnes desktop, filet haut.
Problème : 3 cartes sombres, numéros mono orange.
Étapes : 3 cartes 1 col → 3 col. Option : ligne de liaison orange desktop.
Modules : 1 col → 2×2. Carte = label mono + titre + 1 phrase + capture app (ratio 16/10, rayon 12px).
Qui : photo ronde 96px + citation + "Ancien des Travaux Publics".
Tarifs : cartes empilées mobile avec Pro en premier ; bordure orange 2px sur Pro + badge "Le plus choisi". Fonctionnalités "bientôt" marquées en gris.
FAQ : accordéon, 1er ouvert, lignes `--line`, max 760px.
Closer : fond noir, H2 centré, CTA orange.

## 7. Mapping vers le code (pour dev-front)

- Garder : `lib/site/tarineo.ts`, hero/*, `landing-button`, `landing-pricing`, `faq`, `reveal`.
- Fusionner/supprimer : showcases devis-ia/documents/chantiers/pipeline/copilote → un seul `landing-modules.tsx` ; doublons feature-card/grid/features, step-card/steps/how.
- Ajouter : `landing-problem` (existe, restyler sombre), `landing-founder` (vraie photo).
- Perf : pas de vidéo hero, images `webp`, sections sous le fold en `Deferred` (déjà fait).

## 8. À valider par Noam / Alan

- Structure 9 blocs OK ?
- Section sombre "Problème" : OK ?
- Preuve : photo fondateur, 1-2 vrais témoignages d'artisans, logos fournisseurs (mention "sans partenariat").
- Captures réelles de l'app pour les 4 modules.
