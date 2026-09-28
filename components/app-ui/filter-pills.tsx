import { cn } from "@/lib/utils";

export function filterPillClass(active: boolean) {
  return cn(
    "inline-flex h-9 items-center rounded-[10px] border px-3 text-[13px] transition-[background-color,color,border-color] duration-150 ease-[cubic-bezier(0.2,0.8,0.2,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nav-orange/35",
    active
      ? "border-tarineo-orange-ring bg-tarineo-orange-soft text-tarineo-orange"
      : "border-line bg-surface text-ink hover:bg-tarineo-orange-hover hover:text-tarineo-orange",
  );
}

export function FilterPills<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (next: T) => void;
  options: { id: T; label: string }[];
}) {
  return (
    <div className="scroll-x" role="tablist">
      {options.map((opt) => {
        const active = value === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.id)}
            className={cn(filterPillClass(active), "max-md:min-h-11 shrink-0")}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
