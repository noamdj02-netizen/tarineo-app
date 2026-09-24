import { LogOut } from "lucide-react";
import { BottomTabs, TopTabs } from "@/components/shell/tab-bar";
import { BRAND } from "@/lib/brand";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="wrap">
        <header className="top">
          <div>
            <div className="eyebrow">{BRAND.tagline}</div>
            <h1>{BRAND.name}</h1>
            <p className="hidden sm:block">{BRAND.description}</p>
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
