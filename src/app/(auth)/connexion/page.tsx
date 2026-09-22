import Link from "next/link";
import { AuthBrand } from "../_components/AuthBrand";
import { AuthDesktopFormShell } from "../_components/AuthDesktopFormShell";
import { AuthField } from "../_components/AuthField";
import { AuthSocialButtons } from "../_components/AuthSocialButtons";
import { AuthVisualPanel } from "../_components/AuthVisualPanel";
import { MobileAuthShell } from "../_components/MobileAuthShell";
import { PasswordInput } from "../_components/PasswordInput";
import { seConnecter, seConnecterAvecGoogle } from "./actions";

const AUTH_PANEL_CLASS =
  "flex w-full flex-col gap-3.5 rounded-[24px] border border-[#E6E9EB] bg-white p-5 shadow-[0_8px_30px_rgba(23,41,53,0.06)] md:p-6 lg:p-7";

function messageErreurAuth(params: { erreur?: "1" | "google" | "session"; errorAuth?: string }): string | null {
  if (params.erreur === "session") {
    return "Votre session n'est plus valide. Reconnectez-vous pour continuer.";
  }
  if (params.erreur === "google") {
    return "Ce compte a été créé avec Google. Utilisez le bouton « Continuer avec Google » ci-dessous.";
  }
  if (params.erreur === "1") {
    return "Email ou mot de passe incorrect.";
  }
  if (params.errorAuth === "OAuthAccountNotLinked") {
    return "Ce compte existe déjà avec un autre mode de connexion. Essayez email + mot de passe, ou le bouton Google avec la même adresse.";
  }
  if (params.errorAuth === "AccessDenied") {
    return "Connexion refusée. Réessayez ou contactez le support.";
  }
  if (params.errorAuth) {
    return "La connexion a échoué. Réessayez.";
  }
  return null;
}

function ConnexionFormPanel({
  erreur,
  errorAuth,
  callbackUrl,
  verifie,
  showSocial = true,
}: {
  erreur?: "1" | "google" | "session";
  errorAuth?: string;
  callbackUrl?: string;
  verifie?: string;
  showSocial?: boolean;
}) {
  const message = messageErreurAuth({ erreur, errorAuth });
  const succes =
    verifie === "1" ? "Votre adresse email est confirmée. Connectez-vous pour continuer." : null;
  return (
    <div className={AUTH_PANEL_CLASS}>
      {succes && <p className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-800">{succes}</p>}
      <form action={seConnecter} className="flex w-full flex-col gap-3.5">
        {callbackUrl ? <input type="hidden" name="callbackUrl" value={callbackUrl} /> : null}
        <AuthField
          id="email"
          name="email"
          label="Adresse e-mail"
          type="email"
          placeholder="vous@entreprise.fr"
          required
          autoComplete="email"
        />
        <PasswordInput
          id="password"
          name="password"
          label="Mot de passe"
          required
          autoComplete="current-password"
        />
        <Link
          href="/mot-de-passe-oublie"
          className="text-right text-[13px] font-bold text-[#EC5821] hover:opacity-90"
        >
          Mot de passe oublié ?
        </Link>
        {message && (
          <p className="text-sm text-red-600">
            {message}
            {erreur === "1" && (
              <>
                {" "}
                <Link href="/mot-de-passe-oublie" className="font-semibold underline">
                  Mot de passe oublié ?
                </Link>
              </>
            )}
          </p>
        )}
        <button
          type="submit"
          className="flex h-14 items-center justify-center rounded-full bg-[#EC5821] text-[16px] font-extrabold text-white transition hover:bg-[#d44d1a] md:h-[54px]"
        >
          Se connecter
        </button>
      </form>
      {showSocial && <AuthSocialButtons googleAction={seConnecterAvecGoogle} callbackUrl={callbackUrl} />}
    </div>
  );
}

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
        <ConnexionFormPanel erreur={erreur} errorAuth={errorAuth} callbackUrl={callbackUrl} verifie={verifie} />
        {footer}
      </MobileAuthShell>

      <div className="hidden min-h-dvh md:flex">
        <AuthDesktopFormShell footer={footer}>
          {intro}
          <ConnexionFormPanel erreur={erreur} errorAuth={errorAuth} callbackUrl={callbackUrl} verifie={verifie} />
        </AuthDesktopFormShell>
        <AuthVisualPanel variant="connexion" />
      </div>
    </>
  );
}
