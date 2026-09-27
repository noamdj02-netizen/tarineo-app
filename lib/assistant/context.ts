import "server-only";
import type { Db } from "@/lib/db";
import { COMPONENTS } from "@/lib/design-data/components";
import { FRAMES } from "@/lib/design-data/frames";
import { BLOCKS, PACKS } from "@/lib/design-data/packs";
import { STAGES } from "@/lib/design-data/resources";
import { THEMES, swatches } from "@/lib/design-data/themes";
import { data } from "@/lib/mcp/data";
import { OD_SKILLS, pickOdSkill } from "@/lib/open-design/catalog";
import { designMdForTheme } from "@/lib/open-design/design-md";
import { ROLE_PROMPTS, type AgentRole } from "./roles";

/**
 * Catalogue design : seulement si la question (ou le rôle) parle landing / thème / composant.
 */
export const STATIC_KNOWLEDGE = [
  `THÈMES: ${THEMES.map(
    (t) =>
      `${t.n} (${t.f}; ${t.fonts}; couleurs ${swatches(t.id)
        .map((s) => s.c)
        .join(" ")})`,
  ).join(" | ")}`,
  `MÉTHODE LANDING (12 frames): ${FRAMES.map((f, i) => `${i + 1}.${f.n}: ${f.rule}`).join(" ")}`,
  `COMPOSANTS DISPONIBLES: ${COMPONENTS.map((c) => c.n).join(", ")}`,
  `COMPOSANTS 2 (styles Behance): ${BLOCKS.map(
    (c) => `${c.n} [${PACKS.find((p) => p.id === c.pk)?.n ?? c.pk}]`,
  ).join(", ")}`,
  "Ne jamais inventer de chiffres, avis ou témoignages clients.",
].join("\n");

export const SHORT_RULES = `Réponds en français, phrases courtes (TDAH / dyslexie).
Maximum 8 lignes. 1 prochaine action. 3 puces max. Pas de roman.
Tu cowork : tu FAIS le travail avec les outils. Mail → send_mail. Tâche → create_task. Note → add_note. Action → set_next. Landing → attach_landing. Journal → add_log. Post → save_marketing (champ post). Visuel → produce_asset après le post.
Ne dis jamais « envoie-le toi-même » ou « je n’ai pas d’outil » si l’outil existe.
Si ça déborde : « demande-moi le détail ».
Si un outil n’a pas renvoyé le fait, ne l’invente pas.
Règle Mon Bureau : un seul Focus jusqu’à la première vente. create_project crée toujours en pause.`;

export function wantsDesignKnowledge(question: string, role: AgentRole) {
  if (role === "design") return true;
  return /design|landing|hero|frame|th[eè]me|composant|kit|couleur|daisy|tailwind|navbar|bouton|prototype|critique/i.test(
    question,
  );
}

function cardLine(
  p: {
    name: string;
    slug?: string | null;
    status: string;
    stage: number;
    next: string;
    next_due_date?: string | null;
    next_priority?: string | null;
    next_estimated_minutes?: number | null;
    blocked?: boolean | null;
    blocker_reason?: string | null;
    site: string;
    github: string;
    figma: string;
    notion: string;
    pitch: string;
    description: string;
    stack: string[] | null;
    risks: string[] | null;
    theme?: string | null;
  },
  label: string,
) {
  const nextMeta = [
    p.next_due_date ? `deadline ${p.next_due_date}` : null,
    p.next_estimated_minutes ? `~${p.next_estimated_minutes} min` : null,
    p.next_priority ? `priorité ${p.next_priority}` : null,
  ]
    .filter(Boolean)
    .join(" · ");
  const block = p.blocked
    ? `Blocage: ${p.blocker_reason?.trim() || "oui"}`
    : "Aucun blocage.";

  return [
    `${label}: ${p.name} (${p.slug ?? "—"}) · ${p.status} · étape ${p.stage}/6 ${STAGES[(p.stage || 1) - 1] ?? ""}`,
    p.theme ? `Thème kit: ${p.theme}` : "",
    p.next ? `Prochaine action: ${p.next}${nextMeta ? ` (${nextMeta})` : ""}` : "Pas de prochaine action notée.",
    block,
    p.pitch || p.description || "",
    `Liens: site=${p.site || "—"} github=${p.github || "—"} figma=${p.figma || "—"} notion=${p.notion || "—"}`,
    `Stack: ${(p.stack ?? []).join(", ") || "—"}`,
    (p.risks ?? []).length ? `Risques: ${p.risks!.join(" · ")}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

export async function slimContext(
  db: Db,
  firstName: string,
  opts: {
    projectId?: string | null;
    role: AgentRole;
    includeDesign: boolean;
    question?: string;
  },
) {
  const who = firstName || "l'utilisateur";
  const intro = `Tu es le copilote de Navpit, cockpit de ${who}, développeur solo (SaaS).`;

  const [focus, names, tools] = await Promise.all([
    data.getFocusCard(db.user.id),
    data.listProjects(db.user.id),
    db.supabase
      .from("tool_connections")
      .select("tool_id, account_label")
      .eq("user_id", db.user.id)
      .then(async (res) => {
        if (!res.error) return res;
        return db.supabase
          .from("tool_connections")
          .select("tool_id")
          .eq("user_id", db.user.id);
      }),
  ]);

  const parts = [
    intro,
    SHORT_RULES,
    ROLE_PROMPTS[opts.role],
    names.length
      ? `Projets (utilise get_project pour le détail) : ${names
          .map((p) => `${p.name} [${p.id}${p.slug ? ` /${p.slug}` : ""} · ${p.status}]`)
          .join(" · ")}`
      : "Aucun projet.",
    focus ? cardLine(focus, "FOCUS") : "Aucun projet en Focus.",
    !tools.error && (tools.data?.length ?? 0)
      ? `Outils connectés officiellement : ${tools.data!
          .map((t) => {
            const label = "account_label" in t && t.account_label ? ` (${t.account_label})` : "";
            return `${t.tool_id}${label}`;
          })
          .join(", ")}`
      : "",
  ];

  const open =
    opts.projectId && opts.projectId !== focus?.id
      ? await data.getProjectCard(db.user.id, opts.projectId)
      : null;
  if (open) parts.push(cardLine(open, "PROJET OUVERT"));

  if (opts.includeDesign) {
    const brand = open?.name ?? focus?.name;
    const themeId = open?.theme || focus?.theme || "papier";
    const skill = pickOdSkill(opts.question ?? "") ?? (opts.role === "design" ? OD_SKILLS[0] : null);
    parts.push(STATIC_KNOWLEDGE);
    parts.push(`DESIGN.md (contrat marque, tokens du thème ${themeId}):\n${designMdForTheme(themeId, brand)}`);
    if (skill) {
      parts.push(`SKILL ${skill.id} (${skill.label}) → reste sur ${skill.stay}\n${skill.brief}`);
    }
  }

  return parts.filter(Boolean).join("\n\n");
}
