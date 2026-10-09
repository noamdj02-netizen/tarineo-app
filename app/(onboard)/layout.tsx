import { VerifiedNotice } from "@/components/auth/verified-notice";
import { BRAND } from "@/lib/brand";

export const dynamic = "force-dynamic";

export default function OnboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative isolate grid h-dvh max-h-dvh grid-rows-[auto_minmax(0,1fr)] overflow-hidden bg-bg px-4 pb-[env(safe-area-inset-bottom)]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 hidden h-[50%] lg:block"
      >
        <div className="absolute left-[-10%] h-full w-[55%] rounded-full bg-[radial-gradient(closest-side,var(--color-glow-1)_10%,transparent)] opacity-50 blur-3xl" />
        <div className="absolute left-[30%] h-full w-[45%] rounded-full bg-[radial-gradient(closest-side,var(--color-glow-2)_10%,transparent)] opacity-50 blur-3xl" />
        <div className="absolute right-[-8%] h-full w-[48%] rounded-full bg-[radial-gradient(closest-side,var(--color-glow-3)_10%,transparent)] opacity-50 blur-3xl" />
      </div>
      <header
        className="mx-auto flex w-full max-w-[560px] items-center py-3 lg:py-4"
        style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}
      >
        <span
          className="font-grotesk text-[20px] font-bold tracking-[-0.04em] lg:text-[22px]"
        >
          {BRAND.name}
          <span className="text-accent-2">.</span>
        </span>
      </header>
      <main className="mx-auto flex h-full min-h-0 w-full max-w-[560px] flex-col overflow-hidden pb-2 lg:pb-4">
        <VerifiedNotice />
        {children}
      </main>
    </div>
  );
}
