import { hash, compare } from "bcryptjs";

const COUT_HASH = 12;
export const LONGUEUR_MIN_MOT_DE_PASSE = 8;

export async function hasherMotDePasse(motDePasse: string): Promise<string> {
  return hash(motDePasse, COUT_HASH);
}

export async function verifierMotDePasse(motDePasse: string, hashStocke: string): Promise<boolean> {
  return compare(motDePasse, hashStocke);
}
