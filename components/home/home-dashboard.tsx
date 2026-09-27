import { FocusProjectCard, type FocusProject } from "@/components/home/focus-project-card";
import { HaussesWidget, PendingDocsWidget } from "@/components/home/dashboard-metier-widgets";
import { EnseignesWidget, YearSpendWidget } from "@/components/home/spend-widgets";
import { DocumentDrop } from "@/components/metier/document-drop";
import { Reveal, RevealGroup } from "@/components/motion/reveal";
import type { ChantierCard, DocumentCard, Party, PriceAlert } from "@/lib/metier/types";

export function HomeDashboard({
  firstName,
  chantiers,
  clients = [],
  pendingDocs = [],
  alerts = [],
  focus = null,
  months = [],
  enseignes = [],
}: {
  firstName?: string | null;
  chantiers: ChantierCard[];
  clients?: Party[];
  pendingDocs?: DocumentCard[];
  alerts?: PriceAlert[];
  focus?: FocusProject | null;
  months?: { key: string; label: string; amount: number }[];
  enseignes?: { label: string; amount: number }[];
}) {
  return (
    <RevealGroup className="mx-auto flex w-full max-w-[1080px] flex-col gap-5 pt-[1vh] pb-4 sm:pt-[2vh]">
      <header className="px-0.5">
        <p className="mono-label">{"/ Tableau de bord ///"}</p>
        <p className="mt-1 text-[14.5px] text-muted-foreground">
          {firstName ? `${firstName}, ` : ""}déposez, rangez, renvoyez.
        </p>
      </header>
      <Reveal>
        <DocumentDrop chantiers={chantiers} clients={clients} compact />
      </Reveal>
      <div className="grid gap-4 lg:grid-cols-2">
        <Reveal>
          <FocusProjectCard project={focus} />
        </Reveal>
        <div className="grid gap-4">
          <Reveal>
            <PendingDocsWidget docs={pendingDocs} />
          </Reveal>
          <Reveal>
            <HaussesWidget alerts={alerts} />
          </Reveal>
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Reveal>
          <YearSpendWidget months={months} />
        </Reveal>
        <Reveal>
          <EnseignesWidget rows={enseignes} />
        </Reveal>
      </div>
    </RevealGroup>
  );
}
