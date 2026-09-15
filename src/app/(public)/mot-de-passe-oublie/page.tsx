import Link from "next/link";
import { demanderReinitialisation } from "./actions";

export default async function MotDePasseOubliePage({
  searchParams,
}: {
  searchParams: Promise<{ erreur?: string; envoye?: string }>;
}) {
  const { erreur, envoye } = await searchParams;

  if (envoye) {
    return (
      <div className="max-w-md mx-auto px-6 py-24 text-center">
        <h1 className="text-2xl font-semibold">Vérifiez votre boîte mail</h1>
        <p className="mt-4 text-muted">
          Si un compte existe avec cette adresse, un email vient de vous être envoyé avec un lien pour
          réinitialiser votre mot de passe. Il est valable 1 heure et pensez à vérifier vos spams si vous ne le
          voyez pas.
        </p>
        <p className="mt-8 text-sm text-muted">
          <Link href="/connexion" className="text-accent hover:opacity-80">
            Retour à la connexion
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-6 py-24">
      <h1 className="text-2xl font-semibold text-center">Mot de passe oublié</h1>
      <p className="mt-2 text-center text-muted">
        Indiquez votre adresse email, nous vous enverrons un lien pour en choisir un nouveau.
      </p>

      <form action={demanderReinitialisation} className="mt-8 space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm text-muted mb-1">
            Adresse email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="vous@exemple.fr"
            className="w-full rounded-md border border-border bg-surface px-4 py-2 text-foreground outline-none focus:border-accent"
          />
        </div>

        {erreur && <p className="text-sm text-red-400">Merci de renseigner une adresse email valide.</p>}

        <button
          type="submit"
          className="w-full rounded-md bg-accent px-4 py-2 font-medium text-accent-foreground hover:opacity-90"
        >
          Envoyer le lien de réinitialisation
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-muted">
        <Link href="/connexion" className="text-accent hover:opacity-80">
          Retour à la connexion
        </Link>
      </p>
    </div>
  );
}
