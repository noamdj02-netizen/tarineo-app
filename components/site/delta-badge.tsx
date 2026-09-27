import { Badge } from "@/components/ui/badge";
import {
  ALERT_THRESHOLD,
  euro,
  euroDelta,
  signedPct,
  variation,
} from "@/lib/site/tarineo";
import { cn } from "@/lib/utils";

/** Seuil (%) d'alerte, identique à l'app : au-delà, la hausse est mise en avant. */
export const IMPORTANT_CHANGE = ALERT_THRESHOLD;

const money = "font-display font-semibold tabular-nums tracking-tight";

/**
 * Pastille de variation de prix, identique dans toute la landing :
 * orange = hausse au-delà du seuil d’alerte (3 %), neutre = petite hausse, discret = stable, vert = baisse.
 */
export function DeltaBadge({
  value,
  size = "default",
  solid = false,
  className,
}: {
  value: number;
  size?: "default" | "lg";
  /** Orange plein (sur photo / vidéo). */
  solid?: boolean;
  className?: string;
}) {
  const stable = Math.abs(value) < 0.05;
  const tone = stable
    ? "stable"
    : value < 0
      ? "down"
      : value >= IMPORTANT_CHANGE
        ? "strong"
        : "up";

  return (
    <Badge
      variant="outline"
      className={cn(
        money,
        size === "lg" ? "h-7 px-2.5 text-[13px]" : "h-6 px-2 text-[12px]",
        tone === "strong" &&
          (solid
            ? "border-transparent bg-brand-orange text-white"
            : "border-brand-orange/40 bg-brand-orange/15 text-brand-orange-light"),
        tone === "up" && "border-white/15 bg-white/8 text-foreground",
        tone === "down" && "border-gain/30 bg-gain/10 text-gain",
        tone === "stable" &&
          "border-transparent bg-transparent font-medium text-muted-foreground",
        className,
      )}
    >
      {stable ? "Stable" : signedPct(value)}
    </Badge>
  );
}

/** Écart métier : d’abord les euros, le % en second. */
export function PriceMove({
  before,
  after,
  align = "end",
  className,
}: {
  before: number;
  after: number;
  align?: "end" | "start";
  className?: string;
}) {
  const delta = after - before;
  const pct = variation(before, after);
  const stable = Math.abs(pct) < 0.05;
  const strong = pct >= IMPORTANT_CHANGE;

  return (
    <span
      className={cn(
        "flex flex-col gap-0.5",
        align === "end" ? "items-end text-right" : "items-start text-left",
        className,
      )}
    >
      {stable ? (
        <span className={cn(money, "text-[15px] text-muted-foreground")}>
          Stable
        </span>
      ) : (
        <span
          className={cn(
            money,
            "text-[16px] leading-none",
            strong ? "text-brand-orange-light" : "text-foreground",
          )}
        >
          {euroDelta(delta)}
        </span>
      )}
      <span className="text-[12px] text-muted-foreground tabular-nums">
        {euro(before)} → {euro(after)}
        {stable ? null : ` · ${signedPct(pct)}`}
      </span>
    </span>
  );
}
