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
    "rounded-[26px] border border-white/14 bg-[rgba(23,21,19,0.95)] p-5 shadow-[0_20px_50px_rgba(0,0,0,0.4)] md:p-6 lg:p-7";

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
        {erreur && <p className="text-sm text-red-400">Email ou mot de passe incorrect.</p>}
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
    <div className="flex flex-col gap-2 text-white">
      <h1 className="text-[clamp(26px,4vw,38px)] font-extrabold leading-tight">Heureux de vous revoir.</h1>
      <p className="text-[15px] leading-relaxed text-[#b9b4b0]">
        Connectez-vous pour comparer vos devis fournisseurs.
      </p>
    </div>
  );

  const footer = (
    <p className="text-center text-[13px] text-[#b9b4b0]">
      Pas encore de compte ?{" "}
      <Link href="/inscription" className="font-extrabold text-[#ff6a24] hover:opacity-90">
        Créer un compte
      </Link>
    </p>
  );

  return (
    <>
      <MobileAuthShell background="/auth/bg-connexion-mobile.png" overlayOpacity={0.79}>
        <div className="flex flex-col gap-[26px]">
          <AuthBrand variant="dark" />
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
