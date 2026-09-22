import type { Metadata } from "next";
import { auth } from "@/auth";
import { HubLegal } from "@/components/tarineo/ContenuLegal";

export const metadata: Metadata = {
  title: "Informations légales — Tarineo",
  description: "Politique de confidentialité, CGU, CGV et mentions légales de Tarineo.",
};

export default async function LegalHubPage() {
  const session = await auth();
  return (
    <HubLegal
      backHref={session?.user?.id ? "/compte" : undefined}
      backLabel={session?.user?.id ? "Mon compte" : undefined}
    />
  );
}
