import Link from "next/link";
import { requireOwner } from "@/lib/admin/guard";
import { loadAdminStats, type AdminStats, type BarRow } from "@/lib/admin/stats";
import { PLAN_LABEL, type PlanId } from "@/lib/billing/plans";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Analyses",
  robots: { index: false, follow: false },
};

const dayLabel = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short" });
const when = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

function formatWhen(iso: string | null) {
  if (!iso) return "Jamais";
  return when.format(new Date(iso));
}

function AreaChart({ counts }: { counts: number[] }) {
  const width = 720;
  const height = 168;
  const max = Math.max(1, ...counts);
  const step = counts.length > 1 ? width / (counts.length - 1) : width;
  const points = counts.map((count, index) => {
    const x = index * step;
    const y = height - 12 - (count / max) * (height - 24);
    return `${x},${y}`;
  });
  const line = `M${points.join(" L")}`;
  const area = `${line} L${width},${height} L0,${height} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-40 w-full" role="img" aria-label="Nouveaux comptes sur 30 jours">
      <line x1="0" y1={height - 12} x2={width} y2={height - 12} stroke="rgba(17,17,17,0.08)" />
      <path d={area} fill="#16a34a" opacity="0.16" />
      <path d={line} fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

function Metric({
  label,
  value,
  hint,
  tone,
  selected,
}: {
  label: string;
  value: number;
  hint: string;
  tone?: "up" | "down";
  selected?: boolean;
}) {
  return (
    <div className={selected ? "border-t-2 border-t-st-focus px-4 py-3" : "border-t-2 border-t-transparent px-4 py-3"}>
      <p className="text-[13px] text-muted-foreground">{label}</p>
      <p className="mt-1 text-[26px] leading-none font-semibold tracking-tight tabular-nums">{value}</p>
      <p
        className={`mt-1 text-[12px] tabular-nums ${tone === "up" ? "font-medium text-st-focus-ink" : tone === "down" ? "font-medium text-st-fini" : "text-muted-foreground"}`}
      >
        {hint}
      </p>
    </div>
  );
}

function Report({ title, rows }: { title: string; rows: BarRow[] }) {
  const max = Math.max(1, ...rows.map((row) => row.count));
  const total = rows.reduce((sum, row) => sum + row.count, 0) || 1;
  return (
    <section className="overflow-hidden rounded-[12px] border border-line bg-surface">
      <h2 className="border-b border-line px-4 py-3 text-[14px] font-semibold">{title}</h2>
      <ul>
        {rows.map((row) => {
          const width = Math.round((row.count / max) * 100);
          const share = Math.round((row.count / total) * 100);
          return (
            <li key={row.label} className="relative">
              <div className="absolute inset-y-0 left-0 bg-st-focus-soft" style={{ width: `${width}%` }} />
              <div className="relative flex items-center gap-3 px-4 py-2.5 text-[14px]">
                <span className="min-w-0 flex-1 truncate">{row.label}</span>
                <span className="tabular-nums text-muted-foreground">{row.count}</span>
                <span className="w-10 text-right text-[12px] tabular-nums text-muted-foreground">{share}%</span>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function PlanText({ plan, paid }: { plan: PlanId; paid: boolean }) {
  return <span className={paid ? "font-medium text-st-focus-ink" : "text-muted-foreground"}>{PLAN_LABEL[plan]}</span>;
}

function Dashboard({ stats }: { stats: AdminStats }) {
  const first = stats.series[0];
  const last = stats.series[stats.series.length - 1];

  return (
    <>
      <section className="overflow-hidden rounded-[12px] border border-line bg-surface shadow-soft">
        <div className="grid grid-cols-2 divide-x divide-y divide-line lg:grid-cols-4 lg:divide-y-0">
          <Metric
            label="Nouveaux comptes"
            value={stats.newSignups}
            selected
            tone={stats.signupDelta == null ? undefined : stats.signupDelta >= 0 ? "up" : "down"}
            hint={
              stats.signupDelta == null
                ? "30 derniers jours"
                : `${stats.signupDelta > 0 ? "+" : ""}${stats.signupDelta}% vs 30 j. d’avant`
            }
          />
          <Metric label="Connectés, 7 jours" value={stats.activeWeek} hint="Cette semaine" />
          <Metric label="Onboarding fini" value={stats.onboarded} hint="Au total" />
          <Metric label="Abonnés" value={stats.paid} hint="Au total" />
        </div>
        <div className="border-t border-line px-2 pt-2">
          <AreaChart counts={stats.series.map((point) => point.count)} />
          <div className="flex justify-between px-2 pb-3 text-[11px] text-muted-foreground">
            <span>{first ? dayLabel.format(new Date(`${first.day}T00:00:00.000Z`)) : ""}</span>
            <span>{last ? dayLabel.format(new Date(`${last.day}T00:00:00.000Z`)) : ""}</span>
          </div>
        </div>
      </section>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Report title="Où ils s’arrêtent" rows={stats.funnel.map((step) => ({ label: step.step, count: step.count }))} />
        <Report title="Offres" rows={stats.plans} />
      </div>

      <section className="mt-4 overflow-hidden rounded-[12px] border border-line bg-surface">
        <h2 className="border-b border-line px-4 py-3 text-[14px] font-semibold">Comptes · {stats.signedUp}</h2>
        {stats.people.length === 0 ? (
          <p className="px-4 py-6 text-[14px] text-muted-foreground">Personne pour l’instant.</p>
        ) : (
          <ul>
            {stats.people.map((person) => (
              <li key={person.id} className="border-b border-line px-4 py-3 last:border-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-[14px] font-medium">{person.name}</p>
                    <p className="truncate text-[13px] text-muted-foreground">{person.email}</p>
                  </div>
                  <p className="shrink-0 text-right text-[13px]">
                    <span className="block">{person.stop}</span>
                    <PlanText plan={person.plan} paid={person.paid} />
                  </p>
                </div>
                <p className="mt-1 text-[12px] text-muted-foreground">
                  Connexion {formatWhen(person.lastSignIn)}
                  <span> · </span>
                  {person.projects} projet{person.projects > 1 ? "s" : ""}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}

export default async function AdminPage() {
  await requireOwner();
  let stats: AdminStats | null = null;
  try {
    stats = await loadAdminStats();
  } catch {
    stats = null;
  }

  return (
    <>
      <header className="mb-4 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <Link href="/compte" className="text-[13px] text-muted-foreground hover:text-ink">
            navpit.com
          </Link>
          <h1 className="text-[20px] leading-tight font-semibold tracking-tight">Analyses</h1>
        </div>
        <p className="shrink-0 rounded-[8px] border border-line bg-surface px-3 py-2 text-[13px]">30 derniers jours</p>
      </header>
      {stats ? (
        <Dashboard stats={stats} />
      ) : (
        <p className="rounded-[12px] border border-line bg-surface px-4 py-6 text-[14px] text-muted-foreground">
          Impossible de lire les comptes pour le moment.
        </p>
      )}
    </>
  );
}
