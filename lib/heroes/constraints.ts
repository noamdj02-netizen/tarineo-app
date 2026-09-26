import type { HeroVariable } from "./types";

export const HERO_CONSTRAINTS = `CONTRAINTES OBLIGATOIRES
- React 18+ / Next.js App Router, TypeScript, Tailwind.
- 3D : three + @react-three/fiber + @react-three/drei. Animation : GSAP ou framer-motion.
- Composant "use client", chargé en dynamic import sans SSR pour le canvas.
- Le hero EST l'image. Photo ou produit plein cadre ({{MISE}} = product | overlay). Nav fine en overlay, pas un split texte/petite photo.
- {{URL_PORTRAIT}} obligatoire visuellement : personne, produit isolé, ou paysage. Jamais un mesh vide, jamais un faux dashboard en divs.
- Palette unique. Interdit : crème + bronze + espresso, violet IA, Inter sur void noir.
- Police : grotesk (Inter Tight ou Space Grotesk), pas de serif par défaut.
- Performance : canvas hors écran en pause, DPR ≤ 2, mobile allégé, 60 fps visés.
- Accessibilité : prefers-reduced-motion statique, vrai <h1>, contraste ≥ 4.5, focus visible.
- Hauteur : min-h-[100dvh] desktop.
- Tout se règle via {{...}}.
Création ORIGINALE : ne reproduis pas un site existant.`;

export const HERO_CHECKLIST = `CHECKLIST AVANT DE LIVRER
- [ ] Un seul composant React autonome + fallbacks
- [ ] Nav + h1 + CTA + preuve + photo réelle
- [ ] Toutes les {{VARIABLES}} changent vraiment le rendu
- [ ] Version mobile OK, version prefers-reduced-motion OK
- [ ] Contraste ≥ 4.5, focus visible
- [ ] Canvas en pause hors écran, DPR ≤ 2
- [ ] Aucun asset externe obligatoire hors {{URL_PORTRAIT}} / vidéo`;

export type BrandInput = {
  marque: string;
  titre: string;
  sous: string;
  cta1: string;
  cta2: string;
  fond: string;
  accent: string;
  texte: string;
  police: string;
  photo: string;
  preuve: string;
  mise: "product" | "overlay";
};

export function brandVars(b: BrandInput, extra: HeroVariable[] = []): HeroVariable[] {
  return [
    { key: "MARQUE", label: "Marque", type: "texte", defaut: b.marque },
    { key: "TITRE", label: "Titre", type: "texte", defaut: b.titre },
    { key: "SOUS_TITRE", label: "Sous-titre", type: "texte", defaut: b.sous },
    { key: "CTA_PRINCIPAL", label: "CTA principal", type: "texte", defaut: b.cta1 },
    { key: "CTA_SECONDAIRE", label: "CTA secondaire", type: "texte", defaut: b.cta2 },
    { key: "COULEUR_FOND", label: "Fond", type: "couleur", defaut: b.fond },
    { key: "COULEUR_ACCENT", label: "Accent", type: "couleur", defaut: b.accent },
    { key: "COULEUR_TEXTE", label: "Texte", type: "couleur", defaut: b.texte },
    { key: "POLICE_TITRE", label: "Police titre", type: "texte", defaut: b.police },
    { key: "URL_PORTRAIT", label: "Photo (personne ou produit)", type: "url", defaut: b.photo },
    { key: "PREUVE", label: "Preuve sociale", type: "texte", defaut: b.preuve },
    { key: "MISE", label: "Mise (product / overlay)", type: "texte", defaut: b.mise },
    ...extra,
  ];
}

export function wrapHeroPrompt(brief: string) {
  return `Tu construis UNE landing above-the-fold originale pour mon produit. En cinq minutes elle doit être prête à publier.

${brief}

${HERO_CONSTRAINTS}

${HERO_CHECKLIST}`;
}
