"use client";

import { cn } from "@/lib/utils";

/** Switch compact style TARINEO (pas de dépendance switch). */
export function SettingsSwitch({
  checked,
  onCheckedChange,
  disabled,
  label,
  id,
}: {
  checked: boolean;
  onCheckedChange: (next: boolean) => void;
  disabled?: boolean;
  label?: string;
  id?: string;
}) {
  return (
    <button
      type="button"
      id={id}
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "relative h-6 w-10 shrink-0 rounded-full transition-colors duration-150 ease-[cubic-bezier(0.2,0.8,0.2,1)] motion-reduce:transition-none",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tarineo-orange/40",
        checked ? "bg-tarineo-orange" : "bg-surface-2 ring-1 ring-line",
        disabled && "cursor-not-allowed opacity-50",
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow-sm transition-transform duration-150 ease-[cubic-bezier(0.2,0.8,0.2,1)] motion-reduce:transition-none",
          checked && "translate-x-4",
        )}
      />
    </button>
  );
}
