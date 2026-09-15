import { cn } from "@/lib/utils";

const stroke = {
  fill: "none" as const,
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function IconWidget({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("size-6", className)} aria-hidden="true" {...stroke}>
      <rect x="2.6" y="2.6" width="8" height="8" rx="2.2" />
      <rect x="13.4" y="2.6" width="8" height="8" rx="2.2" />
      <rect x="2.6" y="13.4" width="8" height="8" rx="2.2" />
      <rect x="13.4" y="13.4" width="8" height="8" rx="2.2" />
    </svg>
  );
}

export function IconDocument({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("size-6", className)} aria-hidden="true" {...stroke}>
      <path d="M7 3.25h6.4L18.75 8.6V19.5A1.25 1.25 0 0 1 17.5 20.75H7A1.25 1.25 0 0 1 5.75 19.5V4.5A1.25 1.25 0 0 1 7 3.25Z" />
      <path d="M13.25 3.4v4.6h4.6" />
      <path d="M9 13h6M9 16.5h4" />
    </svg>
  );
}

export function IconInvoice({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("size-6", className)} aria-hidden="true" {...stroke}>
      <path d="M6.25 4.25h8.2L18.75 8.6v10.9A1.25 1.25 0 0 1 17.5 20.75h-11A1.25 1.25 0 0 1 5.25 19.5V5.5A1.25 1.25 0 0 1 6.25 4.25Z" />
      <path d="M14.1 4.4v3.85h3.9" />
      <path d="M8.5 12.25h7M8.5 15.5h5" />
      <circle cx="16.25" cy="15.5" r="1.05" />
    </svg>
  );
}

export function IconSettings({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("size-6", className)} aria-hidden="true" {...stroke}>
      <circle cx="12" cy="12" r="3.1" />
      <path d="M12 4.25v1.6M12 18.15v1.6M4.25 12h1.6M18.15 12h1.6M6.4 6.4l1.13 1.13M16.47 16.47l1.13 1.13M17.6 6.4l-1.13 1.13M7.53 16.47l-1.13 1.13" />
    </svg>
  );
}

export function IconFile({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("size-5", className)} aria-hidden="true" {...stroke}>
      <path d="M7 3.25h6.4L18.75 8.6V19.5A1.25 1.25 0 0 1 17.5 20.75H7A1.25 1.25 0 0 1 5.75 19.5V4.5A1.25 1.25 0 0 1 7 3.25Z" />
      <path d="M13.25 3.4v4.6h4.6" />
    </svg>
  );
}

export function IconCalendar({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("size-4", className)} aria-hidden="true" {...stroke}>
      <rect x="3.5" y="5" width="17" height="15" rx="2" />
      <path d="M8 3.5v3M16 3.5v3M3.5 10h17" />
    </svg>
  );
}

export function IconChevron({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("size-4", className)} aria-hidden="true" {...stroke}>
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

export function IconFilter({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("size-4", className)} aria-hidden="true" {...stroke}>
      <path d="M4 6h16M7 12h10M10 18h4" />
    </svg>
  );
}

export function IconPlus({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("size-4", className)} aria-hidden="true" {...stroke}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
