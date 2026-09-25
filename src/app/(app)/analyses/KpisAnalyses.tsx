import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

const euros = (n: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n);

export function KpisAnalyses({
  totalDepenses,
  impactHaussesEuros,
  nbHaussesPeriode,
  nbHaussesActives,
  nbAVerifier,
  periodeMois,
}: {
  totalDepenses: number;
  impactHaussesEuros: number;
  nbHaussesPeriode: number;
  nbHaussesActives: number;
  nbAVerifier: number;
  periodeMois: number;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <Card className="rounded-[20px] ring-0">
        <CardContent className="p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Dépenses ({periodeMois} mois)
          </p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-foreground">{euros(totalDepenses)}</p>
          <p className="mt-1 text-xs text-muted-foreground">Achats fournisseurs validés</p>
        </CardContent>
      </Card>
      <Card className="rounded-[20px] ring-0">
        <CardContent className="p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Impact hausses</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-foreground">
            {impactHaussesEuros > 0 ? euros(impactHaussesEuros) : "—"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {nbHaussesPeriode > 0 ? (
              <Link href="/documents?hausse=1" className="font-medium text-primary hover:underline">
                {nbHaussesPeriode} hausse{nbHaussesPeriode > 1 ? "s" : ""} sur la période
              </Link>
            ) : (
              "Aucune hausse sur la période"
            )}
            {nbHaussesActives > 0 && ` · ${nbHaussesActives} alerte${nbHaussesActives > 1 ? "s" : ""} non lue${nbHaussesActives > 1 ? "s" : ""}`}
          </p>
        </CardContent>
      </Card>
      <Card className="rounded-[20px] ring-0">
        <CardContent className="p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">À traiter</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-foreground">{nbAVerifier}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {nbAVerifier > 0 ? (
              <Link href="/documents?verifier=1" className="font-medium text-primary hover:underline">
                Documents distributeur à vérifier
              </Link>
            ) : (
              "Tout est à jour"
            )}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
