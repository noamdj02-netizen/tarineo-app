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
      <PageHead mascot="05-bras-croises" label="Entreprise" title="Vos mentions," tail="sur chaque PDF.">
        SIRET, TVA, logo, décennale. Alan les avait déjà prévues : elles se recopient sur devis, bon et facture.
      </PageHead>
      <EntrepriseForm profil={filled} logoUrl={logoUrl} />
    </section>
  );
}
