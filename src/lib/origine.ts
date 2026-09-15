import { headers } from "next/headers";

// AUTH_URL n'est plus défini (voir src/auth.ts) : on reconstruit l'origine depuis la
// requête en cours, comme Auth.js le fait lui-même en dev. Contrairement à la
// construction d'URL de callback OAuth (gérée en interne par Auth.js), on est ici dans
// notre propre code appelé depuis une Server Action, donc `headers()` reflète bien la
// vraie origine de la requête entrante (Mac en localhost, téléphone en IP réseau...).
export async function origineActuelle(): Promise<string> {
  const liste = await headers();
  const hote = liste.get("x-forwarded-host") ?? liste.get("host") ?? "localhost:3000";
  const protocole = liste.get("x-forwarded-proto") ?? "http";
  return `${protocole}://${hote}`;
}
