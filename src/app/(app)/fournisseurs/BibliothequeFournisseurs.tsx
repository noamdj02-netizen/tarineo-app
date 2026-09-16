import Link from "next/link";
import type { FournisseurBibliotheque } from "@/lib/fournisseursPage";
import { FiltreBibliotheque } from "./FiltreBibliotheque";

const formaterEuros = (v: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(v);

function cumulerParGroupe(fournisseurs: FournisseurBibliotheque[]) {
  const importes = fournisseurs.filter((f) => f.importe);
  const parGroupe = new Map<string, { depenses: number; enseignes: string[] }>();
  for (const f of importes) {
    if (!f.groupe) continue;
    const entree = parGroupe.get(f.groupe) ?? { depenses: 0, enseignes: [] };
    entree.depenses += f.depenses;
    entree.enseignes.push(f.nom);
    parGroupe.set(f.groupe, entree);
  }
  return [...parGroupe.entries()]
    .filter(([, v]) => v.enseignes.length > 1)
    .sort((a, b) => b[1].depenses - a[1].depenses);
}

export function BibliothequeFournisseurs({ fournisseurs }: { fournisseurs: FournisseurBibliotheque[] }) {
  const importes = fournisseurs.filter((f) => f.importe);
  const topDepenses = importes.length > 0 ? [...importes].sort((a, b) => b.depenses - a.depenses)[0] : null;
  const topHausses = importes.length > 0 ? [...importes].sort((a, b) => b.hausses - a.hausses)[0] : null;
  const plusRecent =
    importes.length > 0
      ? [...importes].sort((a, b) => (b.dernierImport?.getTime() ?? 0) - (a.dernierImport?.getTime() ?? 0))[0]
      : null;
  const groupes = cumulerParGroupe(fournisseurs);

  return (
    <div className="mb-6 space-y-5">
      <div className="rounded-[20px] border border-[#E6E9EB] bg-white p-5">
        <h2 className="text-base font-semibold text-foreground">Veille promos &amp; prix</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Tarineo ne publie pas de prix « marché » génériques : on compare vos achats à{" "}
          <strong className="font-medium text-foreground">votre historique personnel</strong>. Les promos enseigne
          arriveront avec l&apos;agent fournisseur (transfert de vos newsletters) — en attendant, importez vos devis
          récents pour détecter les hausses.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            href="/veille"
            className="rounded-full bg-[#FFF0E8] px-4 py-2 text-sm font-medium text-primary hover:bg-[#FFE4D4]"
          >
            Voir la veille (dérives silencieuses)
          </Link>
          <Link
            href="/documents"
            className="rounded-full border border-[#E6E9EB] px-4 py-2 text-sm text-foreground hover:bg-[#F8F8F8]"
          >
            Importer un document
          </Link>
        </div>
      </div>

      {importes.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-3">
          {topDepenses && (
            <div className="rounded-[16px] border border-[#E6E9EB] bg-[#FFF7F2] px-4 py-3 text-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-primary">Plus de volume</p>
              <p className="mt-1 font-medium text-foreground">{topDepenses.nom}</p>
              <p className="text-muted-foreground">{formaterEuros(topDepenses.depenses)} sur la période</p>
            </div>
          )}
          {topHausses && topHausses.hausses > 0 && (
            <div className="rounded-[16px] border border-[#E6E9EB] bg-white px-4 py-3 text-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Plus d&apos;alertes</p>
              <p className="mt-1 font-medium text-foreground">{topHausses.nom}</p>
              <p className="text-muted-foreground">
                {topHausses.hausses} hausse{topHausses.hausses > 1 ? "s" : ""} détectée
                {topHausses.hausses > 1 ? "s" : ""}
              </p>
            </div>
          )}
          {plusRecent?.dernierImport && (
            <div className="rounded-[16px] border border-[#E6E9EB] bg-white px-4 py-3 text-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Dernier import</p>
              <p className="mt-1 font-medium text-foreground">{plusRecent.nom}</p>
              <p className="text-muted-foreground">
                {plusRecent.dernierImport.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
              </p>
            </div>
          )}
        </div>
      )}

      {groupes.length > 0 && (
        <div className="rounded-[20px] border border-[#E6E9EB] bg-white p-5">
          <h2 className="text-base font-semibold text-foreground">Vos achats par groupe</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Plusieurs enseignes appartiennent au même groupe : le volume cumulé compte souvent dans la négociation
            de vos conditions annuelles.
          </p>
          <ul className="mt-4 space-y-3">
            {groupes.map(([groupe, infos]) => (
              <li
                key={groupe}
                className="flex flex-wrap items-baseline justify-between gap-2 border-t border-[#F0F1F1] pt-3 first:border-0 first:pt-0"
              >
                <div className="min-w-0">
                  <p className="font-medium text-foreground">{groupe}</p>
                  <p className="text-xs text-muted-foreground">{infos.enseignes.join(" · ")}</p>
                </div>
                <p className="text-lg font-semibold text-primary">{formaterEuros(infos.depenses)}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="rounded-[20px] border border-[#E6E9EB] bg-white p-5">
        <h2 className="text-base font-semibold text-foreground">
          Catalogue enseignes ({fournisseurs.length})
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Cedeo, Point P, Rexel, Sonepar, Tereva, Gedimat, BigMat, Leroy Merlin… Cliquez sur une enseigne pour voir
          sa fiche, vos dépenses si vous l&apos;avez déjà importée, et bientôt ses promos.
        </p>
        <div className="mt-4">
          <FiltreBibliotheque fournisseurs={fournisseurs} />
        </div>
      </div>
    </div>
  );
}
