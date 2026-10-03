import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function WorkflowStepCard({
  step,
  title,
  icon: Icon,
  children,
  className,
}: {
  step: string;
  title: string;
  icon: LucideIcon;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("border-b border-line px-5 py-5 last:border-b-0", className)}>
      <div className="flex items-start gap-3">
        <span
          className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#FF6B1A]/10 text-[#E85A12]"
          aria-hidden
        >
          <Icon className="size-[18px] stroke-[1.75]" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-[16px] font-semibold tracking-tight text-ink">
            {step}. {title}
          </h2>
          <div className="mt-4">{children}</div>
        </div>
      </div>
    </div>
  );
}
