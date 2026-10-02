import { SettingsChrome } from "@/components/settings/settings-nav";
import { PageHead } from "@/components/shell/page-head";
import { getEntrepriseConfig } from "@/lib/settings/entreprise-config";

export const metadata = { title: "Paramètres" };

export default async function ParametresLayout({ children }: { children: React.ReactNode }) {
  const { role } = await getEntrepriseConfig();

  return (
    <section className="mx-auto flex w-full max-w-[1080px] flex-col gap-6">
      <PageHead
        label="Paramètres"
        title="Paramètres"
        crumbs={[
          { href: "/accueil", label: "Accueil" },
          { href: "/parametres", label: "Paramètres" },
        ]}
      >
        Configurez TARINEO pour votre entreprise et vos préférences personnelles.
      </PageHead>

      <SettingsChrome role={role}>{children}</SettingsChrome>
    </section>
  );
}
