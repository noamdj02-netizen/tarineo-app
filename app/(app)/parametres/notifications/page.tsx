import { SettingsSection } from "@/components/settings/settings-section";
import { NotificationsPreferencesForm } from "@/components/settings/notifications-preferences-form";
import { getDb } from "@/lib/db";
import { getEntrepriseConfig } from "@/lib/settings/entreprise-config";
import { getNotificationPreferences } from "@/lib/settings/notification-store";
import { isWebPushConfigured } from "@/lib/notifications/push";
import { canEditSection, canViewSection } from "@/lib/settings/roles";
import { getViewer } from "@/lib/session";

export const metadata = { title: "Notifications · Paramètres" };

export default async function ParametresNotificationsPage() {
  const [{ role }, prefs, viewer, db] = await Promise.all([
    getEntrepriseConfig(),
    getNotificationPreferences(),
    getViewer(),
    getDb(),
  ]);
  if (!canViewSection(role, "notifications")) {
    return <p className="text-[14px] text-muted-foreground">Accès non autorisé.</p>;
  }

  let recentAlerts: { id: string; title: string; detail: string; at: string; unread: boolean }[] = [];
  if (db) {
    const { data } = await db.supabase
      .from("price_alerts")
      .select("id, label, old_price, new_price, created_at")
      .eq("user_id", db.user.id)
      .order("created_at", { ascending: false })
      .limit(5);
    recentAlerts = (data ?? []).map((row, i) => {
      const oldP = Number(row.old_price) || 0;
      const newP = Number(row.new_price) || 0;
      const pct = oldP > 0 ? ((newP - oldP) / oldP) * 100 : 0;
      const when = new Date(row.created_at).toLocaleString("fr-FR", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
      return {
        id: row.id,
        title: "Hausse détectée",
        detail: `${row.label} · ${pct >= 0 ? "+" : ""}${pct.toFixed(1)} %`,
        at: when,
        unread: i < 2,
      };
    });
  }

  return (
    <SettingsSection
      title="Notifications"
      description="Préférences personnelles : push, in-app et e-mail."
      scope="utilisateur"
    >
      <NotificationsPreferencesForm
        initial={prefs}
        email={viewer?.email ?? ""}
        canEdit={canEditSection(role, "notifications")}
        recentAlerts={recentAlerts}
        pushConfigured={isWebPushConfigured()}
      />
    </SettingsSection>
  );
}
