import Link from "next/link";
import { AuthBrand } from "../_components/AuthBrand";
import { AuthDesktopFormShell } from "../_components/AuthDesktopFormShell";
import { AuthField } from "../_components/AuthField";
import { AuthVisualPanel } from "../_components/AuthVisualPanel";
import { demanderReinitialisation } from "./actions";

const AUTH_PANEL_CLASS =
  "flex w-full flex-col gap-3.5 rounded-[24px] border border-[#E6E9EB] bg-white p-5 shadow-[0_8px_30px_rgba(23,41,53,0.06)] md:p-6 lg:p-7";

function MotDePasseMascot({ className = "" }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/auth/mascot-mot-de-passe-oublie.png"
      alt=""
      width={965}
      height={1024}
      className={`mx-auto block h-auto w-auto object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.35)] ${className}`}
      style={{ maxHeight: "min(240px, 34dvh)", maxWidth: "min(280px, 88vw)" }}
      decoding="async"
    />
  );
}

function MotDePasseMobileShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden md:hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/auth/bg-connexion-mobile.png"
        alt=""
        width={390}
        height={844}
        className="absolute inset-0 h-full w-full object-cover object-center"
      />
      <div className="absolute inset-0 bg-[rgba(9,8,7,0.78)]" aria-hidden />
      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-[440px] flex-col justify-between px-5 pb-6 pt-5 sm:px-6">
        {children}
      </div>
    </div>
  );
}

function MotDePasseFormPanel({ erreur }: { erreur?: string }) {
  return (
    <div className={AUTH_PANEL_CLASS}>
      <form action={demanderReinitialisation} className="flex w-full flex-col gap-3.5">
        <AuthField
          id="email"
          name="email"
          label="Adresse e-mail"
          type="email"
          placeholder="vous@entreprise.fr"
          required
          autoComplete="email"
        />
        {erreur && (
          <p className="text-sm text-red-600">Merci de renseigner une adresse e-mail valide.</p>
        )}
        <button
          type="submit"
          className="flex h-14 items-center justify-center rounded-full bg-[#EC5821] text-[16px] font-extrabold text-white transition hover:bg-[#d44d1a] md:h-[54px]"
        >
          Envoyer le lien de réinitialisation
        </button>
      </form>
    </div>
  );
}

function MotDePasseSuccesPanel() {
  return (
    <div className={AUTH_PANEL_CLASS}>
      <p className="text-[15px] leading-relaxed text-[#53616A]">
        Si un compte existe avec cette adresse, un e-mail vient de vous être envoyé avec un lien pour
        réinitialiser votre mot de passe. Il est valable 1 heure — pensez à vérifier vos spams si vous ne le
        voyez pas.
      </p>
    </div>
  );
}

export default async function MotDePasseOubliePage({
  searchParams,
}: {
  searchParams: Promise<{ erreur?: string; envoye?: string }>;
}) {
  const { erreur, envoye } = await searchParams;
  const envoyeOk = envoye === "1";

  const intro = envoyeOk
    ? (
        <div className="flex flex-col gap-2 text-[#172935] md:text-[#172935]">
          <h1 className="text-[clamp(26px,4vw,38px)] font-extrabold leading-tight text-white md:text-[#172935]">
            Vérifiez votre boîte mail
          </h1>
          <p className="text-[15px] leading-relaxed text-[#b9b4b0] md:text-[#53616A]">
            Le lien de réinitialisation est en route.
          </p>
        </div>
      )
    : (
        <div className="flex flex-col gap-2">
          <h1 className="hidden text-[clamp(26px,4vw,38px)] font-extrabold leading-tight text-[#172935] md:block">
            Mot de passe oublié ?
          </h1>
          <p className="text-center text-[15px] leading-relaxed text-[#b9b4b0] md:text-left md:text-[#53616A]">
            Indiquez votre adresse e-mail, nous vous enverrons un lien pour en choisir un nouveau.
          </p>
        </div>
      );

  const footer = (
    <p className="text-center text-[13px] text-[#b9b4b0] md:text-[#53616A]">
      <Link href="/connexion" className="font-extrabold text-[#EC5821] hover:opacity-90">
        Retour à la connexion
      </Link>
    </p>
  );

  const formPanel = envoyeOk ? <MotDePasseSuccesPanel /> : <MotDePasseFormPanel erreur={erreur} />;

  return (
    <>
      <MotDePasseMobileShell>
        <div className="flex flex-col gap-4">
          <AuthBrand variant="dark" />
          {!envoyeOk && <MotDePasseMascot />}
          {intro}
        </div>
        {formPanel}
        {footer}
      </MotDePasseMobileShell>

      <div className="hidden min-h-dvh md:flex">
        <AuthDesktopFormShell footer={footer}>
          {intro}
          {formPanel}
        </AuthDesktopFormShell>
        <AuthVisualPanel variant="mot-de-passe" />
      </div>
    </>
  );
}
