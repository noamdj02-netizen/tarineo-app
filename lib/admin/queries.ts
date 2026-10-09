import "server-only";
import type { User } from "@supabase/supabase-js";
import { classifyAgent, EVENT_NAMES, FEATURE_LABEL, FEATURES, type FeatureKey } from "@/lib/analytics/catalog";
import { eur } from "@/lib/admin/format";
import { iso, type DateRange } from "@/lib/admin/range";
import { PLAN_LABEL, PRO, STARTER, type PlanId } from "@/lib/billing/plans";
import { createAdminClient } from "@/lib/supabase/admin";
import type { AnalyticsEventRow, ProjectRow, SubscriptionRow } from "@/lib/supabase/types";

const PAID = new Set(["active", "trialing", "past_due", "lifetime"]);
const COST_PER_AI = 0.018;

type Event = AnalyticsEventRow;
type Sub = Pick<
  SubscriptionRow,
  | "user_id"
  | "plan"
  | "status"
  | "billing_interval"
  | "started_at"
  | "current_period_end"
  | "cancel_at_period_end"
  | "stripe_subscription_id"
>;
type Project = Pick<ProjectRow, "id" | "user_id" | "status" | "next" | "pitch">;

export type AdminUser = {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  lastSignIn: string | null;
  plan: PlanId;
  paid: boolean;
  projects: number;
  hasFocus: boolean;
  status: string;
  periodEnd: string | null;
  startedAt: string | null;
  cancelAtPeriodEnd: boolean;
  isFreeTrial: boolean;
  daysRemaining: number | null;
};

function daysRemainingOf(periodEnd: string | null): number | null {
  if (!periodEnd) return null;
  const ms = Date.parse(periodEnd) - Date.now();
  if (!Number.isFinite(ms)) return null;
  return Math.max(0, Math.ceil(ms / 864e5));
}

function isFreeTrialOf(row: Sub | undefined) {
  if (!row || row.status !== "trialing") return false;
  if (row.stripe_subscription_id) return false;
  const end = row.current_period_end ? Date.parse(row.current_period_end) : NaN;
  return Number.isFinite(end) && end > Date.now();
}

async function pages<T>(load: (from: number) => Promise<T[]>) {
  const rows: T[] = [];
  for (let from = 0; ; from += 1000) {
    const batch = await load(from);
    rows.push(...batch);
    if (batch.length < 1000) break;
  }
  return rows;
}

function planOf(row: Sub | undefined): PlanId {
  if (row?.plan === "starter" || row?.plan === "pro" || row?.plan === "founder") return row.plan;
  return "free";
}

function isPaid(row: Sub | undefined) {
  return Boolean(row && planOf(row) !== "free" && PAID.has(row.status));
}

function mrrOf(row: Sub | undefined) {
  if (!isPaid(row) || !row) return 0;
  if (row.plan === "founder") return 0;
  const monthly = row.plan === "starter" ? STARTER.month : PRO.month;
  if (row.billing_interval === "year") return monthly;
  return monthly;
}

function nameOf(user: User) {
  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  const raw = [meta.first_name, meta.full_name, meta.name].find(
    (v): v is string => typeof v === "string" && v.trim().length > 0,
  );
  return raw?.trim() || user.email?.split("@")[0] || "Sans nom";
}

function inRange(isoDate: string, from: Date, to: Date) {
  const t = Date.parse(isoDate);
  return t >= from.getTime() && t <= to.getTime();
}

async function loadEvents(from: Date, to: Date) {
  const admin = createAdminClient();
  try {
    return await pages(async (start) => {
      const { data, error } = await admin
        .from("analytics_events")
        .select("*")
        .gte("created_at", iso(from))
        .lte("created_at", iso(to))
        .order("created_at", { ascending: true })
        .range(start, start + 999);
      if (error) throw error;
      return (data ?? []) as Event[];
    });
  } catch {
    return [] as Event[];
  }
}

export async function loadAdminBase() {
  const admin = createAdminClient();
  const users: User[] = [];
  for (let page = 1; ; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw new Error(error.message);
    users.push(...data.users);
    if (data.users.length < 200) break;
  }

  const projects = await pages(async (from) => {
    const { data, error } = await admin
      .from("projects")
      .select("id, user_id, status, next, pitch, updated_at")
      .range(from, from + 999);
    if (error) throw new Error(error.message);
    return (data ?? []) as Project[];
  });

  const subscriptions = await pages(async (from) => {
    const { data, error } = await admin
      .from("subscriptions")
      .select(
        "user_id, plan, status, billing_interval, started_at, current_period_end, cancel_at_period_end, stripe_subscription_id",
      )
      .range(from, from + 999);
    if (error) throw new Error(error.message);
    return (data ?? []) as Sub[];
  });

  const subByUser = new Map(subscriptions.map((row) => [row.user_id, row]));
  const projectsByUser = new Map<string, Project[]>();
  for (const project of projects) {
    const list = projectsByUser.get(project.user_id) ?? [];
    list.push(project);
    projectsByUser.set(project.user_id, list);
  }

  const people: AdminUser[] = users.map((user) => {
    const list = projectsByUser.get(user.id) ?? [];
    const sub = subByUser.get(user.id);
    const periodEnd = sub?.current_period_end ?? null;
    return {
      id: user.id,
      email: user.email ?? "",
      name: nameOf(user),
      createdAt: user.created_at,
      lastSignIn: user.last_sign_in_at ?? null,
      plan: planOf(sub),
      paid: isPaid(sub),
      projects: list.length,
      hasFocus: list.some((project) => project.status === "focus"),
      status: sub?.status ?? "none",
      periodEnd,
      startedAt: sub?.started_at ?? null,
      cancelAtPeriodEnd: Boolean(sub?.cancel_at_period_end),
      isFreeTrial: isFreeTrialOf(sub),
      daysRemaining: daysRemainingOf(periodEnd),
    };
  });

  return { people, projects, subscriptions, subByUser };
}

function sessionsFrom(events: Event[]) {
  const map = new Map<string, Event[]>();
  for (const event of events) {
    const list = map.get(event.session_id) ?? [];
    list.push(event);
    map.set(event.session_id, list);
  }
  return [...map.entries()].map(([id, list]) => {
    const sorted = list.slice().sort((a, b) => a.created_at.localeCompare(b.created_at));
    const start = Date.parse(sorted[0].created_at);
    const end = Date.parse(sorted[sorted.length - 1].created_at);
    const pages = [...new Set(sorted.map((event) => event.path).filter(Boolean))];
    const features = [...new Set(sorted.map((event) => event.feature).filter(Boolean))];
    const main = features.sort(
      (a, b) =>
        sorted.filter((event) => event.feature === b).length -
        sorted.filter((event) => event.feature === a).length,
    )[0];
    return {
      id,
      userId: sorted.find((event) => event.user_id)?.user_id ?? null,
      start: sorted[0].created_at,
      end: sorted[sorted.length - 1].created_at,
      durationMs: Math.max(0, end - start),
      pages: pages.length,
      actions: sorted.filter((event) => event.name !== "page_viewed" && event.name !== "session_started").length,
      feature: main || "—",
      exit: pages[pages.length - 1] || "—",
      events: sorted,
      features: features.length,
      ai: sorted.filter((event) => event.name === "copilot_prompt_sent").length,
      errors: sorted.filter((event) => event.name === "copilot_error").length,
    };
  });
}

function uniqueUsers(events: Event[], from: Date, to: Date) {
  return new Set(
    events.filter((event) => inRange(event.created_at, from, to) && event.user_id).map((event) => event.user_id),
  ).size;
}

export async function loadOverview(range: DateRange, activity: "dau" | "wau" | "mau" = "dau") {
  const { people, subscriptions } = await loadAdminBase();
  const events = await loadEvents(range.prevFrom, range.to);
  const nowEvents = events.filter((event) => inRange(event.created_at, range.from, range.to));
  const prevEvents = events.filter((event) => inRange(event.created_at, range.prevFrom, range.prevTo));
  const sessions = sessionsFrom(nowEvents);
  const prevSessions = sessionsFrom(prevEvents);

  const newUsers = people.filter((user) => inRange(user.createdAt, range.from, range.to)).length;
  const prevNew = people.filter((user) => inRange(user.createdAt, range.prevFrom, range.prevTo)).length;
  const active = uniqueUsers(nowEvents, range.from, range.to) ||
    people.filter((user) => user.lastSignIn && inRange(user.lastSignIn, range.from, range.to)).length;
  const prevActive = uniqueUsers(prevEvents, range.prevFrom, range.prevTo) ||
    people.filter((user) => user.lastSignIn && inRange(user.lastSignIn, range.prevFrom, range.prevTo)).length;

  const avg = sessions.length ? sessions.reduce((sum, session) => sum + session.durationMs, 0) / sessions.length : 0;
  const prevAvg = prevSessions.length
    ? prevSessions.reduce((sum, session) => sum + session.durationMs, 0) / prevSessions.length
    : 0;

  const activated = people.filter((user) => user.projects > 0).length;
  const prevActivated = people.filter(
    (user) => user.projects > 0 && Date.parse(user.createdAt) <= range.prevTo.getTime(),
  ).length;
  const activation = people.length ? (activated / people.length) * 100 : 0;
  const prevActivation = people.length ? (prevActivated / Math.max(1, people.filter((u) => Date.parse(u.createdAt) <= range.prevTo.getTime()).length)) * 100 : 0;

  const paid = people.filter((user) => user.paid).length;
  const conversion = people.length ? (paid / people.length) * 100 : 0;
  const prevPaidPeople = people.filter(
    (user) => user.paid && Date.parse(user.createdAt) <= range.prevTo.getTime(),
  ).length;
  const prevConv =
    people.filter((u) => Date.parse(u.createdAt) <= range.prevTo.getTime()).length === 0
      ? 0
      : (prevPaidPeople / people.filter((u) => Date.parse(u.createdAt) <= range.prevTo.getTime()).length) * 100;

  const mrr = subscriptions.reduce((sum, row) => sum + mrrOf(row), 0);
  const lost = people.filter(
    (user) =>
      Date.parse(user.createdAt) < range.from.getTime() &&
      !user.paid &&
      (!user.lastSignIn || Date.parse(user.lastSignIn) < range.from.getTime()),
  ).length;
  const base = Math.max(1, people.filter((user) => Date.parse(user.createdAt) < range.from.getTime()).length);
  const churn = (lost / base) * 100;

  const days: string[] = [];
  for (let t = range.from.getTime(); t <= range.to.getTime(); t += 864e5) {
    days.push(new Date(t).toISOString().slice(0, 10));
  }
  const series = days.map((day) => {
    const start = new Date(`${day}T00:00:00`);
    const window = activity === "mau" ? 30 : activity === "wau" ? 7 : 1;
    const from = new Date(start.getTime() - (window - 1) * 864e5);
    const to = new Date(`${day}T23:59:59`);
    const fromEvents = uniqueUsers(events, from, to);
    const fallback = people.filter((user) => user.lastSignIn && inRange(user.lastSignIn, from, to)).length;
    return { day, count: fromEvents || fallback };
  });

  const visit = nowEvents.filter((event) => event.name === "page_viewed" || event.name === "session_started").length ||
    people.length;
  const signed = people.filter((user) => inRange(user.createdAt, range.from, range.to)).length || people.length;
  const withProject = people.filter((user) => user.projects > 0).length;
  const withFocus = people.filter((user) => user.hasFocus).length;
  const firstAction =
    nowEvents.filter((event) => event.name === "task_created" || event.name === "task_completed").length > 0
      ? new Set(
          nowEvents
            .filter((event) => event.name === "task_created" || event.name === "task_completed")
            .map((event) => event.user_id)
            .filter(Boolean),
        ).size
      : people.filter((user) => user.projects > 0).length;
  const returned = new Set(
    nowEvents
      .filter((event) => {
        const person = people.find((user) => user.id === event.user_id);
        if (!person) return false;
        return Date.parse(event.created_at) - Date.parse(person.createdAt) >= 7 * 864e5;
      })
      .map((event) => event.user_id),
  ).size;

  const funnelCounts = [
    { label: "Visite", count: Math.max(visit, people.length, 1) },
    { label: "Inscription", count: signed || people.length },
    { label: "Premier projet", count: withProject },
    { label: "Premier Focus", count: withFocus },
    { label: "Première action", count: firstAction },
    { label: "Retour J+7", count: returned },
    { label: "Essai → Pro", count: paid },
  ];
  const funnelBase = Math.max(1, funnelCounts[0].count);
  const funnel = funnelCounts.map((step) => ({ ...step, share: (step.count / funnelBase) * 100 }));

  return {
    kpis: {
      active: { now: active, prev: prevActive },
      newcomers: { now: newUsers, prev: prevNew },
      sessions: { now: sessions.length, prev: prevSessions.length },
      time: { now: avg, prev: prevAvg },
      activation: { now: activation, prev: prevActivation },
      conversion: { now: conversion, prev: prevConv },
      mrr: { now: mrr, prev: mrr },
      churn: { now: churn, prev: churn },
    },
    series,
    funnel,
    activity,
  };
}

export async function loadUsers(range: DateRange) {
  const { people } = await loadAdminBase();
  const events = await loadEvents(range.from, range.to);
  const lastByUser = new Map<string, Event>();
  for (const event of events) {
    if (event.user_id) lastByUser.set(event.user_id, event);
  }
  return people
    .slice()
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
    .map((user) => ({
      ...user,
      lastEvent: lastByUser.get(user.id)?.name ?? null,
      lastPath: lastByUser.get(user.id)?.path ?? null,
    }));
}

export async function loadSessions(range: DateRange) {
  const events = await loadEvents(range.from, range.to);
  const { people } = await loadAdminBase();
  const names = new Map(people.map((user) => [user.id, user]));
  return sessionsFrom(events)
    .sort((a, b) => Date.parse(b.start) - Date.parse(a.start))
    .map((session) => ({
      ...session,
      label: session.userId ? names.get(session.userId)?.name || shortish(session.userId) : "Anonyme",
    }));
}

export async function loadSession(id: string) {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("analytics_events")
    .select("*")
    .eq("session_id", id)
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  const events = (data ?? []) as Event[];
  if (!events.length) return null;
  const [session] = sessionsFrom(events);
  const { people } = await loadAdminBase();
  const person = session.userId ? people.find((user) => user.id === session.userId) : null;
  return { ...session, label: person?.name || (session.userId ? shortish(session.userId) : "Anonyme") };
}

function shortish(id: string) {
  return `user_${id.replace(/-/g, "").slice(0, 4)}`;
}

export async function loadFeatures(range: DateRange) {
  const { people } = await loadAdminBase();
  const events = await loadEvents(range.from, new Date(range.to.getTime() + 30 * 864e5));
  const inWindow = events.filter((event) => inRange(event.created_at, range.from, range.to));
  const active = new Set(
    inWindow.filter((event) => event.user_id).map((event) => event.user_id as string),
  );
  const paid = new Set(people.filter((user) => user.paid).map((user) => user.id));
  const rows = FEATURES.filter((key) => key !== "accueil" && key !== "pricing").map((key) => {
    const used = new Set(
      inWindow
        .filter((event) => event.feature === key && event.user_id)
        .map((event) => event.user_id as string),
    );
    const returned = [...used].filter((userId) =>
      events.some(
        (event) =>
          event.user_id === userId &&
          Date.parse(event.created_at) >=
            Date.parse(inWindow.find((row) => row.user_id === userId && row.feature === key)?.created_at ?? "") +
              7 * 864e5,
      ),
    ).length;
    const converted = [...used].filter((userId) => paid.has(userId)).length;
    const denom = Math.max(1, active.size || people.length);
    return {
      key,
      label: FEATURE_LABEL[key as FeatureKey],
      usage: (used.size / denom) * 100,
      return7: used.size ? (returned / used.size) * 100 : 0,
      conversion: used.size ? (converted / used.size) * 100 : 0,
      users: used.size,
    };
  });
  return rows.sort((a, b) => b.usage - a.usage);
}

export async function loadAi(range: DateRange) {
  const events = await loadEvents(range.from, range.to);
  const prompts = events.filter((event) => event.name === "copilot_prompt_sent");
  const replies = events.filter((event) => event.name === "copilot_response_received");
  const errors = events.filter((event) => event.name === "copilot_error");
  const times = replies.map((event) => event.duration_ms ?? 0).filter((ms) => ms > 0).sort((a, b) => a - b);
  const p = (q: number) => (times.length ? times[Math.min(times.length - 1, Math.floor((times.length - 1) * q))] : 0);
  const agents = new Map<string, number>();
  for (const event of prompts) {
    const raw = event.properties?.agent;
    const label = typeof raw === "string" && raw ? raw : classifyAgent(String(event.properties?.prompt ?? ""));
    agents.set(label, (agents.get(label) ?? 0) + 1);
  }
  const sessions = sessionsFrom(events);
  const withAi = sessions.filter((session) => session.ai > 0);
  let before = 0;
  let after = 0;
  for (const session of withAi) {
    const first = session.events.find((event) => event.name === "copilot_prompt_sent");
    const last = [...session.events].reverse().find((event) => event.name.startsWith("copilot_"));
    if (!first || !last) continue;
    before += Date.parse(first.created_at) - Date.parse(session.start);
    after += Date.parse(session.end) - Date.parse(last.created_at);
  }
  const agentRows = [...agents.entries()]
    .map(([label, count]) => ({ label, count, share: prompts.length ? (count / prompts.length) * 100 : 0 }))
    .sort((a, b) => b.count - a.count);
  return {
    requests: prompts.length,
    avg: times.length ? times.reduce((a, b) => a + b, 0) / times.length : 0,
    p50: p(0.5),
    p95: p(0.95),
    success: prompts.length ? ((prompts.length - errors.length) / prompts.length) * 100 : 0,
    errors: prompts.length ? (errors.length / prompts.length) * 100 : 0,
    errorCount: errors.length,
    cost: prompts.length * COST_PER_AI,
    agents: agentRows,
    before: withAi.length ? before / withAi.length : 0,
    after: withAi.length ? after / withAi.length : 0,
    sessionsWith: withAi.length,
    sessionsWithout: sessions.filter((session) => session.ai === 0).length,
  };
}

export async function loadChurn(range: DateRange) {
  const { people } = await loadAdminBase();
  const events = await loadEvents(new Date(range.from.getTime() - 90 * 864e5), range.to);
  const stale = people.filter((user) => {
    const last = user.lastSignIn ? Date.parse(user.lastSignIn) : Date.parse(user.createdAt);
    return !user.paid && last < range.from.getTime();
  });
  const reasons = [
    { label: "N'ont jamais créé leur premier projet", count: stale.filter((user) => user.projects === 0).length },
    { label: "Ont créé un projet mais jamais utilisé le Focus", count: stale.filter((user) => user.projects > 0 && !user.hasFocus).length },
    {
      label: "Ont utilisé TARINEO < 10 min",
      count: stale.filter((user) => {
        const own = events.filter((event) => event.user_id === user.id);
        if (!own.length) return true;
        const span = Date.parse(own[own.length - 1].created_at) - Date.parse(own[0].created_at);
        return span < 10 * 60 * 1000;
      }).length,
    },
    {
      label: "Ont testé le Copilote puis arrêté",
      count: stale.filter((user) => events.some((event) => event.user_id === user.id && event.name.startsWith("copilot_"))).length,
    },
    {
      label: "Problème / bug",
      count: stale.filter((user) => events.some((event) => event.user_id === user.id && event.name === "copilot_error")).length,
    },
  ];
  const last = new Map<string, number>();
  for (const user of stale) {
    const own = events.filter((event) => event.user_id === user.id);
    const feature = own[own.length - 1]?.feature || own[own.length - 1]?.path || "—";
    const label =
      feature === "projets" || feature.startsWith("/projets")
        ? "Projet créé"
        : feature === "copilote"
          ? "Copilote"
          : feature === "ressources"
            ? "Ressources"
            : feature === "pricing"
              ? "Pricing"
              : feature.includes("compte") || feature.includes("param")
                ? "Paramètres"
                : FEATURE_LABEL[feature as FeatureKey] || "Autre";
    last.set(label, (last.get(label) ?? 0) + 1);
  }
  return {
    lost: stale.length,
    reasons,
    lastAction: [...last.entries()].map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count),
  };
}

export async function loadCohorts() {
  const { people } = await loadAdminBase();
  const from = new Date();
  from.setDate(from.getDate() - 35);
  const events = await loadEvents(from, new Date());
  const weeks: { start: Date; label: string }[] = [];
  const cursor = startMonday(new Date());
  for (let i = 3; i >= 0; i--) {
    const start = new Date(cursor.getTime() - i * 7 * 864e5);
    weeks.push({
      start,
      label: start.toLocaleDateString("fr-FR", { month: "short", day: "numeric" }),
    });
  }
  return weeks.map((week) => {
    const end = new Date(week.start.getTime() + 7 * 864e5);
    const cohort = people.filter((user) => {
      const t = Date.parse(user.createdAt);
      return t >= week.start.getTime() && t < end.getTime();
    });
    const size = cohort.length;
    const at = (days: number) => {
      if (!size) return null;
      const gate = week.start.getTime() + days * 864e5;
      if (Date.now() < gate) return null;
      const hit = cohort.filter((user) =>
        events.some(
          (event) =>
            event.user_id === user.id &&
            Date.parse(event.created_at) >= Date.parse(user.createdAt) + days * 864e5 &&
            Date.parse(event.created_at) < Date.parse(user.createdAt) + (days + 1) * 864e5,
        ) ||
        (user.lastSignIn &&
          Date.parse(user.lastSignIn) >= Date.parse(user.createdAt) + days * 864e5),
      ).length;
      return (hit / size) * 100;
    };
    return { label: week.label, size, j0: 100, j1: at(1), j7: at(7), j14: at(14), j30: at(30) };
  });
}

function startMonday(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  const day = next.getDay();
  next.setDate(next.getDate() - (day === 0 ? 6 : day - 1));
  return next;
}

export async function loadEventsFeed(range: DateRange, name?: string) {
  const events = await loadEvents(range.from, range.to);
  const filtered = name ? events.filter((event) => event.name === name) : events;
  const counts = new Map<string, number>();
  for (const event of events) counts.set(event.name, (counts.get(event.name) ?? 0) + 1);
  return {
    rows: filtered.slice(-400).reverse(),
    volume: EVENT_NAMES.map((eventName) => ({ name: eventName, count: counts.get(eventName) ?? 0 })),
  };
}

export async function loadBusiness(range: DateRange) {
  const { people, subscriptions } = await loadAdminBase();
  const byPlan = (["free", "starter", "pro", "founder"] as PlanId[]).map((plan) => ({
    plan,
    label: PLAN_LABEL[plan],
    count: people.filter((user) => user.plan === plan).length,
    paid: people.filter((user) => user.plan === plan && user.paid).length,
  }));
  const mrr = subscriptions.reduce((sum, row) => sum + mrrOf(row), 0);
  const newPaid = people.filter((user) => user.paid && inRange(user.createdAt, range.from, range.to)).length;
  const withPeriod = people
    .filter((user) => user.plan !== "free" || user.isFreeTrial)
    .map((user) => ({
      id: user.id,
      email: user.email,
      name: user.name,
      plan: user.plan,
      status: user.status,
      periodEnd: user.periodEnd,
      daysRemaining: user.daysRemaining,
      isFreeTrial: user.isFreeTrial,
      cancelAtPeriodEnd: user.cancelAtPeriodEnd,
      paid: user.paid,
    }))
    .sort((a, b) => (a.daysRemaining ?? 9999) - (b.daysRemaining ?? 9999));
  return {
    byPlan,
    mrr,
    paid: people.filter((user) => user.paid).length,
    newPaid,
    users: people.length,
    withPeriod,
  };
}

const DOC_ANALYSIS_EVENTS = new Set([
  "document_ingested",
  "document_confirmed",
  "demo_document_analyzed",
]);
const ERROR_EVENTS = new Set([
  "copilot_error",
  "copilot_tool_failed",
  "document_transform_failed",
]);

export async function loadCockpit(range: DateRange) {
  const { people } = await loadAdminBase();
  const events = await loadEvents(range.from, range.to);
  const admin = createAdminClient();

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  let docsInRange: { user_id: string; created_at: string }[] = [];
  let docsThisMonth: { user_id: string }[] = [];
  try {
    const [rangeDocs, monthDocs] = await Promise.all([
      pages(async (from) => {
        const { data, error } = await admin
          .from("documents")
          .select("user_id, created_at")
          .gte("created_at", iso(range.from))
          .lte("created_at", iso(range.to))
          .range(from, from + 999);
        if (error) throw error;
        return (data ?? []) as { user_id: string; created_at: string }[];
      }),
      pages(async (from) => {
        const { data, error } = await admin
          .from("documents")
          .select("user_id")
          .gte("created_at", iso(monthStart))
          .range(from, from + 999);
        if (error) throw error;
        return (data ?? []) as { user_id: string }[];
      }),
    ]);
    docsInRange = rangeDocs;
    docsThisMonth = monthDocs;
  } catch {
    docsInRange = [];
    docsThisMonth = [];
  }

  const sessions = sessionsFrom(events);
  const activeUserIds = new Set(
    events.filter((e) => e.user_id).map((e) => e.user_id as string),
  );
  const trials = people.filter((u) => u.isFreeTrial).length;
  const paidPro = people.filter((u) => u.paid && (u.plan === "pro" || u.plan === "founder")).length;
  const paidStarter = people.filter((u) => u.paid && u.plan === "starter").length;
  const analysesEvents = events.filter((e) => DOC_ANALYSIS_EVENTS.has(e.name)).length;
  const analysesDocs = docsInRange.length;
  const errors = events.filter((e) => ERROR_EVENTS.has(e.name) || e.name.endsWith("_error")).length;

  const sessionsByUser = new Map<string, number>();
  for (const s of sessions) {
    if (!s.userId) continue;
    sessionsByUser.set(s.userId, (sessionsByUser.get(s.userId) ?? 0) + 1);
  }
  const pageViewsByUser = new Map<string, number>();
  const analysesByUser = new Map<string, number>();
  const errorsByUser = new Map<string, number>();
  const lastSeenByUser = new Map<string, string>();
  for (const e of events) {
    if (!e.user_id) continue;
    if (e.name === "page_viewed") {
      pageViewsByUser.set(e.user_id, (pageViewsByUser.get(e.user_id) ?? 0) + 1);
    }
    if (DOC_ANALYSIS_EVENTS.has(e.name)) {
      analysesByUser.set(e.user_id, (analysesByUser.get(e.user_id) ?? 0) + 1);
    }
    if (ERROR_EVENTS.has(e.name) || e.name.endsWith("_error")) {
      errorsByUser.set(e.user_id, (errorsByUser.get(e.user_id) ?? 0) + 1);
    }
    const prev = lastSeenByUser.get(e.user_id);
    if (!prev || Date.parse(e.created_at) > Date.parse(prev)) {
      lastSeenByUser.set(e.user_id, e.created_at);
    }
  }
  const docsByUserRange = new Map<string, number>();
  for (const d of docsInRange) {
    docsByUserRange.set(d.user_id, (docsByUserRange.get(d.user_id) ?? 0) + 1);
  }
  const docsByUserMonth = new Map<string, number>();
  for (const d of docsThisMonth) {
    docsByUserMonth.set(d.user_id, (docsByUserMonth.get(d.user_id) ?? 0) + 1);
  }

  const accounts = people
    .map((user) => {
      const sessionsCount = sessionsByUser.get(user.id) ?? 0;
      const pageViews = pageViewsByUser.get(user.id) ?? 0;
      const analyses = (analysesByUser.get(user.id) ?? 0) + (docsByUserRange.get(user.id) ?? 0);
      const errCount = errorsByUser.get(user.id) ?? 0;
      const docsMonth = docsByUserMonth.get(user.id) ?? 0;
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        plan: user.plan,
        status: user.status,
        paid: user.paid,
        isFreeTrial: user.isFreeTrial,
        daysRemaining: user.daysRemaining,
        periodEnd: user.periodEnd,
        cancelAtPeriodEnd: user.cancelAtPeriodEnd,
        sessions: sessionsCount,
        pageViews,
        analyses,
        errors: errCount,
        docsThisMonth: docsMonth,
        usageScore: sessionsCount * 2 + pageViews + analyses * 3 + docsMonth * 2,
        lastSeen: lastSeenByUser.get(user.id) ?? user.lastSignIn,
      };
    })
    .sort((a, b) => b.usageScore - a.usageScore);

  return {
    kpis: {
      activeUsers: activeUserIds.size,
      trials,
      paidPro,
      paidStarter,
      analyses: analysesEvents + analysesDocs,
      errors,
      sessions: sessions.length,
    },
    accounts,
  };
}

export function formatMoney(value: number) {
  return eur(value);
}
