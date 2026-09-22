import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { MobilePageHeader } from "@/components/tarineo/mobile/MobilePageHeader";
import { PageHeader } from "@/components/tarineo/PageHeader";
import { Button } from "@/components/ui/button";

export default async function ChantiersPage() {
  const session = await getSession();
  if (!session?.user?.id) redirect("/connexion");

  return (
    <div>
      <MobilePageHeader title="Chantiers" subtitle="Suivi de marge par chantier" />
      <div className="hidden lg:block">
        <PageHeader title="Chantiers" subtitle="Suivi de marge par chantier — bientôt disponible." />
      </div>
      <section className="rounded-2xl border border-border bg-card p-6 text-center">
        <p className="text-base font-medium text-foreground">Fonctionnalité en préparation</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Le suivi chantier par marge arrive prochainement. En attendant, consultez vos analyses de dépenses.
        </p>
        <Button className="mt-4 rounded-full" render={<Link href="/analyses" />}>
          Voir les analyses
        </Button>
      </section>
    </div>
  );
}
