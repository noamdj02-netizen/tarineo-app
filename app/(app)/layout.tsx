import { Suspense } from "react";
import { AssistantPanel } from "@/components/assistant/assistant-panel";
import { MobileNav } from "@/components/shell/mobile-nav";
import { Sidebar } from "@/components/shell/sidebar";
import { Topbar } from "@/components/shell/topbar";
import { getPlan } from "@/lib/billing/plan";
import { PLAN_LABEL } from "@/lib/billing/plans";
import { getOnboarding } from "@/lib/onboarding";
import { getViewer } from "@/lib/session";

// Données propres à l'utilisateur : toujours rendues à la demande, jamais figées au build.
export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const [viewer, onboarding, plan] = await Promise.all([getViewer(), getOnboarding(), getPlan()]);

  return (
    <div className="flex min-h-dvh bg-bg">
      <Sidebar onboarding={onboarding} />
      <div className="flex min-w-0 flex-1 flex-col lg:p-2 lg:pl-0">
        {/* Zone principale blanche */}
        <div className="flex min-h-full flex-1 flex-col bg-surface lg:overflow-clip lg:rounded-card lg:shadow-soft">
          <Topbar viewer={viewer} plan={PLAN_LABEL[plan?.plan ?? "free"]} />
          <main className="mx-auto w-full max-w-[1080px] flex-1 px-4 pt-6 pb-[calc(120px+env(safe-area-inset-bottom,0px))] sm:px-6 lg:pb-16">
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
