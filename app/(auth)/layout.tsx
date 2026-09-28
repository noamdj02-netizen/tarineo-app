import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ThemedLogo } from "@/components/brand/themed-logo";

/** Pages de compte : carte centrée, halos orange TARINEO. */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative isolate flex min-h-dvh flex-col overflow-x-clip overflow-y-auto bg-bg px-4">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[55%]">
        <div className="absolute left-[-12%] h-full w-[58%] rounded-full bg-[radial-gradient(closest-side,color-mix(in_srgb,var(--color-brand-orange)_48%,white)_14%,transparent)] opacity-65 blur-3xl" />
        <div className="absolute left-[22%] h-full w-[52%] rounded-full bg-[radial-gradient(closest-side,var(--color-brand-orange-light)_12%,transparent)] opacity-50 blur-3xl" />
        <div className="absolute right-[-14%] h-full w-[54%] rounded-full bg-[radial-gradient(closest-side,var(--color-brand-orange)_10%,transparent)] opacity-42 blur-3xl" />
      </div>
      <header className="mx-auto flex w-full max-w-[1120px] items-center justify-between py-5">
        <Link
          href="/"
          aria-label="Accueil TARINEO"
          className="inline-flex min-h-11 items-center gap-2.5 text-muted-foreground hover:text-ink"
        >
          <ArrowLeft className="size-4" strokeWidth={1.75} aria-hidden />
          <ThemedLogo size="lg" priority decorative />
        </Link>
      </header>
      <main className="flex flex-1 items-start justify-center pt-6 pb-[max(5rem,calc(var(--cookie-banner-offset,12.5rem)+1.25rem))] sm:pt-[68px] sm:pb-[max(4rem,calc(var(--cookie-banner-offset,0px)+1.5rem))]">
        <div className="w-full max-w-[420px]">{children}</div>
      </main>
    </div>
  );
}
