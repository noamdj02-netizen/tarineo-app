import "server-only";
import { getDb } from "@/lib/db";
import { normalizeFeedUrl } from "@/lib/calendar/ical";
import { data } from "@/lib/mcp/data";
import { calendarToolId, type ConnectorBind, type ConnectorSignals } from "./catalog";

export type { ConnectorSignals };

export async function loadConnectorSignals(): Promise<ConnectorSignals> {
  const empty: ConnectorSignals = {
    connections: {},
    mcpReady: false,
    mcpUsed: false,
    calendarIds: [],
    googleEmail: null,
    stripeBilling: false,
  };
  const db = await getDb();
  if (!db) return empty;

  const [keys, feeds, rows, sub] = await Promise.all([
    data.listApiKeys(db.user.id).catch(() => []),
    db.supabase.from("calendar_feeds").select("url").eq("user_id", db.user.id).maybeSingle(),
    db.supabase
      .from("tool_connections")
      .select("tool_id, connected_at, account_label")
      .eq("user_id", db.user.id)
      .then(async (res) => {
        if (!res.error) return res;
        return db.supabase
          .from("tool_connections")
          .select("tool_id, connected_at")
          .eq("user_id", db.user.id);
      }),
    db.supabase
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", db.user.id)
      .maybeSingle(),
  ]);

  const active = keys.filter((k) => !k.revokedAt);
  const connections: Record<string, ConnectorBind> = {};
  if (!rows.error) {
    for (const row of rows.data ?? []) {
      connections[row.tool_id] = {
        at: row.connected_at,
        label:
          "account_label" in row && typeof row.account_label === "string"
            ? row.account_label
            : "",
      };
    }
  }

  const calendarIds: string[] = [];
  const norm = feeds.data?.url ? normalizeFeedUrl(feeds.data.url) : null;
  if (norm) {
    const id = calendarToolId(norm.provider);
    if (id) {
      calendarIds.push(id);
      if (!connections[id]) {
        connections[id] = { at: new Date().toISOString(), label: norm.provider };
      }
    }
  }

  const google =
    db.user.email && /gmail\.com$|googlemail\.com$/i.test(db.user.email)
      ? db.user.email
      : (typeof db.user.user_metadata?.email === "string" &&
        /gmail\.com$/i.test(db.user.user_metadata.email)
          ? db.user.user_metadata.email
          : db.user.email ?? null);

  return {
    connections,
    mcpReady: active.length > 0,
    mcpUsed: active.some((k) => Boolean(k.lastUsedAt)),
    calendarIds,
    googleEmail: google,
    stripeBilling: Boolean(sub.data?.stripe_customer_id),
  };
}
