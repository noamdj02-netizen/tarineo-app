import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

const tones = {
  orange: "bg-[#FFF7ED] text-[#EA580C] ring-[#FFEDD5]",
  green: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  blue: "bg-sky-50 text-sky-700 ring-sky-100",
  neutral: "bg-paper-50 text-ink-600 ring-line",
};

export function LandingFeatureGlyph({
  icon: Icon,
  tone = "orange",
  className,
}: {
  icon: LucideIcon;
  tone?: keyof typeof tones;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex size-11 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset",
        tones[tone],
        className,
      )}
    >
      <Icon className="size-5" strokeWidth={1.75} aria-hidden />
    </span>
  );
}
