import Link from "next/link";
import { AuthBrand } from "../_components/AuthBrand";
import { AuthDesktopFormShell } from "../_components/AuthDesktopFormShell";
import { AuthVisualPanel } from "../_components/AuthVisualPanel";
import { FormulaireConnexion } from "../_components/FormulaireConnexion";
import { MobileAuthShell } from "../_components/MobileAuthShell";

export default async function ConnexionPage({
  searchParams,
}: {
  searchParams: Promise<{ erreur?: string; error?: string; callbackUrl?: string; verifie?: string }>;
}) {
  const { erreur: erreurBrute, error: errorAuth, callbackUrl: callbackUrlBrut, verifie } = await searchParams;
  const erreur =
    erreurBrute === "google" || erreurBrute === "1" || erreurBrute === "session" ? erreurBrute : undefined;
  const callbackUrl =
    callbackUrlBrut && callbackUrlBrut.startsWith("/") && !callbackUrlBrut.startsWith("//")
      ? callbackUrlBrut
      : undefined;

  const intro = (
    <div className="flex flex-col gap-2 text-[#172935]">
      <h1 className="text-[clamp(26px,4vw,38px)] font-extrabold leading-tight">Heureux de vous revoir.</h1>
      <p className="text-[15px] leading-relaxed text-[#53616A]">
        Connectez-vous pour comparer vos devis fournisseurs.
      </p>
    </div>
  );

  const footer = (
    <p className="text-center text-[13px] text-[#53616A]">
      Pas encore de compte ?{" "}
      <Link href="/inscription" className="font-extrabold text-[#EC5821] hover:opacity-90">
        Créer un compte
      </Link>
    </p>
  );

  return (
    <>
      <MobileAuthShell>
        <div className="flex flex-col gap-[26px]">
          <AuthBrand variant="light" />
          {intro}
        </div>
        <FormulaireConnexion erreur={erreur} errorAuth={errorAuth} callbackUrl={callbackUrl} verifie={verifie} />
        {footer}
      </MobileAuthShell>

      <div className="hidden min-h-dvh md:flex">
        <AuthDesktopFormShell footer={footer}>
          {intro}
          <FormulaireConnexion erreur={erreur} errorAuth={errorAuth} callbackUrl={callbackUrl} verifie={verifie} />
        </AuthDesktopFormShell>
        <AuthVisualPanel variant="connexion" />
      </div>
    </>
  );
}
