import { cn } from "@/lib/utils";
import { LABELS_STATUT } from "@/lib/documentLabels";

const BASE =
  "inline-flex shrink-0 items-center rounded-full border px-2.5 py-0.5 text-xs font-medium";

const STYLES_STATUT: Record<string, string> = {
  PROCESSING:
    "border-[var(--app-badge-neutral-border)] bg-[var(--app-badge-neutral-bg)] text-[var(--app-badge-neutral-fg)]",
  NEEDS_REVIEW:
    "border-[var(--app-badge-warning-bg)] bg-[var(--app-badge-warning-bg)] text-[var(--app-badge-warning-fg)]",
  VALIDATED:
    "border-[var(--app-badge-success-bg)] bg-[var(--app-badge-success-bg)] text-[var(--app-badge-success-fg)]",
  ERROR:
    "border-[var(--app-badge-alert-bg)] bg-[var(--app-badge-alert-bg)] text-[var(--app-badge-alert-fg)]",
};

export function BadgeStatutDocument({
  statut,
  className,
}: {
  statut: string;
  className?: string;
}) {
  return (
    <span className={cn(BASE, STYLES_STATUT[statut] ?? STYLES_STATUT.PROCESSING, className)}>
      {LABELS_STATUT[statut] ?? statut}
    </span>
  );
}

export function BadgeHaussePrix({
  label,
  haussePositive,
  hausseNegative: _hausseNegative,
  className,
}: {
  label: string;
  haussePositive?: boolean;
  hausseNegative?: boolean;
  className?: string;
}) {
  const style = haussePositive
    ? "border-[var(--app-badge-alert-bg)] bg-[var(--app-badge-alert-bg)] text-[var(--app-badge-alert-fg)]"
    : "border-[var(--app-badge-success-bg)] bg-[var(--app-badge-success-bg)] text-[var(--app-badge-success-fg)]";

  return (
    <span className={cn(BASE, style, className)}>
      {label}
    </span>
  );
}

export function BadgeDoublon({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        BASE,
        "border-[var(--app-badge-warning-bg)] bg-[var(--app-badge-warning-bg)] text-[var(--app-badge-warning-fg)]",
        className
      )}
    >
      Doublon ?
    </span>
  );
}

export function BadgeConfiance({ pct, className }: { pct: number; className?: string }) {
  const faible = pct < 90;
  return (
    <span
      className={cn(
        BASE,
        faible
          ? "border-[var(--app-badge-warning-bg)] bg-[var(--app-badge-warning-bg)] text-[var(--app-badge-warning-fg)]"
          : "border-[var(--app-badge-neutral-border)] bg-[var(--app-badge-neutral-bg)] text-[var(--app-badge-neutral-fg)]",
        className
      )}
    >
      {pct}% confiance
    </span>
  );
}
