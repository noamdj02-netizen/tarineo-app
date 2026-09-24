import { LogOut } from "lucide-react";
import { BottomTabs, TopTabs } from "@/components/shell/tab-bar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="wrap">
        <header className="top">
          <div>
            <div className="eyebrow">Tarineo · Devis Instant · Optérieur</div>
            <h1>Studio Noam</h1>
            <p className="hidden sm:block">
              Ton QG pour créer tes SaaS : projets, outils, ressources design, workflow Figma →
              Cursor, kit landing et un assistant IA qui connaît tout ça.
            </p>
          </div>
          <form action="/auth/signout" method="post">
            <button className="btn min-h-11" type="submit" aria-label="Se déconnecter">
              <LogOut aria-hidden />
              <span className="hidden sm:inline">Déconnexion</span>
            </button>
          </form>
        </header>
        <TopTabs />
        <main>{children}</main>
      </div>
      <BottomTabs />
    </>
  );
}
