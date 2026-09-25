import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Liens vers les écrans détaillés (graphiques et objectifs BFA hors accueil). */
export function AccueilBandeauPilotage({ className }: { className?: string }) {
  return (
    <div
      className={`flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between ${className ?? ""}`}
    >
      <p className="text-sm text-muted-foreground">
        Dépenses, hausses et tendances détaillées sont dans <span className="font-medium text-foreground">Analyses</span>
        ; objectifs distributeur dans <span className="font-medium text-foreground">Fournisseurs</span>.
      </p>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" className="rounded-full" render={<Link href="/analyses" />}>
          Analyses
          <ArrowRightIcon className="size-4" />
        </Button>
        <Button size="sm" variant="outline" className="rounded-full" render={<Link href="/fournisseurs" />}>
          Fournisseurs
        </Button>
      </div>
    </div>
  );
}
