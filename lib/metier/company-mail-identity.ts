import "server-only";
import { formatMailClosing } from "@/lib/metier/mail-closing";
import { getCompanyProfile } from "@/lib/metier/queries";
import { getEntrepriseConfig } from "@/lib/settings/entreprise-config";
import type { EmailSettings } from "@/lib/settings/workspace-settings";

export type CompanyMailIdentity = {
  companyName: string;
  phone: string;
  email: string;
  address: string;
  fromName: string;
  signOff: string;
  signatureText: string;
  logoFromEmailUrl: string;
  /** Bloc complet à appendre en fin de mail texte. */
  closingBlock: string;
};

export { formatMailClosing };

/** Identité mail entreprise (settings.email + profil). */
export async function getCompanyMailIdentity(): Promise<CompanyMailIdentity> {
  const [{ profile, settings }, company] = await Promise.all([
    getEntrepriseConfig(),
    getCompanyProfile(),
  ]);
  const emailSettings: EmailSettings = settings.email;
  const companyName =
    company?.raison_sociale?.trim() || profile?.raison_sociale?.trim() || "L’entreprise";
  const phone = company?.telephone?.trim() || "";
  const email = company?.email_contact?.trim() || "";
  const address = [company?.adresse_rue, company?.adresse_code_postal, company?.adresse_ville]
    .filter(Boolean)
    .join(", ");
  const signOff = emailSettings.signOff.trim() || "Cordialement,";
  const signatureText = emailSettings.signatureText.trim();
  const fromName = emailSettings.fromName.trim();

  return {
    companyName,
    phone,
    email,
    address,
    fromName,
    signOff,
    signatureText,
    logoFromEmailUrl: emailSettings.logoFromEmailUrl.trim(),
    closingBlock: formatMailClosing({
      signOff,
      signatureText,
      companyName,
      phone,
      email,
    }),
  };
}
