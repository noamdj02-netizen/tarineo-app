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
    <div className="flex w-full flex-col gap-3.5 rounded-[26px] border border-white/14 bg-[rgba(23,21,19,0.95)] p-5 shadow-[0_20px_50px_rgba(0,0,0,0.4)] md:p-6 lg:p-[22px]">
      <form action={creerCompte} className="flex w-full flex-col gap-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <AuthField
            id="prenom"
            name="prenom"
            label="Prénom"
            placeholder="Jean"
            required
            autoComplete="given-name"
          />
          <AuthField
            id="nom"
            name="nom"
            label="Nom"
            placeholder="Dupont"
            required
            autoComplete="family-name"
          />
        </div>
        <AuthField
          id="email"
          name="email"
          label="Adresse e-mail"
          type="email"
          placeholder="vous@entreprise.fr"
          required
          autoComplete="email"
        />
        <AuthField
          id="entrepriseNom"
          name="entrepriseNom"
          label="Nom de l'entreprise"
          placeholder="Dupont Plomberie"
          required
          autoComplete="organization"
        />
        <AuthField
          id="telephone"
          name="telephone"
          label="Téléphone (optionnel)"
          type="tel"
          placeholder="06 12 34 56 78"
          autoComplete="tel"
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
        <label className="flex items-start gap-2 text-xs leading-relaxed text-[#b9b4b0]">
          <input type="checkbox" name="consent" required className="mt-0.5 accent-[#f24f0a]" />
          <span>
            J&apos;accepte les Conditions Générales d&apos;Utilisation et la Politique de Confidentialité de
            Tarineo.
          </span>
        </label>
        {erreur && <p className="text-sm text-red-400">{MESSAGES_ERREUR[erreur] ?? MESSAGES_ERREUR["1"]}</p>}
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
    <div className="relative flex min-h-dvh flex-col overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/auth/bg-inscription-mobile.png"
        alt=""
        width={390}
        height={844}
        className="absolute inset-0 h-full w-full object-cover object-center"
      />
      <div className="absolute inset-0 bg-[rgba(9,8,7,0.82)]" aria-hidden />
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
          <h1 className="text-[30px] font-extrabold text-white">Vous êtes sur la liste</h1>
          <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-[#b9b4b0]">
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
        <AuthBrand variant="dark" />
        <div className="flex flex-col gap-1.5">
          <h1 className="text-[30px] font-extrabold leading-[1.12] text-white">L&apos;accès anticipé est complet</h1>
          <p className="text-[15px] leading-relaxed text-[#b9b4b0]">
            {erreur === "acces_complet"
              ? MESSAGES_ERREUR.acces_complet
              : "L'accès anticipé est complet. Laissez votre email pour être prévenu dès qu'une place se libère."}
          </p>
        </div>
      </div>
      <form
        action={rejoindreListeAttente}
        className="rounded-[26px] border border-white/14 bg-[rgba(23,21,19,0.91)] p-5 shadow-[0_20px_50px_rgba(0,0,0,0.4)]"
      >
        <AuthField
          id="waitlist-email"
          name="email"
          label="Adresse e-mail"
          type="email"
          placeholder="vous@entreprise.fr"
          required
        />
        {erreur === "1" && <p className="mt-3 text-sm text-red-400">Merci de renseigner une adresse email valide.</p>}
        <button
          type="submit"
          className="mt-4 flex h-14 w-full items-center justify-center rounded-full bg-[#f24f0a] text-[16px] font-extrabold text-white"
        >
          Rejoindre la liste d&apos;attente
        </button>
      </form>
      <p className="text-center text-[13px] text-[#b9b4b0]">
        <Link href="/connexion" className="font-extrabold text-[#ff6a24]">
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
    <div className="flex flex-col gap-1.5 text-white">
      <h1 className="text-[clamp(26px,3.6vw,34px)] font-extrabold leading-tight">Créez votre compte.</h1>
      <p className="text-[15px] text-[#b9b4b0]">Importez vos documents ensuite — Tarinéo construit le reste.</p>
    </div>
  );

  const footer = (
    <p className="text-center text-[13px] text-[#b9b4b0]">
      Déjà un compte ?{" "}
      <Link href="/connexion" className="font-extrabold text-[#ff6a24] hover:opacity-90">
        Se connecter
      </Link>
    </p>
  );

  return (
    <>
      <MobileAuthShell background="/auth/bg-inscription-mobile.png">
        <div className="flex flex-col gap-[18px]">
          <AuthBrand variant="dark" />
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
