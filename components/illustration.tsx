import { ILLUSTRATIONS, type IllustrationName } from "@/lib/illustrations";
import { cn } from "@/lib/utils";

const pct = (v: string) =>
  v
    .split(" ")
    .map((n) => `${n}%`)
    .join(" ");

/**
 * Illustration au trait (Figma). Carrée ; la taille vient de `className` (ex. `size-28`).
 * Décorative par défaut ; passe `label` si elle porte un sens.
 */
export function Illustration({
  name,
  className,
  label,
}: {
  name: IllustrationName;
  className?: string;
  label?: string;
}) {
  const { box, layers } = ILLUSTRATIONS[name];
  const [left, top, width, height] = box.map((v) => `${(v / 320) * 100}%`);
  return (
    <div
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={cn("relative aspect-square flex-none select-none", className)}
    >
      <div className="absolute" style={{ left, top, width, height }}>
        {layers.map(([layer, inset, bleed]) => (
          <div key={layer} className="absolute -scale-y-100" style={{ inset: pct(inset) }}>
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
