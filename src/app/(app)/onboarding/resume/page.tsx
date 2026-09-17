import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { calculerResumeAnalyse, completerOnboardingFlow } from "@/lib/onboarding";

const formaterEuros = (v: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(v);

export default async function OnboardingResumePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/connexion");

  // Marque le parcours comme vu dès l'affichage du résumé (chiffres réels).
  await completerOnboardingFlow(session.user.id);

  const resume = await calculerResumeAnalyse(session.user.id);

  if (resume.documentsAnalyses + resume.documentsErreur + resume.documentsAVerifier === 0) {
    redirect("/documents?onboarding=1");
  }

  const stats = [
    { label: "Documents analysés", valeur: String(resume.documentsAnalyses) },
    { label: "Fournisseurs identifiés", valeur: String(resume.fournisseursIdentifies) },
    { label: "Produits détectés", valeur: String(resume.produitsDetectes) },
    { label: "Clients identifiés", valeur: String(resume.clientsIdentifies) },
    { label: "Variations de prix", valeur: String(resume.variationsPrix) },
    { label: "Produits à surveiller", valeur: String(resume.produitsASurveiller) },
  ];

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col px-2 py-10">
      <p className="text-sm font-medium uppercase tracking-wider text-primary">Espace prêt</p>
      <h1 className="mt-3 text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
        Votre espace est prêt.
      </h1>
      <p className="mt-3 text-base text-muted-foreground">
        Voici ce que Tarinéo a trouvé à partir de <strong className="font-medium text-foreground">vos</strong>{" "}
        documents — aucun chiffre inventé.
      </p>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {stats.map((s) => (
          <div key={s.label} className="rounded-[20px] bg-card p-5">
            <p className="text-3xl font-semibold text-foreground">{s.valeur}</p>
            <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {resume.impactEuros > 0 && (
        <div className="mt-4 rounded-[20px] bg-[#FFF0E8] p-5">
          <p className="text-sm font-medium text-primary">Impact identifié</p>
          <p className="mt-1 text-2xl font-semibold text-foreground">{formaterEuros(resume.impactEuros)}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Sur les hausses détectées dans votre historique personnel.
          </p>
        </div>
      )}

      {resume.documentsAVerifier > 0 && (
        <p className="mt-4 text-sm text-muted-foreground">
          {resume.documentsAVerifier} document{resume.documentsAVerifier > 1 ? "s" : ""} à vérifier — Tarinéo
          n&apos;invente rien quand la confiance est faible.
        </p>
      )}

      {resume.documentsErreur > 0 && (
        <p className="mt-2 text-sm text-primary">
          {resume.documentsErreur} document{resume.documentsErreur > 1 ? "s n&apos;ont" : " n&apos;a"} pas pu être
          lu correctement — vous pourrez réessayer depuis Mes documents.
        </p>
      )}

      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <Link
          href={resume.variationsPrix > 0 ? "/documents?hausse=1" : "/accueil"}
          className="flex h-14 flex-1 items-center justify-center rounded-full bg-primary text-base font-semibold text-white"
        >
          {resume.variationsPrix > 0 ? "Voir les hausses détectées" : "Découvrir mon dashboard"}
        </Link>
        <Link
          href="/accueil"
          className="flex h-14 flex-1 items-center justify-center rounded-full border border-border bg-card text-base font-medium"
        >
          Aller au dashboard
        </Link>
      </div>
    </div>
  );
}
