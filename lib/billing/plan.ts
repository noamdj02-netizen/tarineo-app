import "server-only";
import { cache } from "react";
import { getDb, type Db } from "@/lib/db";
import { LIMITS, type Interval, type Limits, type PlanId, type TierIndex } from "./plans";

export type PlanInfo = {
  plan: PlanId;
  limits: Limits;
  status: string;
  interval: Interval | null;
  tier: TierIndex;
  periodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  hasCustomer: boolean;
};

const ACTIVE = new Set(["active", "trialing", "past_due"]);

/** Comptes du créateur (NAVPIT_OWNER_EMAILS, séparés par des virgules) : jamais limités. */
export function isOwner(email: string | undefined) {
  if (!email) return false;
  const list = (process.env.NAVPIT_OWNER_EMAILS ?? process.env.SEED_USER_EMAIL ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return list.includes(email.toLowerCase());
}

async function load(db: Db): Promise<PlanInfo> {
  if (isOwner(db.user.email)) {
    return {
      plan: "founder",
      limits: LIMITS.founder,
      status: "owner",
      interval: null,
      tier: 0,
      periodEnd: null,
      cancelAtPeriodEnd: false,
      hasCustomer: false,
    };
  }
  const { data } = await db.supabase
    .from("subscriptions")
    .select("plan, status, billing_interval, tier, current_period_end, cancel_at_period_end, stripe_customer_id")
    .eq("user_id", db.user.id)
    .maybeSingle();

  const plan: PlanId =
    data?.plan === "founder"
      ? "founder"
      : data?.plan === "pro" && ACTIVE.has(data.status)
        ? "pro"
        : "free";
  return {
    plan,
    limits: LIMITS[plan],
    status: data?.status ?? "none",
    interval: data?.billing_interval ?? null,
    tier: (data?.tier ?? 0) as TierIndex,
    periodEnd: data?.current_period_end ?? null,
    cancelAtPeriodEnd: data?.cancel_at_period_end ?? false,
    hasCustomer: Boolean(data?.stripe_customer_id),
  };
}

/** Plan de l'utilisateur courant (Gratuit par défaut). Une lecture par requête. */
export const getPlan = cache(async (): Promise<PlanInfo | null> => {
  const db = await getDb();
  return db ? load(db) : null;
});

export function planFor(db: Db) {
  return load(db);
}

/** Début du mois en cours (UTC), pour les quotas mensuels. */
export function monthStart(now = new Date()) {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();
}

export async function aiUsedThisMonth(db: Db) {
  const { count } = await db.supabase
    .from("chat_messages")
    .select("id", { count: "exact", head: true })
    .eq("user_id", db.user.id)
    .eq("role", "user")
    .gte("created_at", monthStart());
  return count ?? 0;
}

export type LimitKind = "projects" | "ai" | "schemas" | "calendar";

/** Renvoie le message à afficher si la limite du plan est atteinte, sinon null. */
export async function limitReached(db: Db, kind: LimitKind): Promise<string | null> {
  const { limits } = await load(db);
  const head = { count: "exact" as const, head: true };
  switch (kind) {
    case "calendar":
      return limits.calendarSync ? null : LIMIT_MESSAGES.calendar;
    case "ai":
      return (await aiUsedThisMonth(db)) >= limits.aiPerMonth ? LIMIT_MESSAGES.ai : null;
    case "projects": {
      if (limits.projects === null) return null;
      const { count } = await db.supabase.from("projects").select("id", head).eq("user_id", db.user.id);
      return (count ?? 0) >= limits.projects ? LIMIT_MESSAGES.projects : null;
    }
    case "schemas": {
      if (limits.schemas === null) return null;
      const { count } = await db.supabase
        .from("project_schemas")
        .select("id", head)
        .eq("user_id", db.user.id);
      return (count ?? 0) >= limits.schemas ? LIMIT_MESSAGES.schemas : null;
    }
  }
}

export const LIMIT_MESSAGES = {
  projects: "Le plan Gratuit est limité à 2 projets. Passe Pro pour en ajouter d’autres.",
  ai: "Tu as utilisé toutes tes questions IA du mois. Passe Pro, ou attends le 1er du mois.",
  schemas: "Le plan Gratuit est limité à 3 schémas. Passe Pro pour en créer d’autres.",
  calendar: "La synchro d’agenda Google ou Apple fait partie du plan Pro.",
} as const;
