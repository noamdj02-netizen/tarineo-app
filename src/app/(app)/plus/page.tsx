import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { resoudreUrlAvatar } from "@/lib/avatarUtilisateur";
import { PLANS_TARINEO } from "@/lib/plansTarineo";
import { features } from "@/lib/features";
import { ProfilMobile, type ProfilMobileData } from "./ProfilMobile";
import { CompteContenu } from "../compte/CompteContenu";
import { ParametresContenu } from "../parametres/ParametresContenu";

const LIBELLE_PLAN: Record<string, string> = {
  starter: "Tarinéo Starter",
  pro: "Tarinéo Plus",
  equipe: "Tarinéo Équipe",
};

export default async function PlusPage({
  searchParams,
}: {
  searchParams: Promise<{ section?: string; onglet?: string; plan?: string }>;
}) {
  const session = await getSession();
  if (!session?.user?.id) redirect("/connexion");

  const { section, onglet, plan } = await searchParams;

  if (section === "compte") {
    return <CompteContenu />;
  }

  if (section === "parametres") {
    return (
      <ParametresContenu
        searchParams={Promise.resolve({ onglet: onglet ?? "profil", plan })}
      />
    );
  }

  let utilisateur: {
    name: string | null;
    email: string;
    image: string | null;
    plan: string | null;
    subscriptionStatus: string | null;
    stripeCustomerId: string | null;
  } | null = null;
  let entreprise: ProfilMobileData["entreprise"] = null;

  try {
    const [userRow, profil] = await Promise.all([
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          name: true,
          email: true,
          image: true,
          plan: true,
          subscriptionStatus: true,
          stripeCustomerId: true,
        },
      }),
      prisma.companyProfile.findUnique({
        where: { userId: session.user.id },
        select: {
          raisonSociale: true,
          siret: true,
          adresseRue: true,
          adresseCodePostal: true,
          adresseVille: true,
          telephone: true,
          emailContact: true,
        },
      }),
    ]);
    utilisateur = userRow;
    if (profil) {
      const adresse = [profil.adresseRue, `${profil.adresseCodePostal} ${profil.adresseVille}`.trim()]
        .filter(Boolean)
        .join(", ");
      entreprise = {
        raisonSociale: profil.raisonSociale,
        siret: profil.siret,
        adresse,
        telephone: profil.telephone,
        emailContact: profil.emailContact,
      };
    }
  } catch {
    // Base indisponible — on tombe sur les infos de session.
  }

  const nom = utilisateur?.name ?? session.user.name ?? "Artisan";
  const email = utilisateur?.email ?? session.user.email ?? "";
  const avatarUrl = await resoudreUrlAvatar(utilisateur?.image);
  const planUtilisateur = utilisateur?.plan ?? null;
  const subscriptionStatus = utilisateur?.subscriptionStatus ?? null;
  const abonnementActif = subscriptionStatus === "active" || subscriptionStatus === "trialing";
  const planLabel = LIBELLE_PLAN[planUtilisateur ?? ""] ?? (abonnementActif ? "Essai Tarinéo" : "Sans abonnement");
  const prixMensuel = PLANS_TARINEO.find((p) => p.id === planUtilisateur)?.prixMensuel ?? null;

  const data: ProfilMobileData = {
    nom,
    email,
    avatarUrl,
    entreprise,
    planLabel,
    abonnementActif,
    prochaineFacturation: null,
    prixMensuel,
    aCompteStripe: Boolean(utilisateur?.stripeCustomerId),
    afficherFacturationClients: features.clientBilling,
  };

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-2.5 overflow-x-hidden lg:gap-6">
      <ProfilMobile data={data} />

      <div className="hidden flex-col gap-2.5 lg:flex">
        <h1 className="text-2xl font-semibold text-[#172935]">Profil</h1>
        <p className="text-sm text-muted-foreground">
          Identité, entreprise, abonnement, équipe et sécurité — tout est regroupé ici.
        </p>
        <div className="mt-2 grid max-w-xl gap-2.5">
          <Link
            href="/plus?section=parametres&onglet=profil"
            className="rounded-2xl border border-border/60 bg-card px-4 py-3 text-sm font-medium hover:bg-secondary/60"
          >
            Mon entreprise
          </Link>
          <Link
            href="/plus?section=parametres&onglet=abonnement"
            className="rounded-2xl border border-border/60 bg-card px-4 py-3 text-sm font-medium hover:bg-secondary/60"
          >
            Abonnement
          </Link>
          <Link
            href="/plus?section=parametres&onglet=equipe"
            className="rounded-2xl border border-border/60 bg-card px-4 py-3 text-sm font-medium hover:bg-secondary/60"
          >
            Équipe
          </Link>
          <Link
            href="/plus?section=compte"
            className="rounded-2xl border border-border/60 bg-card px-4 py-3 text-sm font-medium hover:bg-secondary/60"
          >
            Sécurité & export RGPD
          </Link>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Besoin d&apos;aide ?{" "}
          <Link href="/contact" className="font-medium text-primary hover:underline">
            Centre d&apos;aide
          </Link>{" "}
          ·{" "}
          <a href="mailto:contact@tarineo.com" className="font-medium text-primary hover:underline">
            contact@tarineo.com
          </a>
        </p>
      </div>
    </div>
  );
}
