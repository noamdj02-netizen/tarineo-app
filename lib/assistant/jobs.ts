import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { SHORT_RULES } from "@/lib/assistant/context";
import { data } from "@/lib/mcp/data";
import { DEFAULT_MODEL, isModelId } from "@/lib/models";
import { generateMermaidForProject } from "@/lib/schemas/generate";

function todayLabel() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`;
}

function pickModel() {
  const env = process.env.ANTHROPIC_MODEL;
  return isModelId(env) ? env : DEFAULT_MODEL;
}

export type JobResult =
  | { ok: true; title: string; summary: string; href: string }
  | { ok: false; error: string };

export async function runDebriefFocus(userId: string): Promise<JobResult> {
  const focus = await data.getFocusCard(userId);
  if (!focus) return { ok: false, error: "Aucun projet en Focus." };

  const [tasks, notes] = await Promise.all([
    data.listTasks(userId, focus.id),
    data.listRecentNotes(userId, focus.id, 24),
  ]);

  const fallbackActions = [
    focus.next || "Écrire la prochaine action du Focus",
    "Relire les tâches ouvertes et en cocher une",
    "Noter ce qui bloque en une phrase",
  ];

  let note = "";
  let actions = fallbackActions;

  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const res = await new Anthropic().messages.create({
        model: pickModel(),
        max_tokens: 700,
        system: `${SHORT_RULES}\nRéponds UNIQUEMENT en JSON : {"note":"3-6 lignes","actions":["…","…","…"]}`,
        messages: [
          {
            role: "user",
            content: `Débrief du Focus ${focus.name}. Tâches: ${JSON.stringify(tasks)}. Notes 24h: ${JSON.stringify(
              notes.map((n) => ({ title: n.title, content: n.content.slice(0, 400) })),
            )}. Prochaine action actuelle: ${focus.next || "—"}.`,
          },
        ],
      });
      const raw = res.content.flatMap((b) => (b.type === "text" ? [b.text] : [])).join("");
      const json = raw.match(/\{[\s\S]*\}/)?.[0];
      if (json) {
        const parsed = JSON.parse(json) as { note?: string; actions?: string[] };
        if (parsed.note) note = parsed.note.trim();
        if (Array.isArray(parsed.actions) && parsed.actions.length) {
          actions = parsed.actions.map((a) => String(a).slice(0, 200)).slice(0, 3);
        }
      }
    } catch {
      // on garde le fallback
    }
  }

  if (!note) {
    const open = tasks.filter((t) => t.status !== "done");
    note = [
      `Focus ${focus.name} · étape ${focus.stage}/6.`,
      focus.next ? `Action en cours : ${focus.next}` : "Pas de prochaine action notée.",
      `${open.length} tâche(s) ouverte(s). ${notes.length} note(s) sur 24 h.`,
    ].join("\n");
  }

  const title = `Débrief ${todayLabel()}`;
  await data.addNote(userId, {
    projectId: focus.id,
    title,
    content: `${note}\n\nActions :\n${actions.map((a, i) => `${i + 1}. ${a}`).join("\n")}`,
    source: "debrief",
  });
  for (const actionTitle of actions) {
    await data.createTask(userId, { projectId: focus.id, title: actionTitle });
  }

  return {
    ok: true,
    title,
    summary: note,
    href: focus.slug ? `/projets/${focus.slug}` : "/projets",
  };
}

export async function runNextActionJob(userId: string): Promise<JobResult> {
  const focus = await data.getFocusCard(userId);
  if (!focus) return { ok: false, error: "Aucun projet en Focus." };
  const tasks = await data.listTasks(userId, focus.id);
  const open = tasks.filter((t) => t.status !== "done");

  let next = focus.next || open[0]?.title || "Passer 25 minutes sur le Focus, une seule tâche.";
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const res = await new Anthropic().messages.create({
        model: pickModel(),
        max_tokens: 200,
        system: `${SHORT_RULES}\nUne seule phrase d’action, rien d’autre.`,
        messages: [
          {
            role: "user",
            content: `Prochaine action 24 h pour ${focus.name}. Actuelle: ${focus.next || "—"}. Ouvertes: ${open
              .map((t) => t.title)
              .join(" · ")}.`,
          },
        ],
      });
      const line = res.content
        .flatMap((b) => (b.type === "text" ? [b.text] : []))
        .join("")
        .trim()
        .split("\n")[0];
      if (line) next = line.slice(0, 300);
    } catch {
      // fallback
    }
  }

  await data.setProjectNext(userId, focus.id, next);
  await data.createTask(userId, { projectId: focus.id, title: next });

  return {
    ok: true,
    title: "Prochaine action",
    summary: next,
    href: focus.slug ? `/projets/${focus.slug}` : "/projets",
  };
}

export async function runSchemaParcoursJob(userId: string): Promise<JobResult> {
  const focus = await data.getFocusCard(userId);
  if (!focus) return { ok: false, error: "Aucun projet en Focus." };
  if (!process.env.ANTHROPIC_API_KEY) {
    return { ok: false, error: "Ajoute ANTHROPIC_API_KEY pour générer un schéma." };
  }
  const generated = await generateMermaidForProject({
    userId,
    projectId: focus.id,
    kind: "parcours",
  });
  const row = await data.createSchemaRow(userId, {
    projectId: focus.id,
    title: generated.title,
    kind: "parcours",
    mermaid: generated.mermaid,
  });
  await data.addNote(userId, {
    projectId: focus.id,
    title: generated.title,
    content: `\`\`\`mermaid\n${generated.mermaid}\n\`\`\``,
    source: "schema",
  });
  return {
    ok: true,
    title: generated.title,
    summary: "Schéma du parcours collé au Focus.",
    href: `/schemas/${row.id}`,
  };
}
