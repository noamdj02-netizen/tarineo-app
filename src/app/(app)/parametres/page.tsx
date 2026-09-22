import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { DOCUMENTS_BUCKET, getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";
import { FormulaireEntreprise } from "../entreprise/FormulaireEntreprise";
import { PageHeader, PageCard } from "@/components/tarineo/PageHeader";
import { MobilePageHeader } from "@/components/tarineo/mobile/MobilePageHeader";
import { PageTabs } from "@/components/tarineo/PageTabs";
import { ParametresAbonnement } from "./ParametresAbonnement";
import { ParametresIntegrations } from "./ParametresIntegrations";
import { ParametresComptable } from "./ParametresComptable";
import { ParametresEquipe } from "./ParametresEquipe";
import { PennylaneCarte } from "./PennylaneCarte";
import { BanniereLimitesPlan } from "@/components/tarineo/BanniereLimitesPlan";
import { accesExportComptable } from "@/lib/planGating";
import { accesEquipe, chargerEquipe, obtenirOuCreerEquipe } from "@/lib/equipe";
import { pennylaneConfigure } from "@/lib/pennylane";
import { origineActuelle } from "@/lib/origine";
import { ParametresImportEmail } from "./ParametresImportEmail";
import { EcranPaiementRequis } from "../documents/EcranPaiementRequis";
import { planStripeValide } from "@/lib/plansStripe";
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
  const accesEquipePlan = accesEquipe(planActuel, subscriptionStatus);
  let equipeData: Awaited<ReturnType<typeof chargerEquipe>> = null;
  let pennylaneConnecte = false;
  if (onglet === "equipe" && session.user.id) {
    equipeData = await chargerEquipe(session.user.id);
    if (!equipeData && accesEquipePlan) {
      await obtenirOuCreerEquipe(session.user.id);
      equipeData = await chargerEquipe(session.user.id);
    }
  }
  if (onglet === "integrations") {
    pennylaneConnecte = Boolean(await prisma.pennylaneConnection.findUnique({ where: { userId: session.user.id } }));
  }
  const origine = await origineActuelle();

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
      <MobilePageHeader title="Paramètres" subtitle="Entreprise, abonnement, équipe" />
      <div className="hidden lg:block">
        <PageHeader title="Paramètres" subtitle="Gérez vos informations et préférences." />
      </div>
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
          <BanniereLimitesPlan
            plan={planActuel}
            subscriptionStatus={subscriptionStatus}
            className="mb-6"
          />
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
        <PageCard className="space-y-8">
          <ParametresImportEmail userId={session.user.id} />
          <hr className="border-border" />
          <ParametresComptable
            emailComptable={profil?.emailComptable ?? null}
            exportComptableAuto={profil?.exportComptableAuto ?? false}
            accesExport={accesExportComptable(planActuel, subscriptionStatus)}
          />
          <hr className="border-border" />
          <PennylaneCarte
            connecte={pennylaneConnecte}
            configure={pennylaneConfigure()}
            accesExport={accesExportComptable(planActuel, subscriptionStatus)}
            redirectUri={`${origine}/api/integrations/pennylane/callback`}
          />
          <hr className="border-border" />
          <ParametresIntegrations />
        </PageCard>
      )}
      {onglet === "equipe" && (
        <PageCard>
          <ParametresEquipe
            accesEquipe={accesEquipePlan}
            nomEquipe={equipeData?.name ?? profil?.raisonSociale ?? "Mon équipe"}
            membres={
              equipeData?.members.map((m) => ({
                id: m.id,
                userId: m.userId,
                role: m.role,
                email: m.user.email,
                name: m.user.name,
              })) ?? []
            }
            invitations={
              equipeData?.invitations.map((i) => ({
                id: i.id,
                email: i.email,
                expiresAt: i.expiresAt.toISOString(),
              })) ?? []
            }
          />
        </PageCard>
      )}
      {onglet === "notifications" && (
        <PageCard>
          <h2 className="text-base font-semibold">Notifications</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Alertes email sur les hausse de prix et rappels BFA — configurables prochainement.
          </p>
        </PageCard>
      )}
    </div>
  );
}
