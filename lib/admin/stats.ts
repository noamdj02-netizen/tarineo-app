import "server-only";
import type { User } from "@supabase/supabase-js";
import type { PlanId } from "@/lib/billing/plans";
import { createAdminClient } from "@/lib/supabase/admin";

const STEPS = ["Inscrit", "Connecté", "Identité", "Wizard fini", "Import PDF", "Abonné"] as const;
export type Stop = (typeof STEPS)[number];

const PAID_PLANS = new Set<PlanId>(["starter", "pro", "founder"]);
const PAID_STATUS = new Set(["active", "trialing", "past_due", "lifetime"]);
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export type AdminPerson = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  lastSignIn: string | null;
  stop: Stop;
  plan: PlanId;
  paid: boolean;
  projects: number;
};

export type BarRow = { label: string; count: number };

export type AdminStats = {
  signedUp: number;
  activeWeek: number;
  onboarded: number;
  paid: number;
  newSignups: number;
  signupDelta: number | null;
  series: { day: string; count: number }[];
  funnel: { step: Stop; count: number }[];
  plans: BarRow[];
  people: AdminPerson[];
};

function metaName(meta: Record<string, unknown>) {
  const raw = [meta.first_name, meta.full_name, meta.name].find(
    (v): v is string => typeof v === "string" && v.trim().length > 0,
  );
  return raw?.trim() ?? "";
}

function planOf(row: { plan: string; status: string } | undefined): PlanId {
  if (!row) return "free";
  if (row.plan === "starter" || row.plan === "pro" || row.plan === "founder") return row.plan;
  return "free";
}

function isPaid(row: { plan: string; status: string } | undefined) {
  if (!row) return false;
  return PAID_PLANS.has(planOf(row)) && PAID_STATUS.has(row.status);
}

function stopAt(flags: boolean[]): Stop {
  let stop: Stop = "Inscrit";
  for (let i = 0; i < STEPS.length; i++) {
    if (!flags[i]) break;
    stop = STEPS[i];
  }
  return stop;
}

async function eachPage<T>(load: (from: number) => Promise<T[]>) {
  const rows: T[] = [];
  for (let from = 0; ; from += 1000) {
    const batch = await load(from);
    rows.push(...batch);
    if (batch.length < 1000) break;
  }
  return rows;
}

/** Comptes, connexions, étape d’onboarding et abonnements. Service role uniquement. */
export async function loadAdminStats(): Promise<AdminStats> {
  const admin = createAdminClient();
  const users: User[] = [];
  for (let page = 1; ; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw new Error(error.message);
    users.push(...data.users);
    if (data.users.length < 200) break;
  }

  const projects = await eachPage(async (from) => {
    const { data, error } = await admin
      .from("projects")
      .select("user_id")
      .range(from, from + 999);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

  const documents = await eachPage(async (from) => {
    const { data, error } = await admin
      .from("documents")
      .select("user_id, direction")
      .range(from, from + 999);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

  const subscriptions = await eachPage(async (from) => {
    const { data, error } = await admin
      .from("subscriptions")
      .select("user_id, plan, status")
      .range(from, from + 999);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

  const projectCountByUser = new Map<string, number>();
  for (const row of projects) {
    projectCountByUser.set(row.user_id, (projectCountByUser.get(row.user_id) ?? 0) + 1);
  }
  const inboundDocByUser = new Map<string, boolean>();
  for (const row of documents) {
    if (row.direction === "in") inboundDocByUser.set(row.user_id, true);
  }
  const subByUser = new Map(subscriptions.map((row) => [row.user_id, row]));

  const now = Date.now();
  const people: AdminPerson[] = users.map((user) => {
    const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
    const name = metaName(meta);
    const sub = subByUser.get(user.id);
    const paid = isPaid(sub);
    const flags = [
      true,
      Boolean(user.last_sign_in_at),
      name.length > 0,
      meta.onboarding_done === true,
      inboundDocByUser.get(user.id) === true,
      paid,
    ];
    const email = user.email ?? "";
    return {
      id: user.id,
      name: name || email.split("@")[0] || "Sans nom",
      email,
      createdAt: user.created_at,
      lastSignIn: user.last_sign_in_at ?? null,
      stop: stopAt(flags),
      plan: planOf(sub),
      paid,
      projects: projectCountByUser.get(user.id) ?? 0,
    };
  });

  people.sort((a, b) => {
    const aTime = a.lastSignIn ? Date.parse(a.lastSignIn) : 0;
    const bTime = b.lastSignIn ? Date.parse(b.lastSignIn) : 0;
    return bTime - aTime;
  });

  const funnel = STEPS.map((step, index) => ({
    step,
    count: people.filter((person) => STEPS.indexOf(person.stop) >= index).length,
  }));

  const planOrder: PlanId[] = ["free", "starter", "pro", "founder"];
  const planLabel: Record<PlanId, string> = {
    free: "Gratuit",
    starter: "Création",
    pro: "Pro",
    founder: "Fondateur",
  };
  const plans = planOrder.map((plan) => ({
    label: planLabel[plan],
    count: people.filter((person) => person.plan === plan).length,
  }));

  const days = Array.from({ length: 30 }, (_, index) => {
    const date = new Date();
    date.setUTCHours(0, 0, 0, 0);
    date.setUTCDate(date.getUTCDate() - (29 - index));
    return date.toISOString().slice(0, 10);
  });
  const perDay = new Map(days.map((day) => [day, 0]));
  let recent = 0;
  let prior = 0;
  const recentStart = Date.parse(`${days[0]}T00:00:00.000Z`);
  const priorStart = recentStart - 30 * 24 * 60 * 60 * 1000;
  for (const person of people) {
    const at = Date.parse(person.createdAt);
    const key = person.createdAt.slice(0, 10);
    if (perDay.has(key)) {
      perDay.set(key, (perDay.get(key) ?? 0) + 1);
      recent += 1;
    } else if (at >= priorStart && at < recentStart) {
      prior += 1;
    }
  }

  return {
    signedUp: people.length,
    activeWeek: people.filter(
      (person) => person.lastSignIn && now - Date.parse(person.lastSignIn) <= WEEK_MS,
    ).length,
    onboarded: people.filter((person) => STEPS.indexOf(person.stop) >= STEPS.indexOf("Wizard fini")).length,
    paid: people.filter((person) => person.paid).length,
    newSignups: recent,
    signupDelta: prior === 0 ? null : Math.round(((recent - prior) / prior) * 100),
    series: days.map((day) => ({ day, count: perDay.get(day) ?? 0 })),
    funnel,
    plans,
    people,
  };
}
