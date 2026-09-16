import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { creerChantier } from "../actions";

export default async function NouveauChantierPage({
  searchParams,
}: {
  searchParams: Promise<{ erreur?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/connexion");
  const { erreur } = await searchParams;

  return (
    <div className="mx-auto w-full max-w-lg py-6">
      <Link href="/chantiers" className="text-sm text-muted-foreground hover:text-foreground">
        ← Chantiers
      </Link>
      <h1 className="mt-4 text-2xl font-semibold text-foreground">Nouveau chantier</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Donnez un nom clair (ex. « Rénovation SDB — Dupont »). Vous lierez ensuite devis et achats.
      </p>

      <form action={creerChantier} className="mt-8 flex flex-col gap-4 rounded-[24px] bg-card p-6">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium">Nom du chantier</span>
          <input
            name="nom"
            required
            placeholder="Rénovation salle de bain — Dupont"
            className="h-12 rounded-xl border border-border bg-white px-4 outline-none focus:border-primary"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium">Client (optionnel)</span>
          <input
            name="clientNom"
            placeholder="Jean Dupont"
            className="h-12 rounded-xl border border-border bg-white px-4 outline-none focus:border-primary"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium">Notes (optionnel)</span>
          <textarea
            name="notes"
            rows={3}
            placeholder="Adresse, contexte…"
            className="rounded-xl border border-border bg-white px-4 py-3 outline-none focus:border-primary"
          />
        </label>
        {erreur && <p className="text-sm text-primary">Vérifiez le nom du chantier.</p>}
        <button type="submit" className="mt-2 h-12 rounded-full bg-primary font-semibold text-white">
          Créer le chantier
        </button>
      </form>
    </div>
  );
}
