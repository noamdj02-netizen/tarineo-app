import { cn } from "@/lib/utils";

/** Fenêtre d'app (3 points + barre d'adresse) autour d'une capture produit. */
export function AppWindow({
  children,
  className,
  dark = false,
  url = "app.example.com",
}: {
  children: React.ReactNode;
  className?: string;
  dark?: boolean;
  url?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-[14px] border",
        dark ? "border-white/10 bg-[#111214]" : "border-black/[0.08] bg-white",
        className,
      )}
    >
      <div
        className={cn(
          "flex h-9 items-center gap-2 border-b px-3.5",
          dark ? "border-white/[0.07]" : "border-black/[0.06] bg-[#fafafa]",
        )}
      >
        <span className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <i
              key={i}
              className={cn("block size-2.5 rounded-full", dark ? "bg-white/15" : "bg-black/[0.12]")}
            />
          ))}
        </span>
        <span
          className={cn(
            "mx-auto rounded-md px-12 py-1 font-mono text-[10.5px]",
            dark ? "bg-white/[0.05] text-white/40" : "bg-black/[0.04] text-black/40",
          )}
        >
          {url}
        </span>
      </div>
      {children}
    </div>
  );
}

/** Pastille ronde « avatar » en dégradé doux. */
export function Avatar({ hue, className }: { hue: number; className?: string }) {
  return (
    <i
      className={cn("block rounded-full", className)}
      style={{
        background: `linear-gradient(135deg, hsl(${hue} 45% 78%), hsl(${hue + 30} 35% 52%))`,
      }}
    />
  );
}

/** Barres de graphique (hauteurs en %). */
export function Bars({
  values,
  className,
  barClass,
  activeIndex,
  activeClass,
}: {
  values: number[];
  className?: string;
  barClass: string;
  activeIndex?: number;
  activeClass?: string;
}) {
  return (
    <div className={cn("flex items-end gap-1.5", className)}>
      {values.map((v, i) => (
        <i
          key={i}
          className={cn("block flex-1 rounded-t-[3px]", i === activeIndex ? activeClass : barClass)}
          style={{ height: `${v}%` }}
        />
      ))}
    </div>
  );
}
