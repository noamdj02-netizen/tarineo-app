import "server-only";
import { cache } from "react";
import { getDb, type Db } from "@/lib/db";
import { createAdminClient } from "@/lib/supabase/admin";
import { isOpenAccess } from "@/lib/supabase/config";
import { LIMITS, OWNER_LIMITS, type Interval, type Limits, type PlanId, type TierIndex } from "./plans";

/** Comptes studio : aucune limite. */
export const OWNER_EMAILS = ["noamdj02@gmail.com", "contact@ink-flow.me"] as const;
export const OWNER_EMAIL = OWNER_EMAILS[0];

export type PlanInfo = {
  plan: PlanId;
  limits: Limits;
  status: string;
  interval: Interval | null;
  tier: TierIndex;
  periodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  hasCustomer: boolean;
  /** Abonnement Stripe actif (hors essai interne sans carte). */
  hasPaidSubscription: boolean;
  /** Essai Pro interne encore en cours. */
  isFreeTrial: boolean;
};

const PAID_STATUSES = new Set(["active", "past_due"]);

/** Comptes du créateur : jamais limités. */
export function isOwner(email: string | undefined) {
  if (!email) return false;
  const extra = (process.env.NAVPIT_OWNER_EMAILS ?? process.env.SEED_USER_EMAIL ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return extra.concat([...OWNER_EMAILS]).includes(email.toLowerCase());
}

function localStudio() {
  return process.env.NODE_ENV !== "production" && isOpenAccess();
}

async function isOwnerDb(db: Db) {
  if (localStudio() || isOwner(db.user.email)) return true;
  if (!db.user.id) return false;
  const { data } = await createAdminClient().auth.admin.getUserById(db.user.id);
  return isOwner(data.user?.email);
}

type SubscriptionRow = {
  plan: string | null;
  status: string | null;
  billing_interval: Interval | null;
  tier: number | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
};

function ownerPlanInfo(): PlanInfo {
  return {
    plan: "founder",
    limits: OWNER_LIMITS,
    status: "owner",
    interval: null,
    tier: 0,
    periodEnd: null,
    cancelAtPeriodEnd: false,
    hasCustomer: false,
    hasPaidSubscription: false,
    isFreeTrial: false,
  };
}

function planInfoFromSubscription(data: SubscriptionRow | null): PlanInfo {
  const hasStripeSub = Boolean(data?.stripe_subscription_id);
  const periodEndMs = data?.current_period_end ? Date.parse(data.current_period_end) : NaN;
  const trialLive =
    data?.status === "trialing" &&
    !hasStripeSub &&
    Number.isFinite(periodEndMs) &&
    periodEndMs > Date.now();
  const paidLive =
    PAID_STATUSES.has(data?.status ?? "") || (data?.status === "trialing" && hasStripeSub);
  const hasPaidSubscription = paidLive;
  const paidStarter = data?.plan === "starter" && paidLive;
  const paidPro = data?.plan === "pro" && paidLive;

  const plan: PlanId =
    data?.plan === "founder"
      ? "founder"
      : trialLive
        ? "pro"
        : paidPro
          ? "pro"
          : paidStarter
            ? "starter"
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
    hasPaidSubscription,
    isFreeTrial: trialLive,
  };
}

async function load(db: Db): Promise<PlanInfo> {
  if (await isOwnerDb(db)) return ownerPlanInfo();
  const { data } = await db.supabase
    .from("subscriptions")
    .select(
      "plan, status, billing_interval, tier, current_period_end, cancel_at_period_end, stripe_customer_id, stripe_subscription_id",
    )
    .eq("user_id", db.user.id)
    .maybeSingle();
  return planInfoFromSubscription(data as SubscriptionRow | null);
}

/** Plan pour un user_id (cron, MCP, clés API) sans session navigateur. */
export async function planForUserId(userId: string): Promise<PlanInfo | null> {
  if (!userId) return null;
  const admin = createAdminClient();
  const { data: userData } = await admin.auth.admin.getUserById(userId);
  const email = userData.user?.email;
  if (localStudio() || isOwner(email)) return ownerPlanInfo();

  const { data } = await admin
    .from("subscriptions")
    .select(
      "plan, status, billing_interval, tier, current_period_end, cancel_at_period_end, stripe_customer_id, stripe_subscription_id",
    )
    .eq("user_id", userId)
    .maybeSingle();
  return planInfoFromSubscription(data as SubscriptionRow | null);
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
  if (await isOwnerDb(db)) return null;
  const { limits } = await load(db);
  const head = { count: "exact" as const, head: true };
  switch (kind) {
    case "calendar":
      return limits.calendarSync ? null : LIMIT_MESSAGES.calendar;
    case "ai":
      if (limits.aiPerMonth === null) return null;
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
  projects:
    "Limite de projets atteinte. Passe en Création (6 projets) ou Pro (illimité) depuis Abonnement.",
  ai: "Quota IA du mois épuisé. Passe en Création ou Pro, ou attends le 1er du mois.",
  schemas: "Limite de schémas atteinte. Passe en Création (100) ou Pro (illimité).",
  calendar: "La synchro d’agenda Google ou Apple est incluse dans le plan Pro.",
} as const;
