import "server-only";
import { getDb } from "@/lib/db";
import { getCompanyProfile, listChantiers, listDocuments } from "@/lib/metier/queries";

export type OnboardingStep = { label: string; href: string; done: boolean };

/** Checklist de démarrage, calculée depuis les vraies données métier. */
export async function getOnboarding(): Promise<OnboardingStep[]> {
  const db = await getDb();
  const meta = db?.user.user_metadata ?? {};
  const wizardDone = meta.onboarding_done === true;
  const [company, chantiers, docs] = await Promise.all([
    getCompanyProfile(),
    listChantiers(),
    listDocuments(),
  ]);
  const out = docs.filter((d) => d.direction === "out");

  const checklist: OnboardingStep[] = [
    { label: "Créer votre compte", href: "/accueil", done: db !== null },
    { label: "Renseigner l’entreprise", href: "/parametres/entreprise", done: Boolean(company?.raison_sociale && company.siret) },
    { label: "Ouvrir un chantier", href: "/chantiers", done: chantiers.length > 0 },
    { label: "Importer un devis distributeur", href: "/distributeur/devis", done: docs.some((d) => d.direction === "in") },
    { label: "Envoyer une pièce client", href: "/client/devis", done: out.length > 0 },
  ];

  if (!wizardDone) {
    return [
      { label: "Parcours guidé (entreprise, chantier, tableau)", href: "/onboarding", done: false },
      ...checklist,
    ];
  }
  return checklist;
}
