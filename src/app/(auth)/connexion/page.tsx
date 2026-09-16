import Link from "next/link";
import { AuthBrand } from "../_components/AuthBrand";
import { AuthDesktopFormShell } from "../_components/AuthDesktopFormShell";
import { AuthField } from "../_components/AuthField";
import { AuthSocialButtons } from "../_components/AuthSocialButtons";
import { AuthVisualPanel } from "../_components/AuthVisualPanel";
import { MobileAuthShell } from "../_components/MobileAuthShell";
import { PasswordInput } from "../_components/PasswordInput";
import { seConnecter, seConnecterAvecGoogle } from "./actions";

function ConnexionFormPanel({
  erreur,
  variant = "glass",
  showSocial = true,
}: {
  erreur?: string;
  variant?: "glass" | "solid";
  showSocial?: boolean;
}) {
  const panelClass =
    "rounded-[24px] border border-[#E6E9EB] bg-white p-5 shadow-[0_8px_30px_rgba(23,41,53,0.06)] md:p-6 lg:p-7";

  return (
    <div className={`flex w-full flex-col gap-3.5 ${panelClass}`}>
      <form action={seConnecter} className="flex w-full flex-col gap-3.5">
        <AuthField
          id="email"
          name="email"
          label="Adresse e-mail"
          type="email"
          placeholder="vous@entreprise.fr"
          required
          autoComplete="email"
          variant={variant}
        />
        <PasswordInput
          id="password"
          name="password"
          label="Mot de passe"
          required
          autoComplete="current-password"
          variant={variant}
        />
        <Link
          href="/mot-de-passe-oublie"
          className="text-right text-[13px] font-bold text-[#ff6a24] hover:opacity-90"
        >
          Mot de passe oublié ?
        </Link>
        {erreur && <p className="text-sm text-red-600">Email ou mot de passe incorrect.</p>}
        <button
          type="submit"
          className="flex h-14 items-center justify-center rounded-full bg-[#f24f0a] text-[16px] font-extrabold text-white transition hover:bg-[#e8520e] md:h-[54px]"
        >
          Se connecter
        </button>
      </form>
      {showSocial && <AuthSocialButtons googleAction={seConnecterAvecGoogle} />}
    </div>
  );
}

export default async function ConnexionPage({
  searchParams,
}: {
  searchParams: Promise<{ erreur?: string }>;
}) {
  const { erreur } = await searchParams;

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
        <ConnexionFormPanel erreur={erreur} />
        {footer}
      </MobileAuthShell>

      <div className="hidden min-h-dvh md:flex">
        <AuthDesktopFormShell footer={footer}>
          {intro}
          <ConnexionFormPanel erreur={erreur} />
        </AuthDesktopFormShell>
        <AuthVisualPanel variant="connexion" />
      </div>
    </>
  );
}
