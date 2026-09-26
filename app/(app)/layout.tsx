import { Suspense } from "react";
import { AssistantPanel } from "@/components/assistant/assistant-panel";
import { VerifiedNotice } from "@/components/auth/verified-notice";
import { AppMainScrollRestore } from "@/components/shell/app-main-chrome";
import { MobileNav } from "@/components/shell/mobile-nav";
import { Sidebar } from "@/components/shell/sidebar";
import { Topbar } from "@/components/shell/topbar";
import { getPlan } from "@/lib/billing/plan";
import { getOnboarding } from "@/lib/onboarding";
import { getViewer } from "@/lib/session";

// Données propres à l'utilisateur : toujours rendues à la demande, jamais figées au build.
export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const [viewer, onboarding, plan] = await Promise.all([getViewer(), getOnboarding(), getPlan()]);

  return (
    <div className="min-h-dvh bg-bg">
      <Sidebar onboarding={onboarding} viewer={viewer} />
      {/* Décalage = largeur sidebar fixe ; le scroll reste dans <main> sur desktop */}
      <div className="flex min-h-dvh min-w-0 flex-col lg:ml-[252px] lg:p-2">
        <div
          className="flex min-h-dvh flex-1 flex-col bg-surface lg:min-h-0 lg:max-h-[calc(100dvh-16px)] lg:overflow-hidden lg:rounded-card lg:shadow-soft"
        >
          <Topbar viewer={viewer} planId={plan?.plan ?? "free"} />
          <main
            id="app-main"
            className="mx-auto w-full max-w-[1280px] flex-1 px-4 pt-6 pb-[calc(120px+env(safe-area-inset-bottom,0px))] sm:px-6 lg:min-h-0 lg:overflow-x-hidden lg:overflow-y-auto lg:pb-16 lg:overscroll-contain lg:has-[[data-fill-viewport]]:flex lg:has-[[data-fill-viewport]]:flex-col lg:has-[[data-fill-viewport]]:overflow-hidden lg:has-[[data-fill-viewport]]:pb-4"
          >
            <AppMainScrollRestore />
            <VerifiedNotice />
            {children}
          </main>
        </div>
      </div>
      <MobileNav />
      <Suspense>
        <AssistantPanel keyMissing={!process.env.ANTHROPIC_API_KEY} firstName={viewer?.firstName} />
      </Suspense>
    </div>
  );
}
