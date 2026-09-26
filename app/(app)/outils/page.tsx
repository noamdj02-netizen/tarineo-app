import { ChevronDown, Workflow } from "lucide-react";
import { ConnectorsBoard } from "@/components/connectors/connectors-board";
import { PageHead } from "@/components/shell/page-head";
import { FigmaMethod } from "@/components/workflow/figma-method";
import { markGoogleBound } from "@/lib/connectors/actions";
import { loadConnectorSignals } from "@/lib/connectors/signals";

export const metadata = { title: "Outils" };

export default async function OutilsPage({
  searchParams,
}: {
  searchParams: Promise<{ bound?: string; erreur?: string }>;
}) {
  const { bound, erreur } = await searchParams;
  if (bound === "gmail") await markGoogleBound("gmail");
  if (bound === "drive") await markGoogleBound("google-drive");
  const signals = await loadConnectorSignals();

  return (
    <section>
      <PageHead
        art="dashboard-depenses"
        label="Outils"
        title="Ta stack,"
        tail="liée officiellement."
      >
        Chaque app se connecte pour de vrai : Gmail via Google, Stripe avec une
        clé restreinte, les autres avec leur URL de compte. Tu restes sur
        Navpit. Les deux apps bossent ensemble.
      </PageHead>
      {erreur === "google" ? (
        <p role="alert" className="mb-4 text-[14px] text-destructive">
          Google n’a pas lié le compte. Réessaie, ou colle l’adresse Gmail.
        </p>
      ) : null}

      <ConnectorsBoard initial={signals} />

      <details
        id="figma-cursor"
        className="group mt-12 border-t border-line pt-8"
      >
        <summary className="flex min-h-11 cursor-pointer list-none items-center gap-3 [&::-webkit-details-marker]:hidden">
          <span className="grid size-8 place-items-center rounded-lg bg-accent-soft">
            <Workflow className="size-4" aria-hidden />
          </span>
          <span className="flex-1">
            <b className="block text-[18px] font-semibold tracking-[-0.02em]">
              Figma → Cursor, sans perte
            </b>
            <small className="block text-[13.5px] text-muted-foreground">
              Pourquoi le code ne ressemble jamais à ta maquette, et la méthode
              en 7 étapes.
            </small>
          </span>
          <ChevronDown
            className="size-5 text-muted-foreground transition-transform duration-300 group-open:rotate-180"
            aria-hidden
          />
        </summary>
        <div className="mt-6">
          <FigmaMethod />
        </div>
      </details>
    </section>
  );
}
