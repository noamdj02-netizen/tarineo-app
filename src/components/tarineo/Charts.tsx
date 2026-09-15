import { DEMO_MOIS } from "@/lib/uiDemo";

export function LineChart({
  series,
  height = 220,
}: {
  series: { nom: string; couleur: string; points: number[] }[];
  height?: number;
}) {
  const w = 560;
  const h = height;
  const padL = 40;
  const padR = 12;
  const padT = 12;
  const padB = 28;
  const min = -10;
  const max = 30;
  const xs = (i: number) => padL + (i * (w - padL - padR)) / (DEMO_MOIS.length - 1);
  const ys = (v: number) => padT + ((max - v) / (max - min)) * (h - padT - padB);
  const ticks = [30, 20, 10, 0, -10];

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-auto w-full" role="img">
      {ticks.map((t) => (
        <g key={t}>
          <line x1={padL} x2={w - padR} y1={ys(t)} y2={ys(t)} stroke="#EEF1F3" />
          <text x={0} y={ys(t) + 4} className="fill-[#8A97A0] text-[10px]">
            {t > 0 ? `+${t}%` : `${t}%`}
          </text>
        </g>
      ))}
      {series.map((s) => {
        const d = s.points.map((p, i) => `${i === 0 ? "M" : "L"} ${xs(i)} ${ys(p)}`).join(" ");
        return (
          <g key={s.nom}>
            <path d={d} fill="none" stroke={s.couleur} strokeWidth="2.5" strokeLinecap="round" />
            {s.points.map((p, i) => (
              <circle key={i} cx={xs(i)} cy={ys(p)} r="3.5" fill={s.couleur} />
            ))}
          </g>
        );
      })}
      {DEMO_MOIS.map((m, i) => (
        <text key={m} x={xs(i)} y={h - 6} textAnchor="middle" className="fill-[#8A97A0] text-[10px]">
          {m}
        </text>
      ))}
    </svg>
  );
}

export function DonutChart({
  total,
  slices,
}: {
  total: string;
  slices: { nom: string; pct: number; montant: number; couleur: string }[];
}) {
  let acc = 0;
  const gradient = slices
    .map((s) => {
      const start = acc;
      acc += s.pct;
      return `${s.couleur} ${start}% ${acc}%`;
    })
    .join(", ");

  return (
    <div className="flex flex-col items-center gap-6 lg:flex-row lg:items-center">
      <div className="relative size-[200px] shrink-0 rounded-full" style={{ background: `conic-gradient(${gradient})` }}>
        <div className="absolute inset-[34px] flex flex-col items-center justify-center rounded-full bg-white">
          <p className="text-xs text-muted-foreground">Total</p>
          <p className="text-xl font-semibold leading-none text-[#172935]">{total}</p>
        </div>
      </div>
      <ul className="flex w-full flex-col gap-2 text-sm">
        {slices.map((s) => (
          <li key={s.nom} className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2">
              <span className="size-2.5 rounded-full" style={{ background: s.couleur }} />
              {s.nom}
            </span>
            <span className="flex gap-4 text-muted-foreground">
              <span>{s.pct}%</span>
              <span className="w-16 text-right text-foreground">{new Intl.NumberFormat("fr-FR").format(s.montant)} €</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
