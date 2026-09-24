import { ArrowRight, Bot, LayoutDashboard, House, Shapes, CalendarDays } from "lucide-react";
import { StageBar } from "@/components/projects/stage-bar";
import { StatusBadge } from "@/components/projects/status-badge";
import type { ProjectStatus } from "@/lib/projects/types";

const DEMO: { name: string; text: string; status: ProjectStatus; stage: number; next: string }[] = [
  {
    name: "Studio Devis",
    text: "Devis et factures PDF pour artisans.",
    status: "focus",
    stage: 3,
    next: "Recruter 10 artisans bêta.",
  },
  {
    name: "Menu QR",
    text: "Cartes de restaurant par QR code.",
    status: "pause",
    stage: 2,
    next: "Finir la page tarifs.",
  },
  {
    name: "Portfolio",
    text: "Site vitrine d’une architecte.",
    status: "fini",
    stage: 6,
    next: "Livré, facture envoyée.",
  },
];

const NAV = [
  { icon: House, label: "Accueil" },
  { icon: LayoutDashboard, label: "Projets", active: true },
  { icon: Bot, label: "Assistant IA" },
  { icon: Shapes, label: "Schémas" },
  { icon: CalendarDays, label: "Planning" },
];

/** Aperçu de l'app dessiné en code (pas une capture) : reste net à toutes les tailles. */
export function ProductPreview() {
  return (
    <div
      aria-hidden
      className="overflow-hidden rounded-[22px] border border-line bg-bg p-1.5 shadow-lift sm:rounded-[28px] sm:p-2"
    >
      <div className="flex overflow-hidden rounded-[18px] bg-surface sm:rounded-[22px]">
        <div className="hidden w-[190px] flex-none flex-col gap-1 bg-side p-4 text-side-ink md:flex">
          <p className="mb-5 font-grotesk text-[18px] font-bold tracking-[-0.04em]">
            Navpit<span className="text-side-muted">.</span>
          </p>
          {NAV.map(({ icon: Icon, label, active }) => (
            <span
              key={label}
              className={
                "flex items-center gap-2.5 rounded-[10px] px-2.5 py-2 font-mono text-[10.5px] tracking-[0.1em] uppercase " +
                (active ? "border border-side-line bg-white/5" : "text-side-muted")
              }
            >
              <Icon className="size-3.5" />
              {label}
            </span>
          ))}
        </div>
        <div className="min-w-0 flex-1 p-4 sm:p-6">
          <p className="mono-label">/ Projets ///</p>
          <p className="mt-2 font-display text-[22px] leading-tight font-semibold tracking-tightest sm:text-[28px]">
            Mes projets <span className="text-accent-2">un seul en Focus.</span>
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {DEMO.map((p, i) => (
              <div
                key={p.name}
                className={
                  "flex flex-col gap-3 rounded-[16px] border border-line bg-surface p-4 shadow-soft " +
                  (i > 0 ? "hidden sm:flex" : "")
                }
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[16px] font-semibold tracking-[-0.02em]">{p.name}</p>
                    <p className="mt-0.5 text-[12.5px] leading-snug text-muted">{p.text}</p>
                  </div>
                  <StatusBadge status={p.status} />
                </div>
                <StageBar stage={p.stage} />
                <p className="flex items-start gap-2 rounded-[12px] bg-surface-2 p-2.5 text-[12.5px] leading-snug">
                  <ArrowRight className="mt-0.5 size-3.5 flex-none" />
                  <span>
                    <b className="font-semibold">Prochaine action :</b> {p.next}
                  </span>
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
