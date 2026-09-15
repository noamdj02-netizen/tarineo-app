"use server";

import { z } from "zod";
import { envoyerEmailContactEntreprise } from "@/lib/email";

const schema = z.object({
  nom: z.string().trim().min(1, "Le nom est requis."),
  email: z.string().trim().toLowerCase().email("Adresse email invalide."),
  volume: z.string().trim().min(1, "Merci d'indiquer une taille d'équipe ou un volume estimé."),
  message: z.string().trim().optional(),
  // Honeypot : champ invisible pour un visiteur humain (voir ContactEntrepriseCard.tsx),
  // que la plupart des bots remplissent sans distinction. max(0) le fait échouer dès
  // qu'il contient quoi que ce soit.
  siteWeb: z.string().max(0).optional(),
});

export type ResultatContactEntreprise = { succes: true } | { succes: false; erreur: string };

export async function envoyerDemandeContactEntreprise(formData: FormData): Promise<ResultatContactEntreprise> {
  const parsed = schema.safeParse({
    nom: formData.get("nom"),
    email: formData.get("email"),
    volume: formData.get("volume"),
    message: formData.get("message") ?? "",
    siteWeb: formData.get("siteWeb") ?? "",
  });

  if (!parsed.success) {
    // Honeypot rempli : on répond succès sans envoyer l'email, pour ne pas indiquer au
    // bot que son remplissage a été détecté (plutôt qu'une erreur qui l'inciterait à
    // ajuster son script).
    if (formData.get("siteWeb")) {
      return { succes: true };
    }
    return { succes: false, erreur: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  }

  try {
    await envoyerEmailContactEntreprise({
      nom: parsed.data.nom,
      email: parsed.data.email,
      volume: parsed.data.volume,
      message: parsed.data.message ?? "",
    });
  } catch (e) {
    console.error("Échec de l'envoi de la demande de contact Entreprise :", e);
    return {
      succes: false,
      erreur: "L'envoi a échoué, réessayez ou écrivez-nous directement à contact@tarineo.com.",
    };
  }

  return { succes: true };
}
