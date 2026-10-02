import Link from "next/link";
import { PageHead } from "@/components/shell/page-head";
import { NotificationsList } from "@/components/notifications/notifications-list";
import {
  countUnreadNotifications,
  listNotifications,
} from "@/lib/notifications/service";
import type { NotificationType } from "@/lib/notifications/types";

export const metadata = { title: "Notifications" };

const TABS = [
  { id: "all", label: "Toutes" },
  { id: "unread", label: "Non lues" },
  { id: "actions", label: "Actions" },
  { id: "alerts", label: "Alertes" },
  { id: "ai", label: "IA" },
] as const;

export default async function NotificationsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const sp = await searchParams;
  const tab = TABS.some((t) => t.id === sp.tab) ? (sp.tab as (typeof TABS)[number]["id"]) : "all";

  const [items, unread] = await Promise.all([
    listNotifications({
      unreadOnly: tab === "unread",
      type:
        tab === "actions" || tab === "alerts" || tab === "ai"
          ? tab
          : tab === "all" || tab === "unread"
            ? undefined
            : (tab as NotificationType),
      limit: 80,
    }),
    countUnreadNotifications(),
  ]);

  return (
    <section className="mx-auto flex w-full max-w-[720px] flex-col gap-6">
      <PageHead
        label="Notifications"
        title="Notifications"
        crumbs={[
          { href: "/accueil", label: "Accueil" },
          { label: "Notifications" },
        ]}
      >
        {unread ? `${unread} non lue${unread > 1 ? "s" : ""}` : "Tout est à jour"}
      </PageHead>

      <nav className="flex flex-wrap gap-1.5" aria-label="Filtres">
        {TABS.map((t) => {
          const on = tab === t.id;
          return (
            <Link
              key={t.id}
              href={t.id === "all" ? "/notifications" : `/notifications?tab=${t.id}`}
              className={
                on
                  ? "rounded-full bg-tarineo-orange px-3.5 py-1.5 text-[13px] font-medium text-white"
                  : "rounded-full border border-line bg-surface px-3.5 py-1.5 text-[13px] text-muted-foreground hover:text-ink"
              }
            >
              {t.label}
            </Link>
          );
        })}
      </nav>

      <NotificationsList initial={items} />
    </section>
  );
}
