import { EntrepriseForm } from "@/components/metier/entreprise-form";
import { PageHead } from "@/components/shell/page-head";
import { emptyCompany } from "@/lib/metier/company";
import { getCompanyProfile } from "@/lib/metier/queries";
import { getDb } from "@/lib/db";
import { getViewer } from "@/lib/session";

export const metadata = { title: "Mon entreprise" };

export default async function EntreprisePage() {
  const [viewer, profil] = await Promise.all([getViewer(), getCompanyProfile()]);
  const filled = profil ?? emptyCompany(viewer?.email ?? "");
  let logoUrl: string | null = null;
  const db = await getDb();
  if (db && filled.logo_path) {
    const { data } = await db.supabase.storage.from("documents").createSignedUrl(filled.logo_path, 3600);
    logoUrl = data?.signedUrl ?? null;
  }
  return (
    <section className="mx-auto flex max-w-[720px] flex-col gap-8">
      <PageHead
        label="Entreprise"
        title="Mon entreprise"
        crumbs={[
          { href: "/accueil", label: "Accueil" },
          { label: "Mon entreprise" },
        ]}
      >
        Informations reprises sur vos devis, bons et factures PDF.
      </PageHead>
      <EntrepriseForm profil={filled} logoUrl={logoUrl} />
    </section>
  );
}
