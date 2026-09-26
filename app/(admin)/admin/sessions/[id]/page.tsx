import Link from "next/link";
import { notFound } from "next/navigation";
import { Kpi, Panel } from "@/components/admin/ui";
import { formatClock, formatDuration } from "@/lib/admin/format";
import { loadSession } from "@/lib/admin/queries";

export const metadata = { title: "Session" };

const LABELS: Record<string, string> = {
  session_started: "Connexion",
  session_ended: "Déconnexion",
  page_viewed: "Page",
  project_opened: "Ouverture projet",
  project_created: "Projet créé",
  project_focus_started: "Focus démarré",
  project_focus_changed: "Focus changé",
  task_created: "Tâche ajoutée",
  task_completed: "Tâche faite",
  copilot_opened: "Copilote ouvert",
  copilot_prompt_sent: "Prompt envoyé",
  copilot_response_received: "Réponse IA",
  copilot_error: "Erreur IA",
  resource_opened: "Ressources",
  pricing_viewed: "Prix",
};

export default async function SessionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await loadSession(id);
  if (!session) notFound();
  return (
    <>
      <p className="mb-2">
        <Link href="/admin/sessions" className="text-[13px] text-muted-foreground hover:text-ink">
          ← Sessions
        </Link>
      </p>
      <h1 className="mb-4 font-display text-[28px] font-semibold tracking-tightest">
        Session #{id.slice(0, 4).toUpperCase()}
      </h1>
      <Panel className="mb-4">
        <div className="grid grid-cols-2 divide-x divide-line md:grid-cols-5">
          <Kpi label="Durée" value={formatDuration(session.durationMs)} hint={session.label} />
          <Kpi label="Actions" value={String(session.actions)} hint={`${session.pages} pages`} />
          <Kpi label="Features" value={String(session.features)} hint="utilisées" />
          <Kpi label="Requêtes IA" value={String(session.ai)} hint="prompts" />
          <Kpi label="Erreurs" value={String(session.errors)} hint="copilote" />
        </div>
      </Panel>
      <Panel title="Fil de la session">
        <ol className="divide-y divide-line">
          {session.events.map((event) => (
            <li key={event.id} className="grid grid-cols-[88px_1fr] gap-3 px-4 py-2.5 text-[14px]">
              <time className="font-mono text-[12px] text-muted-foreground" dateTime={event.created_at}>
                {formatClock(event.created_at)}
              </time>
              <div>
                <p>{LABELS[event.name] ?? event.name}</p>
                {event.path ? <p className="font-mono text-[11px] text-muted-foreground">{event.path}</p> : null}
              </div>
            </li>
          ))}
        </ol>
      </Panel>
    </>
  );
}
