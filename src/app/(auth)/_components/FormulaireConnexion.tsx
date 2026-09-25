"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState, type FormEvent } from "react";
import { Loader2Icon } from "lucide-react";
import { AuthField } from "./AuthField";
import { AuthSocialButtons } from "./AuthSocialButtons";
import { PasswordInput } from "./PasswordInput";
import { seConnecterAvecGoogle } from "../connexion/actions";

const AUTH_PANEL_CLASS =
  "flex w-full flex-col gap-3.5 rounded-[24px] border border-[#E6E9EB] bg-white p-5 shadow-[0_8px_30px_rgba(23,41,53,0.06)] md:p-6 lg:p-7";

function messageDepuisParams(params: {
  erreur?: "1" | "google" | "session";
  errorAuth?: string;
}): string | null {
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

export function FormulaireConnexion({
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
  const router = useRouter();
  const [enCours, setEnCours] = useState(false);
  const [erreurLocale, setErreurLocale] = useState<string | null>(null);

  const message = erreurLocale ?? messageDepuisParams({ erreur, errorAuth });
  const succes =
    verifie === "1" ? "Votre adresse email est confirmée. Connectez-vous pour continuer." : null;
  const destination =
    callbackUrl && callbackUrl.startsWith("/") && !callbackUrl.startsWith("//")
      ? callbackUrl
      : "/accueil";

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (enCours) return;

    // Feedback immédiat au pouce — avant l'appel réseau.
    setEnCours(true);
    setErreurLocale(null);

    const form = e.currentTarget;
    const fd = new FormData(form);
    const email = String(fd.get("email") ?? "").trim().toLowerCase();
    const password = String(fd.get("password") ?? "");

    try {
      const resultat = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (!resultat || resultat.error) {
        const code = (resultat as { code?: string } | undefined)?.code ?? resultat?.error;
        if (code === "google_only") {
          router.replace(
            `/connexion?erreur=google${
              callbackUrl ? `&callbackUrl=${encodeURIComponent(callbackUrl)}` : ""
            }`
          );
          return;
        }
        setErreurLocale("Email ou mot de passe incorrect.");
        setEnCours(false);
        return;
      }

      // Enchaîne tout de suite vers le dashboard mobile — sans attendre un second hop.
      router.replace(destination);
      router.refresh();
    } catch {
      setErreurLocale("La connexion a échoué. Réessayez.");
      setEnCours(false);
    }
  }

  return (
    <div className={AUTH_PANEL_CLASS}>
      {succes && <p className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-800">{succes}</p>}
      <form onSubmit={onSubmit} className="flex w-full flex-col gap-3.5" noValidate={false}>
        {callbackUrl ? <input type="hidden" name="callbackUrl" value={callbackUrl} /> : null}
        <AuthField
          id="email"
          name="email"
          label="Adresse e-mail"
          type="email"
          placeholder="vous@entreprise.fr"
          required
          autoComplete="email"
          disabled={enCours}
        />
        <PasswordInput
          id="password"
          name="password"
          label="Mot de passe"
          required
          autoComplete="current-password"
          disabled={enCours}
        />
        <Link
          href="/mot-de-passe-oublie"
          className="text-right text-[13px] font-bold text-[#EC5821] hover:opacity-90"
          tabIndex={enCours ? -1 : undefined}
        >
          Mot de passe oublié ?
        </Link>
        {message && (
          <p className="text-sm text-red-600" role="alert">
            {message}
            {(erreur === "1" || erreurLocale) && (
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
          disabled={enCours}
          aria-busy={enCours}
          className="flex h-14 items-center justify-center gap-2 rounded-full bg-[#EC5821] text-[16px] font-extrabold text-white transition-[transform,background-color,opacity] duration-150 hover:bg-[#d44d1a] active:scale-[0.98] disabled:cursor-wait disabled:opacity-90 md:h-[54px]"
        >
          {enCours ? (
            <>
              <Loader2Icon className="size-5 animate-spin" aria-hidden />
              Connexion…
            </>
          ) : (
            "Se connecter"
          )}
        </button>
      </form>
      {showSocial && !enCours && (
        <AuthSocialButtons googleAction={seConnecterAvecGoogle} callbackUrl={callbackUrl} />
      )}
      {showSocial && enCours && (
        <p className="text-center text-[13px] text-[#8a96a3]">Redirection vers votre espace…</p>
      )}
    </div>
  );
}
