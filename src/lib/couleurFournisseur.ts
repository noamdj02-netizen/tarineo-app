const PALETTE = [
  "#1e3a6e",
  "#ec5821",
  "#1d4ed8",
  "#15803d",
  "#be185d",
  "#7c3aed",
  "#0d9488",
  "#b45309",
];

function hashChaine(valeur: string): number {
  let h = 0;
  for (let i = 0; i < valeur.length; i++) {
    h = (h << 5) - h + valeur.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

/** Couleur d'avatar déterministe pour un fournisseur (design mobile Figma). */
export function couleurFournisseur(nom: string, norm?: string | null): string {
  const cle = (norm ?? nom).trim() || nom;
  return PALETTE[hashChaine(cle) % PALETTE.length];
}
