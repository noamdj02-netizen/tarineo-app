import { Img, staticFile } from "remotion";
import { BellIcon, LayoutDashboardIcon, FileTextIcon, TruckIcon, ReceiptIcon, SettingsIcon, UploadIcon, SearchIcon } from "lucide-react";
import { DEMO_USER } from "../demo-data";
import { FONT, RADIUS, TOKENS } from "../theme";

type NavId = "accueil" | "documents" | "fournisseurs" | "facturation" | "parametres";

const NAV: { id: NavId; label: string; icon: typeof LayoutDashboardIcon }[] = [
  { id: "accueil", label: "Accueil", icon: LayoutDashboardIcon },
  { id: "documents", label: "Mes documents", icon: FileTextIcon },
  { id: "fournisseurs", label: "Fournisseurs", icon: TruckIcon },
  { id: "facturation", label: "Facturation clients", icon: ReceiptIcon },
  { id: "parametres", label: "Paramètres", icon: SettingsIcon },
];

function NavItem({ id, label, icon: Icon, active }: { id: NavId; label: string; icon: typeof LayoutDashboardIcon; active: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 16px",
        borderRadius: 12,
        margin: "0 4px",
        fontFamily: FONT,
        fontSize: 16,
        fontWeight: active ? 500 : 400,
        color: active ? TOKENS.primary : TOKENS.mutedForeground,
        background: active ? "rgba(236,88,33,0.1)" : "transparent",
        boxShadow: active ? "inset 3px 0 0 0 #ec5821" : "none",
      }}
    >
      <Icon size={20} strokeWidth={1.75} />
      <span>{label}</span>
      {id === "documents" && (
        <span
          style={{
            marginLeft: "auto",
            background: TOKENS.primary,
            color: "#fff",
            borderRadius: RADIUS.pill,
            fontSize: 11,
            padding: "2px 8px",
            fontWeight: 600,
          }}
        >
          3
        </span>
      )}
    </div>
  );
}

export function AppChrome({
  activeNav,
  children,
}: {
  activeNav: NavId;
  children: React.ReactNode;
}) {
  return (
    <div style={{ width: 1920, height: 1080, background: TOKENS.pageBg, display: "flex", flexDirection: "column", fontFamily: FONT }}>
      {/* TopBar — src/app/(app)/AppShell.tsx TopBar */}
      <header style={{ padding: "16px 32px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            height: 56,
            borderRadius: RADIUS.pill,
            border: `1px solid ${TOKENS.border}99`,
            background: TOKENS.card,
            padding: "8px 12px 8px 20px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          }}
        >
          <Img src={staticFile("logo.png")} style={{ height: 28, width: "auto" }} />
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              gap: 10,
              height: 44,
              borderRadius: RADIUS.pill,
              background: TOKENS.secondary,
              padding: "0 16px",
              color: TOKENS.mutedForeground,
              fontSize: 14,
            }}
          >
            <SearchIcon size={18} />
            Rechercher un document, fournisseur, référence…
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: TOKENS.primary,
                color: "#fff",
                borderRadius: RADIUS.pill,
                padding: "10px 18px",
                fontSize: 14,
                fontWeight: 500,
              }}
            >
              <UploadIcon size={16} />
              Importer
            </span>
            <span
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: TOKENS.secondary,
              }}
            >
              <BellIcon size={18} color={TOKENS.foreground} />
              <span
                style={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: TOKENS.primary,
                }}
              />
            </span>
            <span
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: "rgba(236,88,33,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 600,
                color: TOKENS.foreground,
              }}
            >
              {DEMO_USER.prenom.charAt(0)}
            </span>
          </div>
        </div>
      </header>

      <div style={{ display: "flex", flex: 1, gap: 32, padding: "0 32px 32px", minHeight: 0 }}>
        {/* Sidebar */}
        <aside
          style={{
            width: 264,
            flexShrink: 0,
            borderRadius: RADIUS.card,
            border: `1px solid ${TOKENS.border}80`,
            background: TOKENS.card,
            padding: 16,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          }}
        >
          <div>
            <p style={{ fontSize: 28, lineHeight: 1.15, color: TOKENS.foreground, margin: 0 }}>
              <span style={{ fontWeight: 400 }}>Bon retour, </span>
              <span style={{ fontWeight: 500 }}>{DEMO_USER.prenom}</span>
            </p>
            <p style={{ fontSize: 14, color: TOKENS.mutedForeground, marginTop: 8, textTransform: "capitalize" }}>
              mardi 22 septembre 2026
            </p>
            <nav
              style={{
                marginTop: 32,
                borderRadius: RADIUS.card,
                background: TOKENS.secondary,
                padding: 4,
              }}
            >
              {NAV.map((item) => (
                <NavItem key={item.id} {...item} active={item.id === activeNav} />
              ))}
            </nav>
          </div>
        </aside>

        {/* Main */}
        <main style={{ flex: 1, minWidth: 0, overflow: "hidden" }}>{children}</main>
      </div>
    </div>
  );
}
