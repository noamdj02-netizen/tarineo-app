import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { DOCUMENTS_BUCKET, getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";
import { FormulaireEntreprise } from "../entreprise/FormulaireEntreprise";
import { PageHeader, PageCard } from "@/components/tarineo/PageHeader";
import { PageTabs } from "@/components/tarineo/PageTabs";
import Link from "next/link";

export default async function ParametresPage({ searchParams }: { searchParams: Promise<{ onglet?: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/connexion");
  const { onglet = "profil" } = await searchParams;

  let profil = null;
  let dbIndisponible = false;
  try {
    profil = await prisma.companyProfile.findUnique({ where: { userId: session.user.id } });
  } catch {
    dbIndisponible = true;
  }
  let logoUrl: string | null = null;
  if (profil?.logoKey && isSupabaseConfigured()) {
    try {
      const { data } = await getSupabaseAdmin().storage.from(DOCUMENTS_BUCKET).createSignedUrl(profil.logoKey, 300);
      logoUrl = data?.signedUrl ?? null;
    } catch {
      logoUrl = null;
    }
  }

  return (
    <div>
      <PageHeader title="Paramètres" subtitle="Gérez vos informations et préférences." />
      <div className="mb-5">
        <PageTabs
          actif={onglet}
          items={[
            { id: "profil", label: "Profil entreprise", href: "/parametres" },
            { id: "abonnement", label: "Abonnement", href: "/parametres?onglet=abonnement" },
            { id: "notifications", label: "Notifications", href: "/parametres?onglet=notifications" },
            { id: "equipe", label: "Équipe", href: "/parametres?onglet=equipe" },
            { id: "integrations", label: "Intégrations", href: "/parametres?onglet=integrations" },
          ]}
        />
      </div>
      {onglet === "profil" && (
        <PageCard>
          {dbIndisponible && (
            <p className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              Connexion à la base de données impossible pour le moment. Vous pouvez consulter la page, mais l&apos;enregistrement ne fonctionnera pas tant que la base n&apos;est pas accessible.
            </p>
          )}
          <h2 className="mb-1 text-base font-semibold">Informations de l&apos;entreprise</h2>
          <p className="mb-6 text-sm text-muted-foreground">Raison sociale, SIRET, adresse, téléphone, email et logo.</p>
          <FormulaireEntreprise
            variant="settings"
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
                    website: profil.website,
                    nomCommercial: profil.nomCommercial,
                    numeroTva: profil.numeroTva,
                    iban: profil.iban,
                    capitalSocial: profil.capitalSocial,
                    activite: profil.activite,
                    activiteDescription: profil.activiteDescription,
                    couleurPrimaire: profil.couleurPrimaire,
                    couleurSecondaire: profil.couleurSecondaire,
                    conditionsPaiementDefaut: profil.conditionsPaiementDefaut,
                    mentionsLegales: profil.mentionsLegales,
                  }
                : null
            }
            logoUrl={logoUrl}
          />
        </PageCard>
      )}
      {onglet === "abonnement" && (
        <PageCard>
          <p className="text-sm text-muted-foreground">Gérez votre offre depuis la page compte.</p>
          <Link href="/compte" className="mt-4 inline-flex h-11 items-center rounded-full bg-primary px-5 text-sm text-white">
            Ouvrir mon compte
          </Link>
        </PageCard>
      )}
      {(onglet === "notifications" || onglet === "equipe" || onglet === "integrations") && (
        <PageCard>
          <p className="text-sm text-muted-foreground">Cette section arrive avec l&apos;offre Pro.</p>
        </PageCard>
      )}
    </div>
  );
}
