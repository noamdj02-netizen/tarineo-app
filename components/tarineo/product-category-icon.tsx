import { Droplets, Flame, Package, Pipette, Thermometer, Wind } from "lucide-react";
import { cn } from "@/lib/utils";

function matchCategory(name: string): "water" | "heat" | "shower" | "pipe" | "rad" | "default" {
  const n = name.toLowerCase();
  if (n.includes("chauffe") || n.includes("ballon")) return "water";
  if (n.includes("pompe") || n.includes("clim") || n.includes("pac")) return "heat";
  if (n.includes("mitigeur") || n.includes("douche")) return "shower";
  if (n.includes("tube") || n.includes("cuivre") || n.includes("pvc")) return "pipe";
  if (n.includes("radiateur")) return "rad";
  return "default";
}

const ICONS = {
  water: Thermometer,
  heat: Wind,
  shower: Droplets,
  pipe: Pipette,
  rad: Flame,
  default: Package,
} as const;

export function ProductCategoryIcon({
  name,
  className,
  iconClassName,
}: {
  name: string;
  className?: string;
  iconClassName?: string;
}) {
  const key = matchCategory(name);
  const Icon = ICONS[key];
  return (
    <span
      className={cn(
        "grid size-10 shrink-0 place-items-center rounded-xl bg-surface-2 text-muted-foreground",
        className,
      )}
      aria-hidden
    >
      <Icon className={cn("size-[18px] stroke-[1.75]", iconClassName)} />
    </span>
  );
}
