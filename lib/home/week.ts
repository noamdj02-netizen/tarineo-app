import type { Db } from "@/lib/db";

const TZ = "Europe/Paris";
const dayKey = (d: Date) =>
  new Intl.DateTimeFormat("fr-CA", { timeZone: TZ }).format(d);

export type WeekDay = {
  key: string;
  label: string;
  ai: number;
  schemas: number;
  notes: number;
};
export type WeekStats = {
  days: WeekDay[];
  totals: { ai: number; schemas: number; notes: number };
  tasks: { done: number; total: number };
};

/** Stats vides pour l’accueil quand la base n’est pas disponible. */
export function emptyWeekStats(): WeekStats {
  const now = new Date();
  const days: WeekDay[] = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now.getTime() - (6 - i) * 864e5);
    return {
      key: dayKey(d),
      label: new Intl.DateTimeFormat("fr-FR", { timeZone: TZ, weekday: "narrow" }).format(d),
      ai: 0,
      schemas: 0,
      notes: 0,
    };
  });
  return { days, totals: { ai: 0, schemas: 0, notes: 0 }, tasks: { done: 0, total: 0 } };
}

/** Activité des 7 derniers jours (aujourd'hui compris), au fuseau de Paris. */
export async function getWeekStats(db: Db): Promise<WeekStats> {
  const now = new Date();
  const days: WeekDay[] = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now.getTime() - (6 - i) * 864e5);
    return {
      key: dayKey(d),
      label: new Intl.DateTimeFormat("fr-FR", {
        timeZone: TZ,
        weekday: "narrow",
      }).format(d),
      ai: 0,
      schemas: 0,
      notes: 0,
    };
  });
  const since = new Date(now.getTime() - 7 * 864e5).toISOString();
  const uid = db.user.id;

  const { data: projects } = await db.supabase
    .from("projects")
    .select("id")
    .eq("user_id", uid);
  const ids = (projects ?? []).map((p) => p.id);

  const [chat, schemas, logs, tasks] = await Promise.all([
    db.supabase
      .from("chat_messages")
      .select("created_at")
      .eq("user_id", uid)
      .eq("role", "user")
      .gte("created_at", since)
      .limit(1000),
    db.supabase
      .from("project_schemas")
      .select("updated_at")
      .eq("user_id", uid)
      .gte("updated_at", since)
      .limit(1000),
    ids.length
      ? db.supabase
          .from("project_log")
          .select("date")
          .in("project_id", ids)
          .gte("date", days[0].key)
          .limit(1000)
      : Promise.resolve({ data: [] as { date: string }[] }),
    ids.length
      ? db.supabase
          .from("project_tasks")
          .select("done")
          .in("project_id", ids)
          .limit(5000)
      : Promise.resolve({ data: [] as { done: boolean }[] }),
  ]);

  const at = new Map(days.map((d) => [d.key, d]));
  for (const r of chat.data ?? []) {
    const d = at.get(dayKey(new Date(r.created_at)));
    if (d) d.ai++;
  }
  for (const r of schemas.data ?? []) {
    const d = at.get(dayKey(new Date(r.updated_at)));
    if (d) d.schemas++;
  }
  for (const r of logs.data ?? []) {
    const d = at.get(r.date);
    if (d) d.notes++;
  }

  const sum = (k: "ai" | "schemas" | "notes") =>
    days.reduce((n, d) => n + d[k], 0);
  const t = tasks.data ?? [];
  return {
    days,
    totals: { ai: sum("ai"), schemas: sum("schemas"), notes: sum("notes") },
    tasks: { done: t.filter((x) => x.done).length, total: t.length },
  };
}
