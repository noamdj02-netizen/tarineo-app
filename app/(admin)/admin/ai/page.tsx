import { RangeBar } from "@/components/admin/range-bar";
import { Kpi, Panel } from "@/components/admin/ui";
import { eur, formatDuration, n, pct } from "@/lib/admin/format";
import { loadAi } from "@/lib/admin/queries";
import { parseRange } from "@/lib/admin/range";

export const metadata = { title: "Copilote" };

export default async function AiPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string; from?: string; to?: string }>;
}) {
  const data = await loadAi(parseRange(await searchParams));
  return (
    <>
      <RangeBar />
      <Panel className="mb-4">
        <div className="grid grid-cols-2 divide-x divide-y divide-line md:grid-cols-4">
          <Kpi label="Requêtes IA" value={n(data.requests)} hint="prompts envoyés" />
          <Kpi label="Temps moyen" value={formatDuration(data.avg)} hint="réponse" />
          <Kpi label="P50" value={formatDuration(data.p50)} hint="médiane" />
          <Kpi label="P95" value={formatDuration(data.p95)} hint="lent" />
          <Kpi label="Taux de succès" value={pct(data.success)} hint="sans erreur" />
          <Kpi label="Erreurs" value={pct(data.errors)} hint={`${n(data.errorCount)} appels`} />
          <Kpi label="Coût IA estimé" value={eur(data.cost)} hint="~0,018€ / requête" />
          <Kpi label="Sessions avec IA" value={n(data.sessionsWith)} hint={`${n(data.sessionsWithout)} sans`} />
        </div>
      </Panel>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Agents les plus utilisés">
          <ul>
            {data.agents.length === 0 ? (
              <li className="px-4 py-8 text-[14px] text-muted-foreground">Aucun prompt sur la période.</li>
            ) : (
              data.agents.map((agent) => (
                <li key={agent.label} className="flex items-center justify-between gap-3 border-b border-line px-4 py-2.5 last:border-0">
                  <span>{agent.label}</span>
                  <span className="font-mono text-[12px] tabular-nums text-muted-foreground">
                    {pct(agent.share)} · {n(agent.count)}
                  </span>
                </li>
              ))
            )}
          </ul>
        </Panel>
        <Panel title="Temps avant / après l’agent">
          <div className="grid grid-cols-2 divide-x divide-line">
            <Kpi label="Avant le prompt" value={formatDuration(data.before)} hint="dans la session" />
            <Kpi label="Après la réponse" value={formatDuration(data.after)} hint="reste-t-il ?" />
          </div>
          <p className="px-4 py-3 text-[13px] text-muted-foreground">
            Si le temps après est plus long que le temps avant, le copilote ouvre une vraie suite de travail.
          </p>
        </Panel>
      </div>
    </>
  );
}
