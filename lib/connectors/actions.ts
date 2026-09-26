"use server";

import { revalidatePath } from "next/cache";
import { saveCalendarFeed } from "@/app/(app)/accueil/actions";
import { findTool, toolId } from "@/lib/connectors/catalog";
import {
  isEmail,
  isStripeKey,
  officialProfile,
  officialUrl,
  stripeHint,
  verifyStripeAccount,
} from "@/lib/connectors/official";
import { getDb } from "@/lib/db";
import { data } from "@/lib/mcp/data";
import { generateApiKey, parseScopes } from "@/lib/mcp/api-keys";
import { safeUrl } from "@/lib/projects/types";

type Result<T = object> = ({ ok: true } & T) | { ok: false; error: string };

function refresh() {
  revalidatePath("/outils");
  revalidatePath("/audit");
  revalidatePath("/accueil");
  revalidatePath("/copilote");
}

async function writeConnection(
  tool: string,
  on: boolean,
  extra?: { label?: string; kind?: string; config?: Record<string, unknown> },
): Promise<Result> {
  const db = await getDb();
  if (!db) return { ok: false, error: "Pas connecté." };
  const id = toolId(tool);
  if (!findTool(id)) return { ok: false, error: "Outil inconnu." };

  if (on) {
    const row = {
      user_id: db.user.id,
      tool_id: id,
      connected_at: new Date().toISOString(),
      account_label: extra?.label?.slice(0, 120) ?? "",
      bind_kind: extra?.kind ?? "stay",
      config: extra?.config ?? {},
    };
    const full = await db.supabase
      .from("tool_connections")
      .upsert(row, { onConflict: "user_id,tool_id" });
    if (full.error) {
      const { error } = await db.supabase.from("tool_connections").upsert(
        { user_id: db.user.id, tool_id: id, connected_at: row.connected_at },
        { onConflict: "user_id,tool_id" },
      );
      if (error) return { ok: false, error: "Connexion non enregistrée." };
    }
  } else {
    const { error } = await db.supabase
      .from("tool_connections")
      .delete()
      .eq("user_id", db.user.id)
      .eq("tool_id", id);
    if (error) return { ok: false, error: "Impossible de retirer." };
  }
  refresh();
  return { ok: true };
}

export async function activateTool(tool: string) {
  const meta = findTool(toolId(tool))?.meta;
  if (meta && meta.kind !== "internal") {
    return { ok: false as const, error: "Lie le compte officiel d’abord." };
  }
  return writeConnection(tool, true, { kind: "internal", label: "Navpit" });
}

export async function deactivateTool(tool: string) {
  return writeConnection(tool, false);
}

export async function saveToolLink(
  tool: string,
  field: "figma" | "notion" | "github" | "site",
  rawUrl: string,
): Promise<Result> {
  return bindOfficialUrl(tool, rawUrl, field);
}

export async function bindOfficialUrl(
  tool: string,
  raw: string,
  field?: "figma" | "notion" | "github" | "site",
): Promise<Result> {
  const db = await getDb();
  if (!db) return { ok: false, error: "Pas connecté." };
  const id = toolId(tool);
  const found = findTool(id);
  if (!found) return { ok: false, error: "Outil inconnu." };

  const url =
    officialProfile(id, raw) || officialUrl(id, raw) || safeUrl(raw.trim());
  if (!url) {
    return { ok: false, error: `Colle une URL officielle ${found.name}.` };
  }

  if (field) {
    const { data: focus } = await db.supabase
      .from("projects")
      .select("id")
      .eq("user_id", db.user.id)
      .eq("status", "focus")
      .order("sort_order")
      .limit(1)
      .maybeSingle();
    if (!focus) return { ok: false, error: "Mets un projet en Focus d’abord." };
    const patch =
      field === "figma"
        ? { figma: url }
        : field === "notion"
          ? { notion: url }
          : field === "github"
            ? { github: url }
            : { site: url };
    const { error } = await db.supabase
      .from("projects")
      .update(patch)
      .eq("id", focus.id)
      .eq("user_id", db.user.id);
    if (error) return { ok: false, error: "Lien non enregistré." };
  }

  return writeConnection(tool, true, {
    kind: "url",
    label: url.replace(/^https?:\/\//, "").slice(0, 80),
    config: { url },
  });
}

export async function bindStripeKey(raw: string): Promise<Result<{ label: string }>> {
  if (!isStripeKey(raw)) {
    return { ok: false, error: "Clé Stripe restreinte (rk_live_ ou rk_test_)." };
  }
  const account = await verifyStripeAccount(raw);
  if (!account) return { ok: false, error: "Stripe a refusé la clé. Vérifie-la." };
  const label = `${account.name} · ${account.live ? "live" : "test"} · ${stripeHint(raw)}`;
  const saved = await writeConnection("stripe", true, {
    kind: "secret",
    label,
    config: { accountId: account.id, live: account.live },
  });
  if (!saved.ok) return saved;
  return { ok: true, label };
}

export async function bindGmail(email: string): Promise<Result> {
  const db = await getDb();
  if (!db) return { ok: false, error: "Pas connecté." };
  const value = email.trim().toLowerCase();
  if (!isEmail(value)) return { ok: false, error: "Adresse Gmail invalide." };
  const gmail = value.endsWith("@gmail.com") || value.endsWith("@googlemail.com");
  const session = db.user.email?.toLowerCase();
  if (!gmail && session !== value) {
    return { ok: false, error: "Utilise une adresse Gmail, ou celle de ton compte." };
  }
  return writeConnection("gmail", true, {
    kind: "oauth",
    label: value,
    config: { email: value },
  });
}

export async function bindCalendarFeed(raw: string): Promise<Result> {
  const feed = await saveCalendarFeed(raw);
  if (!feed.ok) return feed;
  return writeConnection("apple-calendar", true, {
    kind: "feed",
    label: feed.provider,
    config: { provider: feed.provider },
  });
}

export async function provisionMcpKey(
  toolName: string,
): Promise<Result<{ key: string; prefix: string; reused: boolean }>> {
  const db = await getDb();
  if (!db) return { ok: false, error: "Pas connecté." };

  try {
    const keys = await data.listApiKeys(db.user.id);
    const live = keys.filter((k) => !k.revokedAt);
    const existing = live.find((k) => k.name.toLowerCase() === toolName.toLowerCase());
    if (existing) {
      const linked = await writeConnection(toolName, true, {
        kind: "mcp",
        label: existing.prefix,
      });
      if (!linked.ok) return linked;
      return { ok: true, key: "", prefix: existing.prefix, reused: true };
    }
    if (live.length >= 10) {
      return { ok: false, error: "Limite de 10 clés. Révoque-en une dans Compte." };
    }

    const { key, prefix, hash } = generateApiKey();
    await data.insertApiKey({
      userId: db.user.id,
      name: toolName.slice(0, 60),
      prefix,
      hash,
      scopes: parseScopes(["read", "write"]),
      lastUsedAt: null,
      revokedAt: null,
    });
    const linked = await writeConnection(toolName, true, { kind: "mcp", label: prefix });
    if (!linked.ok) return linked;
    refresh();
    return { ok: true, key, prefix, reused: false };
  } catch {
    return { ok: false, error: "Clé MCP impossible. Réessaie depuis Compte." };
  }
}

export async function markGoogleBound(tool: "gmail" | "google-drive"): Promise<Result> {
  const db = await getDb();
  if (!db) return { ok: false, error: "Pas connecté." };
  const email = db.user.email;
  if (!email) return { ok: false, error: "Compte Google introuvable." };
  return writeConnection(tool, true, {
    kind: "oauth",
    label: email,
    config: { email, provider: "google" },
  });
}
