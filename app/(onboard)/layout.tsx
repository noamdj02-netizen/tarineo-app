import { VerifiedNotice } from "@/components/auth/verified-notice";
import { BRAND } from "@/lib/brand";

export const dynamic = "force-dynamic";

export default function OnboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative isolate grid h-dvh max-h-dvh grid-rows-[auto_minmax(0,1fr)] overflow-hidden bg-landing-canvas px-4 pb-[env(safe-area-inset-bottom)]">
      <header
        className="mx-auto flex w-full max-w-[560px] items-center py-3 lg:py-4"
        style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}
      >
        <span className="font-grotesk text-[22px] font-bold tracking-[-0.045em] text-ink lg:text-[24px]">
          {BRAND.name}
          <span className="text-tarineo-orange">.</span>
        </span>
      </header>
      <main className="mx-auto flex h-full min-h-0 w-full max-w-[560px] flex-col overflow-hidden pb-2 lg:pb-4">
        <VerifiedNotice />
        {children}
      </main>
    </div>
  );
}
