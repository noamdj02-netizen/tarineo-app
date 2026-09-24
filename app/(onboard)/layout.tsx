import Link from "next/link";
import { BRAND } from "@/lib/brand";

export const dynamic = "force-dynamic";

export default function OnboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative isolate flex min-h-dvh flex-col overflow-x-clip bg-bg px-4 lg:overflow-clip">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 hidden h-[50%] lg:block"
      >
        <div className="absolute left-[-10%] h-full w-[55%] rounded-full bg-[radial-gradient(closest-side,var(--color-glow-1)_10%,transparent)] opacity-50 blur-3xl" />
        <div className="absolute left-[30%] h-full w-[45%] rounded-full bg-[radial-gradient(closest-side,var(--color-glow-2)_10%,transparent)] opacity-50 blur-3xl" />
        <div className="absolute right-[-8%] h-full w-[48%] rounded-full bg-[radial-gradient(closest-side,var(--color-glow-3)_10%,transparent)] opacity-50 blur-3xl" />
      </div>
      <header
        className="mx-auto flex w-full max-w-[720px] items-center py-3 lg:py-5"
        style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}
      >
        <Link
          href="/accueil"
          className="font-grotesk text-[20px] font-bold tracking-[-0.04em] lg:text-[22px]"
        >
          {BRAND.name}
          <span className="text-accent-2">.</span>
        </Link>
      </header>
      <main
        className="mx-auto flex w-full max-w-[720px] flex-1 flex-col pb-[max(0.5rem,env(safe-area-inset-bottom))] lg:pb-[max(2rem,env(safe-area-inset-bottom))]"
        style={{ perspective: "1200px" }}
      >
        {children}
      </main>
    </div>
  );
}
