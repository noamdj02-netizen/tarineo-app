import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { utilisateurDoitConfirmerEmail } from "@/lib/confirmationEmail";
import { renvoyerEmailConfirmationAction } from "./actions";

export default async function ConfirmerEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ erreur?: string; envoye?: string }>;
}) {
  const session = await getSession();
  if (!session?.user?.id) redirect("/connexion");

  const doitConfirmer = await utilisateurDoitConfirmerEmail(session.user.id);
  if (!doitConfirmer) {
    redirect("/apres-connexion");
  }

  const { erreur, envoye } = await searchParams;
  const email = session.user.email ?? "";

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6 py-8">
      <div className="rounded-[24px] border border-border bg-card p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-[#172935]">Confirmez votre adresse email</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Nous avons envoyé un lien de confirmation à{" "}
          <span className="font-medium text-foreground">{email}</span>. Cliquez sur le lien pour activer votre compte.
        </p>

        {erreur === "expire" && (
          <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Le lien a expiré. Demandez un nouvel email ci-dessous.
          </p>
        )}
        {erreur === "invalide" && (
          <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            Lien invalide ou déjà utilisé.
          </p>
        )}
        {envoye === "1" && (
          <p className="mt-4 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-800">
            Nouvel email envoyé — vérifiez votre boîte de réception.
          </p>
        )}

        <form action={renvoyerEmailConfirmationAction} className="mt-6">
          <button
            type="submit"
            className="flex h-11 w-full items-center justify-center rounded-full bg-primary text-sm font-semibold text-white"
          >
            Renvoyer l&apos;email
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Mauvaise adresse ?{" "}
          <Link href="/compte" className="font-medium text-primary hover:underline">
            Modifier dans Mon compte
          </Link>
        </p>
      </div>
    </div>
  );
}
