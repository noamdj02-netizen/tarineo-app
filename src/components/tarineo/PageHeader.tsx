import Link from "next/link";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  subtitle,
  backHref,
  backLabel = "Retour",
  actions,
}: {
  title: React.ReactNode;
  subtitle?: string;
  backHref?: string;
  backLabel?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        {backHref && (
          <Link href={backHref} className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            ← {backLabel}
          </Link>
        )}
        <h1 className="text-[28px] font-semibold leading-none tracking-tight text-[#172935] sm:text-[32px]">{title}</h1>
        {subtitle && <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function PageCard({ className, children }: { className?: string; children: React.ReactNode }) {
  return <section className={cn("rounded-[24px] bg-white p-5 sm:p-6", className)}>{children}</section>;
}

export function SearchField({
  placeholder,
  className,
}: {
  placeholder: string;
  className?: string;
}) {
  return (
    <label className={cn("flex h-12 w-full items-center gap-3 rounded-full bg-[#F8F8F8] px-4", className)}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="size-5 shrink-0 text-foreground" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" d="M10.5 3.75a6.75 6.75 0 1 0 0 13.5 6.75 6.75 0 0 0 0-13.5ZM2.25 10.5a8.25 8.25 0 1 1 14.59 5.28l4.69 4.69a.75.75 0 1 1-1.06 1.06l-4.69-4.69A8.25 8.25 0 0 1 2.25 10.5Z" clipRule="evenodd" />
      </svg>
      <input type="search" placeholder={placeholder} className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground" />
    </label>
  );
}
