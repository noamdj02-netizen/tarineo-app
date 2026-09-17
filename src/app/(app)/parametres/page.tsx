import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { DOCUMENTS_BUCKET, getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";
import { FormulaireEntreprise } from "../entreprise/FormulaireEntreprise";
import { PageHeader, PageCard } from "@/components/tarineo/PageHeader";
import { PageTabs } from "@/components/tarineo/PageTabs";
import { ParametresAbonnement } from "./ParametresAbonnement";
import { ParametresIntegrations } from "./ParametresIntegrations";
import { EcranPaiementRequis } from "../documents/EcranPaiementRequis";
import { planStripeValide } from "@/lib/plansStripe";
import Link from "next/link";

export default async function ParametresPage({
  searchParams,
}: {
  searchParams: Promise<{ onglet?: string; plan?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/connexion");
  const { onglet = "profil", plan: planQuery } = await searchParams;
  const planSelectionne = planStripeValide(planQuery);

  let profil = null;
  let planActuel: string | null = null;
  let subscriptionStatus: string | null = null;
  let aCompteStripe = false;
  let dbIndisponible = false;
  try {
    const [profilRow, userRow] = await Promise.all([
      prisma.companyProfile.findUnique({ where: { userId: session.user.id } }),
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: { plan: true, subscriptionStatus: true, stripeCustomerId: true },
      }),
    ]);
    profil = profilRow;
    planActuel = userRow?.plan ?? null;
    subscriptionStatus = userRow?.subscriptionStatus ?? null;
    aCompteStripe = Boolean(userRow?.stripeCustomerId);
  } catch {
    dbIndisponible = true;
  }
  const abonnementActif = subscriptionStatus === "active";
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
                  }
                : null
            }
            logoUrl={logoUrl}
          />
        </PageCard>
      )}
      {onglet === "abonnement" && (
        <PageCard>
          <ParametresAbonnement
            planActuel={planActuel}
            abonnementActif={abonnementActif}
            aCompteStripe={aCompteStripe}
            planSelectionne={planSelectionne}
          />
          {planSelectionne && !abonnementActif && (
            <div id="paiement-stripe" className="mt-8 scroll-mt-24">
              <EcranPaiementRequis bloque={false} planInitial={planSelectionne} />
            </div>
          )}
        </PageCard>
      )}
      {onglet === "integrations" && (
        <PageCard>
          <ParametresIntegrations />
        </PageCard>
      )}
      {(onglet === "notifications" || onglet === "equipe") && (
        <PageCard>
          <h2 className="text-base font-semibold">Notifications & équipe</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Alertes push sur hausse de prix, rappels BFA et accès multi-utilisateurs pour les chefs de chantier —
            disponibles avec le plan Équipe (prochaine version).
          </p>
          <Link href="/parametres?onglet=abonnement" className="mt-4 inline-block text-sm font-medium text-primary hover:underline">
            Voir les offres
          </Link>
        </PageCard>
      )}
    </div>
  );
}
