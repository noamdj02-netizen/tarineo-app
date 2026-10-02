import Link from "next/link";
import { AlertTriangle, BarChart3, FileText, Truck } from "lucide-react";
import type { RecommendedAction } from "@/components/tarineo/types";

const ICONS = {
  alert: AlertTriangle,
  file: FileText,
  chart: BarChart3,
  truck: Truck,
};

export function RecommendedActions({ actions }: { actions: RecommendedAction[] }) {
  if (!actions.length) {
    return <p className="p-4 text-[13px] text-muted-foreground">Rien à signaler pour le moment.</p>;
  }
  return (
    <ul className="divide-y divide-line">
      {actions.map((a) => {
        const Icon = ICONS[a.icon ?? "file"];
        return (
          <li key={a.id}>
            <Link
              href={a.href}
              className="flex gap-3 px-4 py-3 transition-colors hover:bg-surface-2 focus-visible:bg-surface-2 focus-visible:outline-none"
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[#FF6B1A]/10 text-[#FF6B1A]">
                <Icon className="size-4" aria-hidden />
              </span>
              <span className="min-w-0">
                <span className="block text-[14px] font-medium text-ink">{a.title}</span>
                <span className="mt-0.5 block text-[12.5px] text-muted-foreground">{a.description}</span>
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
