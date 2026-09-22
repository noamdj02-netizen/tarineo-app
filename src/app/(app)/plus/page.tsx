import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { MobilePageHeader } from "@/components/tarineo/mobile/MobilePageHeader";
import { MobileMenuRow } from "@/components/tarineo/mobile/MobileMenuRow";

const LIENS = [
  { href: "/devis-clients", title: "Devis clients", description: "Créer, modifier, transformer" },
  { href: "/factures-clients", title: "Factures clients", description: "Depuis vos devis acceptés" },
  { href: "/clients", title: "Clients", description: "Carnet regroupé" },
  { href: "/coffre", title: "Mon coffre", description: "Documents archivés" },
  { href: "/veille", title: "Veille prix", description: "Surveiller vos références" },
  { href: "/chantiers", title: "Chantiers", description: "Marge & suivi" },
  { href: "/analyses", title: "Analyses", description: "Hausses & dépenses" },
  { href: "/parametres", title: "Paramètres", description: "Entreprise, abonnement, équipe" },
];

export default async function PlusPage() {
  const session = await getSession();
  if (!session?.user?.id) redirect("/connexion");

  return (
    <div className="flex flex-col gap-2.5 lg:gap-6">
      <MobilePageHeader title="Plus" />
      <div className="flex flex-col gap-2.5 lg:hidden">
        {LIENS.map((lien) => (
          <MobileMenuRow key={lien.href} {...lien} />
        ))}
      </div>
      <p className="hidden text-sm text-muted-foreground lg:block">
        Sur ordinateur, utilisez le menu latéral pour accéder à ces sections.
      </p>
    </div>
  );
}
