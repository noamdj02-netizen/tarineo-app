import { Suspense } from "react";
import { AssistantPanel } from "@/components/assistant/assistant-panel";
import { VerifiedNotice } from "@/components/auth/verified-notice";
import { PageEnter } from "@/components/app-ui/page-enter";
import { AppMainScrollRestore } from "@/components/shell/app-main-chrome";
import { MobileNav } from "@/components/shell/mobile-nav";
import { Sidebar } from "@/components/shell/sidebar";
import { Topbar } from "@/components/shell/topbar";
import { getPlan } from "@/lib/billing/plan";
import { OnboardingAppBanner } from "@/components/onboarding/onboarding-app-banner";
import { getOnboarding } from "@/lib/onboarding";
import { resolveOnboardingStartStep } from "@/lib/onboarding/resolve-start-step";
import { getViewer } from "@/lib/session";
import {
  countUnreadNotifications,
  listNotifications,
} from "@/lib/notifications/service";

// Données propres à l'utilisateur : toujours rendues à la demande, jamais figées au build.
export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const [viewer, onboarding, plan, unreadCount, recentNotifications] = await Promise.all([
    getViewer(),
    getOnboarding(),
    getPlan(),
    countUnreadNotifications().catch(() => 0),
    listNotifications({ limit: 12 }).catch(() => []),
  ]);

  return (
    <div className="min-h-dvh bg-bg">
      <Suspense>
        <Sidebar onboarding={onboarding} viewer={viewer} />
      </Suspense>
      {/* Décalage = largeur sidebar fixe ; le scroll reste dans <main> sur desktop */}
      <div className="flex min-h-dvh min-w-0 flex-col lg:ml-[252px] lg:p-2">
        <div
          className="flex min-h-dvh flex-1 flex-col bg-bg lg:min-h-0 lg:max-h-[calc(100dvh-16px)] lg:overflow-hidden lg:rounded-card"
        >
          <Topbar
            viewer={viewer}
            planId={plan?.plan ?? "free"}
            unreadCount={unreadCount}
            recentNotifications={recentNotifications}
          />
          <main
            id="app-main"
            className="mx-auto w-full max-w-[1240px] flex-1 overflow-x-clip px-4 pt-5 pb-[calc(100px+env(safe-area-inset-bottom,0px))] sm:px-6 lg:min-h-0 lg:overflow-x-hidden lg:overflow-y-auto lg:px-8 lg:pt-6 lg:pb-16 lg:overscroll-contain xl:px-10 lg:has-[[data-fill-viewport]]:flex lg:has-[[data-fill-viewport]]:flex-col lg:has-[[data-fill-viewport]]:overflow-hidden lg:has-[[data-fill-viewport]]:pb-4"
          >
            <AppMainScrollRestore />
            <VerifiedNotice />
            {viewer?.needsOnboarding ? (
              <OnboardingAppBanner
                resumeStep={resolveOnboardingStartStep({
                  firstName: viewer.firstName,
                  onboardingStep: viewer.onboardingStep,
                })}
              />
            ) : null}
            <PageEnter>{children}</PageEnter>
          </main>
        </div>
      </div>
      <Suspense>
        <MobileNav />
      </Suspense>
      <Suspense>
        <AssistantPanel keyMissing={!process.env.ANTHROPIC_API_KEY} firstName={viewer?.firstName} />
      </Suspense>
    </div>
  );
}
