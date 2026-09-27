"use client";

import { motion, useReducedMotion } from "framer-motion";
import { EASE } from "@/components/motion/reveal";
import { PriceMove } from "@/components/site/delta-badge";
import { LandingFrame } from "@/components/site/landing-frame";
import { SupplierLogo } from "@/components/site/supplier-logo";
import { TarineoMark } from "@/components/site/tarineo-mark";
import {
  DASHBOARD_ALERTS,
  DASHBOARD_KPIS,
  DASHBOARD_MONTHS,
  DASHBOARD_SERIES,
  DEMO_MARK,
  DEMO_NOTE,
  euroInt,
  frDec,
  signedPct,
} from "@/lib/site/tarineo";
import { cn } from "@/lib/utils";

const W = 560;
const H = 148;
const PAD = 8;

function chartPath() {
  const min = Math.min(...DASHBOARD_SERIES) - 1;
  const max = Math.max(...DASHBOARD_SERIES) + 1;
  const pts = DASHBOARD_SERIES.map((v, i) => {
    const x = PAD + (i / (DASHBOARD_SERIES.length - 1)) * (W - PAD * 2);
    const y = PAD + (1 - (v - min) / (max - min)) * (H - PAD * 2);
    return [x, y] as const;
  });
  const line = pts
    .map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`)
    .join(" ");
  const area = `${line} L${pts.at(-1)![0].toFixed(1)} ${H} L${pts[0][0].toFixed(1)} ${H} Z`;
  return { line, area, last: pts.at(-1)! };
}

const CHART = chartPath();

function kpiLabel(k: (typeof DASHBOARD_KPIS)[number]) {
  if (k.kind === "euro") return euroInt(k.value);
  if (k.kind === "pct") return signedPct(k.value);
  return String(k.value);
}

/** Aperçu de l'application : impact, courbe, hausses. Données de démonstration. */
export function LandingDashboard() {
  const reduce = useReducedMotion();
  const view = { once: true, amount: 0.3 } as const;

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 20, scale: 0.985 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.7, ease: EASE }}
      className="relative mx-auto max-w-[1120px]"
    >
      <LandingFrame className="sm:rounded-[32px]" innerClassName="rounded-[22px] sm:rounded-[26px]">
        <div className="flex items-center gap-3 border-b border-border px-4 py-3 sm:px-5">
          <TarineoMark className="size-7" priority={false} />
          <p className="text-[14px] font-semibold">Tableau de bord</p>
          <span className="text-[13px] text-white/45">12 derniers mois</span>
          <span className="ml-auto font-display text-[11px] tracking-wide text-white/40 uppercase">
            {DEMO_MARK}
          </span>
        </div>

        <div className="grid gap-px bg-border lg:grid-cols-4">
          {DASHBOARD_KPIS.map((k, i) => (
            <motion.div
              key={k.label}
              initial={reduce ? false : { opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={view}
              transition={{ duration: 0.4, ease: EASE, delay: 0.08 + i * 0.05 }}
              className={cn(
                "bg-surface px-4 py-4 sm:px-5",
                "accent" in k && k.accent && "bg-alert-wash",
              )}
            >
              <p className="text-[12px] text-white/55">{k.label}</p>
              <p
                className={cn(
                  "mt-1.5 font-display text-[28px] leading-none font-semibold tracking-tight tabular-nums sm:text-[32px]",
                  "accent" in k && k.accent && "text-brand-orange-light",
                )}
              >
                {kpiLabel(k)}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="grid gap-px bg-border lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
          <div className="bg-surface px-4 py-4 sm:px-5">
            <div className="mb-3 flex items-end justify-between gap-3">
              <div>
                <p className="text-[15px] font-semibold">Indice de prix</p>
                <p className="text-[12px] text-white/50">Base 100 en octobre</p>
              </div>
              <p className="font-display text-[18px] font-semibold text-brand-orange-light tabular-nums">
                {frDec(DASHBOARD_SERIES[DASHBOARD_SERIES.length - 1])}
              </p>
            </div>
            <svg
              viewBox={`0 0 ${W} ${H + 22}`}
              className="h-auto w-full"
              role="img"
              aria-label="Courbe d’évolution des prix sur 12 mois, en hausse (démonstration)"
            >
              <defs>
                <linearGradient id="dash-area" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#ec5821" stopOpacity="0.32" />
                  <stop offset="1" stopColor="#ec5821" stopOpacity="0" />
                </linearGradient>
              </defs>
              {[0.25, 0.5, 0.75].map((f) => (
                <line
                  key={f}
                  x1="0"
                  x2={W}
                  y1={H * f}
                  y2={H * f}
                  stroke="rgba(255,255,255,0.08)"
                />
              ))}
              <motion.path
                d={CHART.area}
                fill="url(#dash-area)"
                initial={reduce ? false : { opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={view}
                transition={{ duration: 1, delay: 0.5 }}
              />
              <motion.path
                d={CHART.line}
                fill="none"
                stroke="#ec5821"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={reduce ? false : { pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={view}
                transition={{ duration: 1.4, ease: EASE, delay: 0.2 }}
              />
              <circle
                cx={CHART.last[0]}
                cy={CHART.last[1]}
                r="4.5"
                fill="#ff7a45"
                stroke="#101010"
                strokeWidth="2"
              />
              {DASHBOARD_MONTHS.map((m, i) =>
                i % 2 === 0 ? (
                  <text
                    key={m + i}
                    x={
                      PAD + (i / (DASHBOARD_MONTHS.length - 1)) * (W - PAD * 2)
                    }
                    y={H + 18}
                    textAnchor="middle"
                    className="fill-white/40 font-display text-[10px]"
                  >
                    {m}
                  </text>
                ) : null,
              )}
            </svg>
          </div>

          <div className="bg-surface">
            <div className="border-b border-border px-4 py-3 sm:px-5">
              <p className="text-[15px] font-semibold">Hausses relevées</p>
            </div>
            <ul>
              {DASHBOARD_ALERTS.map((a, i) => (
                <motion.li
                  key={`${a.supplier}-${a.product}`}
                  initial={reduce ? false : { opacity: 0, y: 6 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={view}
                  transition={{
                    duration: 0.3,
                    ease: EASE,
                    delay: 0.25 + i * 0.05,
                  }}
                  className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 last:border-b-0 sm:px-5"
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    <SupplierLogo name={a.supplier} size={28} />
                    <div className="min-w-0">
                      <p className="truncate text-[14px] font-medium">
                        {a.product}
                      </p>
                      <p className="text-[12px] text-white/45">{a.supplier}</p>
                    </div>
                  </div>
                  <PriceMove before={a.before} after={a.after} />
                </motion.li>
              ))}
            </ul>
          </div>
        </div>
      </LandingFrame>
      <p className="mt-4 text-center text-[15px] text-muted-foreground sm:text-base">
        {DEMO_NOTE}
      </p>
    </motion.div>
  );
}
