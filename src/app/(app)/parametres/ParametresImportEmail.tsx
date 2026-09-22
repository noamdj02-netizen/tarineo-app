import { adresseImportEmail, obtenirOuCreerTokenImportEmail } from "@/lib/importEmail";
import { ParametresImportEmailClient } from "./ParametresImportEmailClient";

export async function ParametresImportEmail({ userId }: { userId: string }) {
  const token = await obtenirOuCreerTokenImportEmail(userId);
  const adresse = adresseImportEmail(token);

  return <ParametresImportEmailClient adresse={adresse} />;
}
