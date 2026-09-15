import { PageHeader } from "./PageHeader";
import { PageCard } from "./PageHeader";
import { BtnGhost, BtnPrimary } from "./Actions";

export function EmptyState({
  title,
  subtitle,
  heading,
  description,
  primary,
  secondary,
  variant = "document",
}: {
  title: string;
  subtitle: string;
  heading: string;
  description: string;
  primary: { href: string; label: string };
  secondary?: { href: string; label: string };
  variant?: "document" | "user";
}) {
  return (
    <div>
      <PageHeader title={title} subtitle={subtitle} />
      <PageCard className="flex min-h-[480px] flex-col items-center justify-center px-6 text-center">
        <div className="mb-6">{variant === "user" ? <IllustrationUser /> : <IllustrationDocument />}</div>
        <h2 className="text-xl font-semibold text-[#172935]">{heading}</h2>
        <p className="mt-2 max-w-[420px] text-sm leading-6 text-muted-foreground">{description}</p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <BtnPrimary href={primary.href}>{primary.label}</BtnPrimary>
          {secondary && <BtnGhost href={secondary.href}>{secondary.label}</BtnGhost>}
        </div>
      </PageCard>
    </div>
  );
}

function IllustrationDocument() {
  return (
    <div className="relative flex size-[120px] items-center justify-center">
      <div className="absolute inset-0 rounded-full bg-[#FFF0E8]" />
      <svg viewBox="0 0 72 72" className="relative size-16 text-primary" fill="none" aria-hidden="true">
        <rect x="18" y="12" width="36" height="48" rx="6" fill="white" stroke="currentColor" strokeWidth="2" />
        <path d="M42 12v12h12" stroke="currentColor" strokeWidth="2" />
        <path d="M28 36h16M28 44h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="52" cy="52" r="10" fill="#EC5821" />
        <path d="M52 47v10M47 52h10" stroke="white" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </div>
  );
}

function IllustrationUser() {
  return (
    <div className="relative flex size-[120px] items-center justify-center">
      <div className="absolute inset-0 rounded-full bg-[#FFF0E8]" />
      <svg viewBox="0 0 72 72" className="relative size-16" fill="none" aria-hidden="true">
        <circle cx="36" cy="28" r="10" fill="#EC5821" />
        <path d="M16 58c2.5-12 11-18 20-18s17.5 6 20 18" fill="#EC5821" />
        <circle cx="54" cy="50" r="10" fill="white" stroke="#EC5821" strokeWidth="2" />
        <path d="M54 46v8M50 50h8" stroke="#EC5821" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </div>
  );
}
