import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function OnboardingPlusTardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/connexion");

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-lg flex-col justify-center px-2 py-10">
      <p className="text-sm font-medium uppercase tracking-wider text-primary">Compte créé</p>
      <h1 className="mt-3 text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
        Pas de problème. Votre espace est créé.
      </h1>
      <p className="mt-4 text-base leading-relaxed text-muted-foreground">
        Vous pourrez importer vos documents plus tard depuis votre téléphone ou votre ordinateur. Dès que
        vous serez connecté, Tarinéo vous rappellera de commencer.
      </p>

      <Link
        href="/accueil"
        className="mt-10 flex h-14 w-full items-center justify-center rounded-full bg-primary text-base font-semibold text-white hover:opacity-95"
      >
        Accéder à mon espace
      </Link>
    </div>
  );
}
