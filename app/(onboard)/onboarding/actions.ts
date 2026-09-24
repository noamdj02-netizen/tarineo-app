"use server";

import Anthropic from "@anthropic-ai/sdk";
import { revalidatePath } from "next/cache";
import { isLocale } from "@/lib/i18n";
import { getDb } from "@/lib/db";
import { DEFAULT_MODEL } from "@/lib/models";
import { slugify } from "@/lib/projects/types";
import { THEMES } from "@/lib/design-data/themes";
import { updateUserMeta } from "@/lib/profile";

type Result = { ok: true } | { ok: false; error: string };

export type Analysis = {
  pitch: string;
  target: string;
  problem: string;
  next: string;
};

const TOOLS = [
  "Figma",
  "Notion",
  "Cursor",
  "Claude",
  "ChatGPT",
  "GitHub",
  "Vercel",
  "Supabase",
  "Stripe",
  "Gmail",
  "Canva",
  "LinkedIn",
] as const;

export async function saveWelcome(input: { firstName: string; locale: string }): Promise<Result> {
  const name = input.firstName.trim().slice(0, 60);
  if (!name) return { ok: false, error: "Indique un prénom." };
  if (!isLocale(input.locale)) return { ok: false, error: "Langue inconnue." };
  const res = await updateUserMeta({ first_name: name, locale: input.locale });
  if (!res.ok) return res;
  revalidatePath("/onboarding");
  return { ok: true };
}

export async function saveProjects(names: string[]): Promise<Result & { ids?: string[] }> {
  const db = await getDb();
  if (!db) return { ok: false, error: "Pas connecté." };
  const titles = names.map((n) => n.trim().slice(0, 80)).filter(Boolean).slice(0, 3);
  if (!titles.length) return { ok: false, error: "Ajoute au moins un projet." };

  const { data: taken } = await db.supabase.from("projects").select("slug, sort_order").eq("user_id", db.user.id);
  const slugs = new Set((taken ?? []).map((p) => p.slug));
  let sort = Math.max(0, ...(taken ?? []).map((p) => p.sort_order));
  const ids: string[] = [];

  for (const [i, title] of titles.entries()) {
    const base = slugify(title) || `projet-${i + 1}`;
    let slug = base;
    for (let n = 2; slugs.has(slug); n++) slug = `${base}-${n}`;
    slugs.add(slug);
    sort += 1;
    const { data, error } = await db.supabase
      .from("projects")
      .insert({
        user_id: db.user.id,
        slug,
        name: title,
        status: i === 0 ? "focus" : "pause",
        stage: 1,
        sort_order: sort,
      })
      .select("id")
      .single();
    if (error || !data) return { ok: false, error: "Projet non créé. Réessaie." };
    ids.push(data.id);
  }
  revalidatePath("/projets");
  return { ok: true, ids };
}

export async function analyzeProjects(projectIds: string[]): Promise<
  { ok: true; analyses: Record<string, Analysis> } | { ok: false; error: string }
> {
  const db = await getDb();
  if (!db) return { ok: false, error: "Pas connecté." };
  const { data: rows } = await db.supabase
    .from("projects")
    .select("id, name")
    .eq("user_id", db.user.id)
    .in("id", projectIds.slice(0, 3));
  if (!rows?.length) return { ok: false, error: "Aucun projet à analyser." };

  const analyses: Record<string, Analysis> = {};
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    for (const p of rows) {
      const a = fallbackAnalysis(p.name);
      analyses[p.id] = a;
      await db.supabase
        .from("projects")
        .update({ pitch: a.pitch, target: a.target, problem: a.problem, next: a.next })
        .eq("id", p.id)
        .eq("user_id", db.user.id);
    }
    return { ok: true, analyses };
  }

  try {
    const client = new Anthropic({ apiKey: key });
    const list = rows.map((p) => `- ${p.name}`).join("\n");
    const msg = await client.messages.create({
      model: DEFAULT_MODEL,
      max_tokens: 800,
      messages: [
        {
          role: "user",
          content: `Pour chaque projet, donne un JSON { "items": [{ "name", "pitch", "target", "problem", "next" }] }.
pitch = 1 phrase. target = qui paie. problem = le problème. next = 1 action cette semaine.
Projets :
${list}
Réponds uniquement en JSON.`,
        },
      ],
    });
    const text = msg.content.map((b) => (b.type === "text" ? b.text : "")).join("");
    const parsed = parseAnalyses(text, rows);
    for (const p of rows) {
      const a = parsed[p.name] ?? fallbackAnalysis(p.name);
      analyses[p.id] = a;
      await db.supabase
        .from("projects")
        .update({ pitch: a.pitch, target: a.target, problem: a.problem, next: a.next })
        .eq("id", p.id)
        .eq("user_id", db.user.id);
    }
    return { ok: true, analyses };
  } catch {
    for (const p of rows) analyses[p.id] = fallbackAnalysis(p.name);
    return { ok: true, analyses };
  }
}

export async function saveTaste(theme: string, tools: string[]): Promise<Result> {
  if (!THEMES.some((t) => t.id === theme)) return { ok: false, error: "Thème inconnu." };
  const picked = tools.filter((t) => (TOOLS as readonly string[]).includes(t)).slice(0, 12);
  const db = await getDb();
  const res = await updateUserMeta({ theme, tools: picked });
  if (!res.ok) return res;
  if (db) {
    await db.supabase
      .from("projects")
      .update({ theme })
      .eq("user_id", db.user.id)
      .eq("status", "focus");
  }
  return { ok: true };
}

export async function finishOnboarding(): Promise<Result> {
  const res = await updateUserMeta({ onboarding_done: true });
  if (!res.ok) return { ok: false, error: "Impossible de terminer. Réessaie." };
  revalidatePath("/", "layout");
  return { ok: true };
}

function fallbackAnalysis(name: string): Analysis {
  return {
    pitch: `${name} aide un fondateur solo à vendre plus vite, sans se disperser.`,
    target: "Les personnes qui ont ce problème aujourd’hui et peuvent payer.",
    problem: "Trop d’outils, pas assez de focus jusqu’à la première vente.",
    next: "Écrire la page d’accueil et parler à 3 clients cette semaine.",
  };
}

function parseAnalyses(text: string, rows: { id: string; name: string }[]) {
  const out: Record<string, Analysis> = {};
  try {
    const json = JSON.parse(text.replace(/```json|```/g, "").trim()) as {
      items?: { name?: string; pitch?: string; target?: string; problem?: string; next?: string }[];
    };
    for (const item of json.items ?? []) {
      const row = rows.find((r) => r.name === item.name) ?? rows[0];
      if (!row) continue;
      out[row.name] = {
        pitch: String(item.pitch ?? "").slice(0, 280) || fallbackAnalysis(row.name).pitch,
        target: String(item.target ?? "").slice(0, 200) || fallbackAnalysis(row.name).target,
        problem: String(item.problem ?? "").slice(0, 200) || fallbackAnalysis(row.name).problem,
        next: String(item.next ?? "").slice(0, 200) || fallbackAnalysis(row.name).next,
      };
    }
  } catch {
    /* fallback */
  }
  return out;
}
