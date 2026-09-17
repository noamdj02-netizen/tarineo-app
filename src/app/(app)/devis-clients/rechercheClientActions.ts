"use server";

import { auth } from "@/auth";
import { rechercherClients, type ResultatsRechercheClient, type SourceClient } from "@/lib/rechercheClient";

export type ResultatRechercheClients =
  | { succes: true; resultats: ResultatsRechercheClient }
  | { succes: false; erreur: string };

export async function rechercherClientsAction(
  query: string,
  source?: SourceClient
): Promise<ResultatRechercheClients> {
  const session = await auth();
  if (!session?.user?.id) {
    return { succes: false, erreur: "Non authentifié." };
  }

  const resultats = await rechercherClients(session.user.id, query, source);
  return { succes: true, resultats };
}
