import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const NODES: { kind: "step" | "gate"; label: string }[] = [
  { kind: "step", label: "Post LinkedIn vu" },
  { kind: "step", label: "Landing Relais" },
  { kind: "gate", label: "S’inscrit ?" },
  { kind: "step", label: "Brief de marque" },
  { kind: "step", label: "Premier post" },
  { kind: "gate", label: "Il publie ?" },
  { kind: "step", label: "Calendrier" },
  { kind: "gate", label: "Passe Pro ?" },
  { kind: "step", label: "Publication auto" },
];

const CANVAS_W = 220;
const STEP_W = 168;
const STEP_H = 38;
const GATE = 62;
const GAP = 16;
const PAD_Y = 14;

const FLOW = (() => {
  const cx = CANVAS_W / 2;
  let y = PAD_Y;
  const items = NODES.map((n) => {
    const h = n.kind === "gate" ? GATE : STEP_H;
    const item = { ...n, y, h, cy: y + h / 2, cx };
    y += h + GAP;
    return item;
  });
  return { items, height: y - GAP + PAD_Y };
})();

export function LandingSchemaPreview() {
  return (
    <article className="relative flex flex-col gap-2.5">
      <div className="flex items-center gap-2">
        <span
          aria-hidden
          className="grid size-9 flex-none place-items-center rounded-pill border border-line bg-surface"
        >
          <ArrowLeft className="size-3.5" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[17px] font-semibold tracking-[-0.03em]">
            <Link
              href="/inscription"
              className="outline-none after:absolute after:inset-0 after:rounded-card focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-ink"
            >
              Parcours utilisateur · Relais
            </Link>
          </h3>
          <p className="mono-label truncate">{`/ Relais`}</p>
        </div>
        <p className="font-mono text-[11px] text-muted-foreground">Enregistré</p>
      </div>

      <div className="overflow-hidden rounded-card border border-line bg-surface">
        <svg
          viewBox={`0 0 ${CANVAS_W} ${FLOW.height}`}
          className="mx-auto block w-full max-w-[260px] text-ink"
          role="img"
          aria-label="Parcours Relais : découverte, landing, inscription, premier post, calendrier, offre Pro."
        >
          {FLOW.items.map((node, i) => {
            const prev = FLOW.items[i - 1];
            const x = node.cx - STEP_W / 2;
            return (
              <g key={node.label}>
                {prev ? (
                  <path
                    d={`M${node.cx} ${prev.y + prev.h + 2} V${node.y - 7} M${node.cx - 3.6} ${node.y - 13} L${node.cx} ${node.y - 4} L${node.cx + 3.6} ${node.y - 13}`}
                    fill="none"
                    stroke="currentColor"
                    strokeOpacity="0.7"
                    strokeWidth="1.35"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                ) : null}
                {node.kind === "gate" ? (
                  <rect
                    x={node.cx - 21}
                    y={node.cy - 21}
                    width="42"
                    height="42"
                    rx="3"
                    transform={`rotate(45 ${node.cx} ${node.cy})`}
                    fill="var(--color-surface)"
                    stroke="currentColor"
                    strokeOpacity="0.75"
                    strokeWidth="1.4"
                  />
                ) : (
                  <rect
                    x={x}
                    y={node.y}
                    width={STEP_W}
                    height={STEP_H}
                    rx="7"
                    fill="var(--color-surface)"
                    stroke="currentColor"
                    strokeOpacity="0.75"
                    strokeWidth="1.4"
                  />
                )}
                <FlowLabel
                  x={node.cx}
                  y={node.cy}
                  gate={node.kind === "gate"}
                  label={node.label}
                />
              </g>
            );
          })}
        </svg>
        <p className="sr-only">
          Parcours Relais : un post LinkedIn mène à la landing, à l’inscription,
          au brief, au premier post, puis au calendrier et à l’offre Pro.
        </p>
      </div>
    </article>
  );
}

function FlowLabel({
  x,
  y,
  gate,
  label,
}: {
  x: number;
  y: number;
  gate: boolean;
  label: string;
}) {
  const lines = gate ? splitGate(label) : [label];
  const start = y - ((lines.length - 1) * 11) / 2;
  return (
    <text
      x={x}
      y={start}
      textAnchor="middle"
      dominantBaseline="middle"
      fill="currentColor"
      style={{
        fontFamily: "var(--font-sans)",
        fontSize: gate ? 10 : 12,
        fontWeight: 500,
        letterSpacing: "-0.02em",
      }}
    >
      {lines.map((line, i) => (
        <tspan key={`${i}-${line}`} x={x} dy={i === 0 ? 0 : 11}>
          {line}
        </tspan>
      ))}
    </text>
  );
}

function splitGate(label: string) {
  const i = label.lastIndexOf(" ");
  if (i < 0) return [label];
  return [label.slice(0, i), label.slice(i + 1)];
}
