import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { resoudreUrlAvatar } from "@/lib/avatarUtilisateur";
import { PLANS_TARINEO } from "@/lib/plansTarineo";
import { MobileMenuRow } from "@/components/tarineo/mobile/MobileMenuRow";
import { ProfilMobile, type ProfilMobileData } from "./ProfilMobile";

const LIBELLE_PLAN: Record<string, string> = {
  starter: "Tarinéo Starter",
  pro: "Tarinéo Plus",
  equipe: "Tarinéo Équipe",
};

const LIENS_DESKTOP = [
  { href: "/compte", title: "Mon compte", description: "Profil, photo et mot de passe" },
  { href: "/parametres", title: "Mon entreprise", description: "SIRET, adresse, logo" },
  { href: "/parametres?onglet=abonnement", title: "Abonnement", description: "Plan et facturation" },
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
  const plan = utilisateur?.plan ?? null;
  const subscriptionStatus = utilisateur?.subscriptionStatus ?? null;
  const abonnementActif = subscriptionStatus === "active" || subscriptionStatus === "trialing";
  const planLabel = LIBELLE_PLAN[plan ?? ""] ?? (abonnementActif ? "Essai Tarinéo" : "Sans abonnement");
  const prixMensuel = PLANS_TARINEO.find((p) => p.id === plan)?.prixMensuel ?? null;

  // Pas d'appel Stripe synchrone ici — bloquait le premier paint Profil (~1s+).
  // La date de facturation reste consultable via le portail Stripe.
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
  };

  return (
    <div className="flex w-full max-w-full flex-col gap-2.5 overflow-x-hidden lg:gap-6">
      <ProfilMobile data={data} />

      <div className="hidden flex-col gap-2.5 lg:flex">
        <h1 className="text-2xl font-semibold text-[#172935]">Profil</h1>
        <p className="text-sm text-muted-foreground">
          Gérez votre compte, votre entreprise et votre abonnement. Sur mobile, l&apos;onglet Profil
          affiche une vue dédiée.
        </p>
        <div className="mt-2 grid max-w-xl gap-2.5">
          {LIENS_DESKTOP.map((lien) => (
            <MobileMenuRow key={`${lien.href}-${lien.title}`} {...lien} />
          ))}
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
