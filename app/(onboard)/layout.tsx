import Link from "next/link";
import { BRAND } from "@/lib/brand";

export const dynamic = "force-dynamic";

export default function OnboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative isolate flex min-h-dvh flex-col overflow-clip bg-bg px-4">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[50%]">
        <div className="absolute left-[-10%] h-full w-[55%] rounded-full bg-[radial-gradient(closest-side,var(--color-glow-1)_10%,transparent)] opacity-50 blur-3xl" />
        <div className="absolute left-[30%] h-full w-[45%] rounded-full bg-[radial-gradient(closest-side,var(--color-glow-2)_10%,transparent)] opacity-50 blur-3xl" />
        <div className="absolute right-[-8%] h-full w-[48%] rounded-full bg-[radial-gradient(closest-side,var(--color-glow-3)_10%,transparent)] opacity-50 blur-3xl" />
      </div>
      <header
        className="mx-auto flex w-full max-w-[720px] items-center py-5"
        style={{ paddingTop: "max(1.25rem, env(safe-area-inset-top))" }}
      >
        <Link href="/accueil" className="font-grotesk text-[22px] font-bold tracking-[-0.04em]">
          {BRAND.name}
          <span className="text-accent-2">.</span>
        </Link>
      </header>
      <main className="mx-auto flex w-full max-w-[720px] flex-1 flex-col pb-[max(2rem,env(safe-area-inset-bottom))]">
        {children}
      </main>
    </div>
  );
}
