import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { BRAND } from "@/lib/brand";

/** Pages de compte : carte centrée sur le fond Mono Lead, halo pastel discret. */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative isolate flex min-h-dvh flex-col overflow-clip bg-bg px-4">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[55%]">
        <div className="absolute left-[-10%] h-full w-[55%] rounded-full bg-[radial-gradient(closest-side,var(--color-glow-1)_10%,transparent)] opacity-60 blur-3xl" />
        <div className="absolute left-[25%] h-full w-[50%] rounded-full bg-[radial-gradient(closest-side,var(--color-glow-2)_10%,transparent)] opacity-60 blur-3xl" />
        <div className="absolute right-[-10%] h-full w-[50%] rounded-full bg-[radial-gradient(closest-side,var(--color-glow-3)_10%,transparent)] opacity-60 blur-3xl" />
      </div>
      <header className="mx-auto flex w-full max-w-[1120px] items-center justify-between py-5">
        <Link
          href="/"
          className="inline-flex min-h-11 items-center gap-2 font-grotesk text-[22px] font-bold tracking-[-0.04em]"
        >
          <ArrowLeft className="size-4 text-muted" aria-hidden />
          {BRAND.name}
          <span className="text-accent-2">.</span>
        </Link>
      </header>
      <main className="flex flex-1 items-start justify-center pt-[4vh] pb-16 sm:pt-[8vh]">
        <div className="w-full max-w-[420px]">{children}</div>
      </main>
    </div>
  );
}
