import type { CSSProperties } from "react";
import { ILLUSTRATIONS, type IllustrationName } from "@/lib/illustrations";
import { cn } from "@/lib/utils";

const pct = (v: string) =>
  v
    .split(" ")
    .map((n) => `${n}%`)
    .join(" ");

const LAYER_DEPTH: Record<string, number> = { fond: 0, accent: 0.55, trait: 1 };
const PRESERVE: CSSProperties = { transformStyle: "preserve-3d" };

/**
 * Illustration au trait (Figma). Carrée ; la taille vient de `className` (ex. `size-28`).
 * Décorative par défaut ; passe `label` si elle porte un sens.
 * `depth` (px) décolle les calques en 3D ; le parent doit porter la perspective.
 */
export function Illustration({
  name,
  className,
  label,
  depth = 0,
}: {
  name: IllustrationName;
  className?: string;
  label?: string;
  depth?: number;
}) {
  const { box, layers } = ILLUSTRATIONS[name];
  const [left, top, width, height] = box.map((v) => `${(v / 320) * 100}%`);
  const d = depth > 0;
  return (
    <div
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={cn("relative aspect-square flex-none select-none", className)}
      style={d ? PRESERVE : undefined}
    >
      <div
        className="absolute"
        style={{ left, top, width, height, ...(d ? PRESERVE : null) }}
      >
        {layers.map(([layer, inset, bleed]) => (
          <div
            key={layer}
            className="absolute -scale-y-100"
            style={{
              inset: pct(inset),
              ...(d
                ? {
                    ...PRESERVE,
                    transform: `translateZ(${(LAYER_DEPTH[layer] ?? 1) * depth}px)`,
                  }
                : null),
            }}
          >
            <div className="absolute" style={{ inset: bleed ? pct(bleed) : 0 }}>
              {/* eslint-disable-next-line @next/next/no-img-element -- SVG statique étiré dans sa zone, comme dans Figma */}
              <img
                src={`/illustrations/${name}-${layer}.svg`}
                alt=""
                draggable={false}
                className="block size-full max-w-none"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
