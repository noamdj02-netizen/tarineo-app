import Link from "next/link";
import { LONGUEUR_MIN_MOT_DE_PASSE } from "@/lib/password";
import { etatAccesAnticipeDepuisDb } from "@/lib/accesAnticipe";
import { AuthBrand } from "../_components/AuthBrand";
import { AuthDesktopFormShell } from "../_components/AuthDesktopFormShell";
import { AuthField } from "../_components/AuthField";
import { AuthSocialButtons } from "../_components/AuthSocialButtons";
import { AuthVisualPanel } from "../_components/AuthVisualPanel";
import { MobileAuthShell } from "../_components/MobileAuthShell";
import { PasswordInput } from "../_components/PasswordInput";
import { creerCompte, creerCompteAvecGoogle, rejoindreListeAttente } from "./actions";

const MESSAGES_ERREUR: Record<string, string> = {
  existe: "Un compte existe déjà avec cet email. Connectez-vous plutôt.",
  acces_complet:
    "L'accès anticipé vient d'atteindre sa limite pendant votre inscription — rejoignez la liste d'attente ci-dessous.",
  "1": `Vérifiez vos informations, un mot de passe d'au moins ${LONGUEUR_MIN_MOT_DE_PASSE} caractères (identique dans les deux champs), et que vous avez accepté les conditions.`,
};

function InscriptionFormPanel({
  erreur,
  showSocial = true,
}: {
  erreur?: string;
  showSocial?: boolean;
}) {
  return (
    <div className="flex w-full flex-col gap-3.5 rounded-[24px] border border-[#E6E9EB] bg-white p-5 shadow-[0_8px_30px_rgba(23,41,53,0.06)] md:p-6 lg:p-[22px]">
      <form action={creerCompte} className="flex w-full flex-col gap-3">
        <AuthField
          id="name"
          name="name"
          label="Nom complet"
          placeholder="Jean Dupont"
          required
          autoComplete="name"
        />
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
          minLength={LONGUEUR_MIN_MOT_DE_PASSE}
          autoComplete="new-password"
        />
        <PasswordInput
          id="confirmation"
          name="confirmation"
          label="Confirmer le mot de passe"
          required
          minLength={LONGUEUR_MIN_MOT_DE_PASSE}
          autoComplete="new-password"
        />
        <label className="flex items-start gap-2 text-xs leading-relaxed text-[#53616A]">
          <input type="checkbox" name="consent" required className="mt-0.5 accent-[#EC5821]" />
          <span>
            J&apos;accepte les Conditions Générales d&apos;Utilisation et la Politique de Confidentialité de
            Tarineo.
          </span>
        </label>
        {erreur && <p className="text-sm text-red-600">{MESSAGES_ERREUR[erreur] ?? MESSAGES_ERREUR["1"]}</p>}
        <button
          type="submit"
          className="flex h-14 items-center justify-center rounded-full bg-[#f24f0a] text-[16px] font-extrabold text-white transition hover:bg-[#e8520e] md:h-[54px]"
        >
          Créer mon compte
        </button>
      </form>
      {showSocial && <AuthSocialButtons googleAction={creerCompteAvecGoogle} />}
    </div>
  );
}

function WaitlistShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-white">
      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-[496px] flex-col justify-between px-5 py-6 sm:px-6">
        {children}
      </div>
    </div>
  );
}

function WaitlistView({ erreur, listeAttente }: { erreur?: string; listeAttente?: string }) {
  if (listeAttente) {
    return (
      <WaitlistShell>
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <h1 className="text-[30px] font-extrabold text-[#172935]">Vous êtes sur la liste</h1>
          <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-[#53616A]">
            Merci ! On vous écrit dès qu&apos;une place se libère pour l&apos;accès anticipé, ou au lancement
            officiel — avec votre tarif préférentiel garanti.
          </p>
          <Link href="/" className="mt-8 text-sm font-bold text-[#ff6a24] hover:opacity-90">
            Retour à l&apos;accueil
          </Link>
        </div>
      </WaitlistShell>
    );
  }

  return (
    <WaitlistShell>
      <div className="flex flex-col gap-[18px]">
        <AuthBrand variant="light" />
        <div className="flex flex-col gap-1.5">
          <h1 className="text-[30px] font-extrabold leading-[1.12] text-[#172935]">L&apos;accès anticipé est complet</h1>
          <p className="text-[15px] leading-relaxed text-[#53616A]">
            {erreur === "acces_complet"
              ? MESSAGES_ERREUR.acces_complet
              : "L'accès anticipé est complet. Laissez votre email pour être prévenu dès qu'une place se libère."}
          </p>
        </div>
      </div>
      <form
        action={rejoindreListeAttente}
        className="rounded-[24px] border border-[#E6E9EB] bg-white p-5 shadow-[0_8px_30px_rgba(23,41,53,0.06)]"
      >
        <AuthField
          id="waitlist-email"
          name="email"
          label="Adresse e-mail"
          type="email"
          placeholder="vous@entreprise.fr"
          required
        />
        {erreur === "1" && <p className="mt-3 text-sm text-red-600">Merci de renseigner une adresse email valide.</p>}
        <button
          type="submit"
          className="mt-4 flex h-14 w-full items-center justify-center rounded-full bg-[#f24f0a] text-[16px] font-extrabold text-white"
        >
          Rejoindre la liste d&apos;attente
        </button>
      </form>
      <p className="text-center text-[13px] text-[#53616A]">
        <Link href="/connexion" className="font-extrabold text-[#EC5821]">
          J&apos;ai déjà un compte
        </Link>
      </p>
    </WaitlistShell>
  );
}

export default async function InscriptionPage({
  searchParams,
}: {
  searchParams: Promise<{ erreur?: string; liste_attente?: string }>;
}) {
  const { erreur, liste_attente } = await searchParams;
  const { phase } = await etatAccesAnticipeDepuisDb();
  const accesComplet = phase === "complete" || erreur === "acces_complet";

  if (accesComplet) {
    return <WaitlistView erreur={erreur} listeAttente={liste_attente} />;
  }

  const intro = (
    <div className="flex flex-col gap-1.5 text-[#172935]">
      <h1 className="text-[clamp(26px,3.6vw,34px)] font-extrabold leading-tight">Créez votre compte.</h1>
      <p className="text-[15px] text-[#53616A]">Des devis plus justes commencent ici.</p>
    </div>
  );

  const footer = (
    <p className="text-center text-[13px] text-[#53616A]">
      Déjà un compte ?{" "}
      <Link href="/connexion" className="font-extrabold text-[#EC5821] hover:opacity-90">
        Se connecter
      </Link>
    </p>
  );

  return (
    <>
      <MobileAuthShell>
        <div className="flex flex-col gap-[18px]">
          <AuthBrand variant="light" />
          {intro}
        </div>
        <InscriptionFormPanel erreur={erreur} />
        {footer}
      </MobileAuthShell>

      <div className="hidden min-h-dvh md:flex">
        <AuthDesktopFormShell footer={footer} gapClass="gap-[18px]">
          {intro}
          <InscriptionFormPanel erreur={erreur} />
        </AuthDesktopFormShell>
        <AuthVisualPanel variant="inscription" />
      </div>
    </>
  );
}
