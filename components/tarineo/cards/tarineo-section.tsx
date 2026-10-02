import { cn } from "@/lib/utils";

export function TarineoSection({
  title,
  description,
  action,
  className,
  children,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={cn("flex flex-col gap-3", className)}>
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="font-display text-[17px] font-semibold tracking-tight text-ink">{title}</h2>
          {description ? <p className="mt-0.5 text-[13px] text-muted-foreground">{description}</p> : null}
        </div>
        {action}
      </div>
      <div className="card-soft overflow-hidden">{children}</div>
    </section>
  );
}
