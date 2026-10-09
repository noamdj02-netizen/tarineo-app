import "server-only";
import { getCompanyProfile } from "@/lib/metier/queries";
import { siretValide } from "@/lib/metier/company";

const MESSAGE =
  "Renseignez votre entreprise (raison sociale et SIRET valide) dans Paramètres → Entreprise avant d’émettre une pièce client.";

/** Blocage légal / PDF client : profil entreprise complet. */
export async function assertCompanyProfileReady(): Promise<{ ok: true } | { ok: false; error: string }> {
  const profile = await getCompanyProfile();
  if (!profile?.raison_sociale?.trim() || !siretValide(profile.siret)) {
    return { ok: false, error: MESSAGE };
  }
  return { ok: true };
}
