import { Suspense } from "react";
import { loadAssistant } from "@/app/(app)/assistant/actions";
import { DocumentDrop } from "@/components/metier/document-drop";
import { DocumentList } from "@/components/metier/document-list";
import { PageHead } from "@/components/shell/page-head";
import { isAgentRole } from "@/lib/assistant/roles";
import { listChantiers, listDocuments, listParties } from "@/lib/metier/queries";
import { getViewer } from "@/lib/session";
import { APP_PAGES } from "@/lib/site/app-pages";
import { CopilotChatShell } from "./chat-shell";

export const metadata = { title: "Analyse" };

export default async function AnalysePage({
  searchParams,
}: {
  searchParams: Promise<{ chantier?: string; projet?: string; role?: string }>;
}) {
  const [{ chantier: slug, projet, role: rawRole }, viewer, chantiers, docs, clients] = await Promise.all([
    searchParams,
    getViewer(),
    listChantiers(),
    listDocuments({ direction: "in" }),
    listParties("client"),
  ]);
  const role = isAgentRole(rawRole) ? rawRole : "general";
  const selected = chantiers.find((c) => c.slug === slug || c.slug === projet) ?? null;
  const scoped = selected ? docs.filter((d) => d.chantier_slug === selected.slug) : docs;
  const data = await loadAssistant({ projectId: null, role });
  const p = APP_PAGES.analyse;

  return (
    <section className="flex flex-col gap-8">
      <PageHead mascot="06-loupe" label={p.label} title={p.title} tail={p.tail}>
        {p.text}
      </PageHead>
      <DocumentDrop chantiers={chantiers} clients={clients} />
      <DocumentList
        docs={scoped.slice(0, 6)}
        empty="Rien à analyser. Déposez un devis distributeur."
        clients={clients}
      />
      <div className="flex min-h-[420px] flex-col">
        <Suspense>
          <CopilotChatShell
            initial={data.history}
            presets={data.presets}
            keyMissing={!process.env.ANTHROPIC_API_KEY}
            firstName={viewer?.firstName}
            projects={chantiers.map((row) => ({
              id: row.id,
              slug: row.slug,
              name: row.name,
              status: row.status,
            }))}
            projectId={selected?.id ?? null}
            role={role}
          />
        </Suspense>
      </div>
    </section>
  );
}
