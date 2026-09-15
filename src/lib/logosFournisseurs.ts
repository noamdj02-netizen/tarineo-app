/** Chemins des logos enseignes dans /public/dashboard (noms normalisés, sans accent). */
export function logoFournisseur(nom: string): string | null {
  const key = nom
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9]/g, "");

  if (key.includes("cedeo")) return "/dashboard/cedeo.png";
  if (key.includes("pointp") || key.includes("point")) return "/dashboard/pointp.png";
  if (key.includes("rexel")) return "/dashboard/rexel.webp";
  if (key.includes("leroymerlin") || key.includes("leroy")) return "/dashboard/leroy-merlin.png";
  if (key.includes("bricodepot") || key.includes("brico")) return "/dashboard/brico-depot.png";
  return null;
}
