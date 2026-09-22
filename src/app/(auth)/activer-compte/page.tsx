import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { confirmerEmailDepuisToken } from "@/lib/confirmationEmail";
import { AuthBrand } from "../_components/AuthBrand";

export default async function ActiverComptePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  if (!token?.trim()) {
    redirect("/confirmer-email?erreur=invalide");
  }

  const resultat = await confirmerEmailDepuisToken(token.trim());
  if (!resultat.ok) {
    redirect(`/confirmer-email?erreur=${resultat.code}`);
  }

  const session = await getSession();
  if (session?.user?.id === resultat.userId) {
    redirect("/apres-connexion");
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-md rounded-[24px] border border-[#E6E9EB] bg-white p-8 text-center shadow-sm">
        <div className="mb-6 flex justify-center">
          <AuthBrand variant="light" />
        </div>
        <h1 className="text-xl font-bold text-[#172935]">Adresse confirmée</h1>
        <p className="mt-2 text-sm text-[#53616A]">Votre compte est activé. Connectez-vous pour continuer.</p>
        <Link
          href="/connexion?verifie=1"
          className="mt-6 inline-flex h-12 items-center justify-center rounded-full bg-[#EC5821] px-8 text-sm font-bold text-white"
        >
          Se connecter
        </Link>
      </div>
    </div>
  );
}
