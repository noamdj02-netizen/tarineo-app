import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { accepterInvitationEquipe } from "@/lib/equipe";
import { PageCard, PageHeader } from "@/components/tarineo/PageHeader";

export default async function InvitationPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const session = await getSession();

  if (!session?.user?.id) {
    redirect(`/connexion?callbackUrl=${encodeURIComponent(`/invitation/${token}`)}`);
  }

  const resultat = await accepterInvitationEquipe(token, session.user.id);

  return (
    <div className="mx-auto max-w-lg py-10">
      <PageHeader title="Invitation équipe" />
      <PageCard className="mt-4">
        {resultat.succes ? (
          <>
            <p className="text-sm text-foreground">Vous avez rejoint l&apos;équipe avec succès.</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Vous accédez maintenant à l&apos;espace documents et alertes de votre entreprise.
            </p>
            <Link href="/accueil" className="mt-4 inline-flex app-btn-primary text-sm">
              Accéder à l&apos;accueil
            </Link>
          </>
        ) : (
          <>
            <p className="text-sm text-red-500">{resultat.erreur}</p>
            <Link href="/parametres?onglet=equipe" className="mt-4 inline-flex app-btn-secondary text-sm">
              Retour aux paramètres
            </Link>
          </>
        )}
      </PageCard>
    </div>
  );
}
