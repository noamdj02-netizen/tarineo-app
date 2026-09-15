import Link from "next/link";
import { reinitialiserMotDePasse } from "./actions";
import { hacherToken } from "@/lib/reinitialisationMotDePasse";
import { LONGUEUR_MIN_MOT_DE_PASSE } from "@/lib/password";
import { prisma } from "@/lib/prisma";

export default async function ReinitialiserMotDePassePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; erreur?: string }>;
}) {
  const { token, erreur } = await searchParams;

  const lienInvalide =
    erreur === "invalide" ||
    !token ||
    !(await prisma.verificationToken
      .findUnique({ where: { token: hacherToken(token) } })
      .then((v) => v && v.expires > new Date()));

  if (lienInvalide) {
    return (
      <div className="max-w-md mx-auto px-6 py-24 text-center">
        <h1 className="text-2xl font-semibold">Lien invalide ou expiré</h1>
        <p className="mt-4 text-muted">
          Ce lien de réinitialisation n&apos;est plus valable — il a peut-être déjà été utilisé, ou son délai d&apos;1
          heure est dépassé. Vous pouvez en demander un nouveau.
        </p>
        <Link
          href="/mot-de-passe-oublie"
          className="mt-8 inline-block rounded-md bg-accent px-4 py-2 font-medium text-accent-foreground hover:opacity-90"
        >
          Redemander un lien
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-6 py-24">
      <h1 className="text-2xl font-semibold text-center">Choisir un nouveau mot de passe</h1>

      <form action={reinitialiserMotDePasse} className="mt-8 space-y-4">
        <input type="hidden" name="token" value={token} />

        <div>
          <label htmlFor="password" className="block text-sm text-muted mb-1">
            Nouveau mot de passe
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={LONGUEUR_MIN_MOT_DE_PASSE}
            autoComplete="new-password"
            className="w-full rounded-md border border-border bg-surface px-4 py-2 text-foreground outline-none focus:border-accent"
          />
          <p className="mt-1 text-xs text-muted">{LONGUEUR_MIN_MOT_DE_PASSE} caractères minimum.</p>
        </div>

        <div>
          <label htmlFor="confirmation" className="block text-sm text-muted mb-1">
            Confirmer le mot de passe
          </label>
          <input
            id="confirmation"
            name="confirmation"
            type="password"
            required
            minLength={LONGUEUR_MIN_MOT_DE_PASSE}
            autoComplete="new-password"
            className="w-full rounded-md border border-border bg-surface px-4 py-2 text-foreground outline-none focus:border-accent"
          />
        </div>

        {erreur === "1" && (
          <p className="text-sm text-red-400">
            Vérifiez que les deux mots de passe correspondent et font au moins {LONGUEUR_MIN_MOT_DE_PASSE}{" "}
            caractères.
          </p>
        )}

        <button
          type="submit"
          className="w-full rounded-md bg-accent px-4 py-2 font-medium text-accent-foreground hover:opacity-90"
        >
          Réinitialiser mon mot de passe
        </button>
      </form>
    </div>
  );
}
