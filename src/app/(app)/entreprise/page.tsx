import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { DOCUMENTS_BUCKET, getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";
import { FormulaireEntreprise } from "./FormulaireEntreprise";
import { MobilePageHeader } from "@/components/tarineo/mobile/MobilePageHeader";

export default async function EntreprisePage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/connexion");
  }

  const profil = await prisma.companyProfile.findUnique({ where: { userId: session.user.id } });

  let logoUrl: string | null = null;
  if (profil?.logoKey && isSupabaseConfigured()) {
    const { data } = await getSupabaseAdmin().storage.from(DOCUMENTS_BUCKET).createSignedUrl(profil.logoKey, 300);
    logoUrl = data?.signedUrl ?? null;
  }

  return (
    <div className="app-page flex flex-col gap-5">
      <MobilePageHeader title="Mon entreprise" subtitle="Profil et mentions légales" backHref="/parametres" />
      <div className="hidden lg:block">
        <h1 className="app-display text-2xl font-semibold text-[var(--foreground)]">Mon entreprise</h1>
        <p className="mt-2 text-muted-foreground">
          Ces informations sont reprises sur chaque devis généré pour vos clients — à renseigner une seule fois.
        </p>
      </div>

      <FormulaireEntreprise
        profil={
          profil
            ? {
                raisonSociale: profil.raisonSociale,
                siret: profil.siret,
                formeJuridique: profil.formeJuridique,
                adresseRue: profil.adresseRue,
                adresseCodePostal: profil.adresseCodePostal,
                adresseVille: profil.adresseVille,
                telephone: profil.telephone,
                emailContact: profil.emailContact,
                regimeTva: profil.regimeTva,
                registreImmatriculation: profil.registreImmatriculation,
                assuranceNom: profil.assuranceNom,
                assuranceAdresse: profil.assuranceAdresse,
                assuranceNumeroContrat: profil.assuranceNumeroContrat,
                assuranceActivitesGaranties: profil.assuranceActivitesGaranties,
                assuranceZoneGeographique: profil.assuranceZoneGeographique,
                margeParDefautPct: Number(profil.margeParDefautPct),
              }
            : null
        }
        logoUrl={logoUrl}
      />
    </div>
  );
}
