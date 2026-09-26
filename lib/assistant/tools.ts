import "server-only";
import type Anthropic from "@anthropic-ai/sdk";
import { revalidatePath } from "next/cache";
import { COMPONENTS } from "@/lib/design-data/components";
import { sendPlainEmail } from "@/lib/email/send";
import { defaultValues, landingBrief } from "@/lib/heroes/apply";
import { HEROES, getHero } from "@/lib/heroes/catalog";
import { launchFromBusiness, liveTips, remainingChecks } from "@/lib/projects/launch-checks";
import { marketingFromBusiness, mergeMarketing, type MarketChannel } from "@/lib/projects/marketing";
import { writeMarketingPost } from "@/lib/projects/write-post";
import { isStudioTarget, studioHref } from "@/lib/projects/studio";
import { seoFromBusiness } from "@/lib/projects/seo";
import { data } from "@/lib/mcp/data";
import { generateMermaidForProject } from "@/lib/schemas/generate";
import { isSchemaKind, SCHEMA_AGENTS } from "@/lib/schemas/agents";
import type { CopilotAction } from "./actions-markup";

export type { CopilotAction };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const idProp = { type: "string" as const, description: "UUID du projet ou de la tâche" };

export const COPILOT_TOOLS: Anthropic.Tool[] = [
  {
    name: "get_focus",
    description:
      "Projet en Focus + tâches ouvertes. À appeler en premier pour savoir sur quoi on travaille.",
    input_schema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "list_projects",
    description: "Tous les projets (Focus, pause, fini). Pour savoir sur quoi agir.",
    input_schema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "list_workspace",
    description:
      "Tout le projet : fiche, tâches, notes, landings, schémas, outils connectés. À appeler avant d’agir.",
    input_schema: {
      type: "object",
      properties: { projectId: idProp },
      required: ["projectId"],
      additionalProperties: false,
    },
  },
  {
    name: "search_notes",
    description: "Cherche dans les notes de tous les projets.",
    input_schema: {
      type: "object",
      properties: {
        query: { type: "string" },
        limit: { type: "number" },
      },
      required: ["query"],
      additionalProperties: false,
    },
  },
  {
    name: "get_project",
    description: "Détail d’un projet (stack, liens, prochaine action) et ses tâches.",
    input_schema: {
      type: "object",
      properties: { projectId: idProp },
      required: ["projectId"],
      additionalProperties: false,
    },
  },
  {
    name: "list_tasks",
    description: "Tâches d’un projet, filtrables par statut.",
    input_schema: {
      type: "object",
      properties: {
        projectId: idProp,
        status: { type: "string", enum: ["todo", "doing", "done"] },
      },
      required: ["projectId"],
      additionalProperties: false,
    },
  },
  {
    name: "create_project",
    description:
      "Crée un projet en pause (jamais Focus tout seul). L’utilisateur choisit le Focus dans Navpit.",
    input_schema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Nom du projet, 1 à 80 caractères" },
        description: { type: "string" },
      },
      required: ["name"],
      additionalProperties: false,
    },
  },
  {
    name: "create_task",
    description: "Ajoute une tâche cochable à un projet.",
    input_schema: {
      type: "object",
      properties: {
        projectId: idProp,
        title: { type: "string" },
        dueDate: { type: "string", description: "YYYY-MM-DD" },
        notes: { type: "string" },
      },
      required: ["projectId", "title"],
      additionalProperties: false,
    },
  },
  {
    name: "update_task",
    description: "Change titre, statut, date ou notes d’une tâche.",
    input_schema: {
      type: "object",
      properties: {
        taskId: idProp,
        title: { type: "string" },
        status: { type: "string", enum: ["todo", "doing", "done"] },
        dueDate: { type: "string" },
        notes: { type: "string" },
      },
      required: ["taskId"],
      additionalProperties: false,
    },
  },
  {
    name: "add_note",
    description: "Colle un compte-rendu ou une note sur le projet.",
    input_schema: {
      type: "object",
      properties: {
        projectId: idProp,
        title: { type: "string" },
        content: { type: "string" },
        source: { type: "string" },
      },
      required: ["projectId", "title", "content"],
      additionalProperties: false,
    },
  },
  {
    name: "create_schema",
    description:
      "Génère un schéma (architecture, parcours, tunnel, roadmap, données) et l’attache au projet.",
    input_schema: {
      type: "object",
      properties: {
        projectId: idProp,
        kind: {
          type: "string",
          enum: SCHEMA_AGENTS.map((a) => a.kind),
        },
        extra: { type: "string", description: "Précision optionnelle" },
      },
      required: ["projectId", "kind"],
      additionalProperties: false,
    },
  },
  {
    name: "attach_component",
    description: `Colle un bloc du kit landing sur le projet. Noms : ${COMPONENTS.map((c) => c.n).join(", ")}.`,
    input_schema: {
      type: "object",
      properties: {
        projectId: idProp,
        name: { type: "string", description: "Nom exact du composant kit" },
        themeId: { type: "string" },
      },
      required: ["projectId", "name"],
      additionalProperties: false,
    },
  },
  {
    name: "attach_landing",
    description: `Colle une landing de /bibliotheque/heros sur le projet pour que Cursor / Claude la construisent. Slugs : ${HEROES.map((h) => h.slug).join(", ")}.`,
    input_schema: {
      type: "object",
      properties: {
        projectId: idProp,
        slug: { type: "string", description: "Slug du hero (ex. anneau-de-verre)" },
      },
      required: ["projectId", "slug"],
      additionalProperties: false,
    },
  },
  {
    name: "set_next",
    description: "Écrit la prochaine action du projet (champ next). Fais-le, ne le propose pas.",
    input_schema: {
      type: "object",
      properties: {
        projectId: idProp,
        next: { type: "string" },
      },
      required: ["projectId", "next"],
      additionalProperties: false,
    },
  },
  {
    name: "add_log",
    description: "Ajoute une ligne au journal du projet (ce qui a été fait).",
    input_schema: {
      type: "object",
      properties: {
        projectId: idProp,
        text: { type: "string" },
      },
      required: ["projectId", "text"],
      additionalProperties: false,
    },
  },
  {
    name: "patch_project",
    description: "Met à jour site, GitHub, Figma ou Notion du projet.",
    input_schema: {
      type: "object",
      properties: {
        projectId: idProp,
        site: { type: "string" },
        github: { type: "string" },
        figma: { type: "string" },
        notion: { type: "string" },
      },
      required: ["projectId"],
      additionalProperties: false,
    },
  },
  {
    name: "save_marketing",
    description: "Enregistre offre / canal / hook / CTA marketing sur le projet.",
    input_schema: {
      type: "object",
      properties: {
        projectId: idProp,
        offer: { type: "string" },
        channel: { type: "string", enum: ["linkedin", "tiktok", "instagram", "email"] },
        hook: { type: "string" },
        cta: { type: "string" },
        post: { type: "string", description: "Post rédigé, prêt à coller" },
      },
      required: ["projectId"],
      additionalProperties: false,
    },
  },
  {
    name: "produce_asset",
    description:
      "Crée le livrable. Canva/Figma : si le post n’existe pas, le rédige et l’enregistre d’abord. Schéma Navpit. Exécute, ne décris pas.",
    input_schema: {
      type: "object",
      properties: {
        projectId: idProp,
        target: { type: "string", enum: ["canva", "schema", "figma"] },
        kind: {
          type: "string",
          enum: SCHEMA_AGENTS.map((a) => a.kind),
          description: "Kind du schéma si target=schema",
        },
        title: { type: "string" },
        brief: { type: "string" },
      },
      required: ["projectId", "target"],
      additionalProperties: false,
    },
  },
  {
    name: "send_mail",
    description:
      "Envoie le mail maintenant via Resend (depuis Navpit). Colle aussi le brouillon sur le projet. Ne dis pas à l’user de l’envoyer lui-même.",
    input_schema: {
      type: "object",
      properties: {
        projectId: idProp,
        to: { type: "string", description: "Email destinataire" },
        subject: { type: "string" },
        body: { type: "string", description: "Corps prêt à envoyer" },
      },
      required: ["projectId", "to", "subject", "body"],
      additionalProperties: false,
    },
  },
  {
    name: "get_launch_checks",
    description:
      "Checks lancement (cochés + trous HTTPS/GA/Stripe/Vercel). N’invente rien au-delà de cette liste.",
    input_schema: {
      type: "object",
      properties: { projectId: idProp },
      required: ["projectId"],
      additionalProperties: false,
    },
  },
];

function asRecord(input: unknown): Record<string, unknown> {
  return input && typeof input === "object" ? (input as Record<string, unknown>) : {};
}

function str(v: unknown) {
  return typeof v === "string" ? v : "";
}

function projectHref(slug?: string | null, id?: string) {
  return slug ? `/projets/${slug}` : id ? `/projets` : "/projets";
}

function touchProject(slug?: string | null) {
  revalidatePath("/projets");
  if (slug) revalidatePath(`/projets/${slug}`);
}

export async function runCopilotTool(
  userId: string,
  name: string,
  raw: unknown,
  opts?: { model?: string; signal?: AbortSignal },
): Promise<{ text: string; action?: CopilotAction; reveal?: string }> {
  const input = asRecord(raw);
  try {
    switch (name) {
      case "list_projects":
        return { text: JSON.stringify(await data.listProjects(userId)) };
      case "list_workspace": {
        const projectId = str(input.projectId);
        if (!UUID.test(projectId)) return { text: "projectId invalide." };
        const ws = await data.listWorkspace(userId, projectId);
        return { text: ws ? JSON.stringify(ws) : "Projet introuvable." };
      }
      case "search_notes": {
        const q = str(input.query);
        const limit = typeof input.limit === "number" ? input.limit : 10;
        return { text: JSON.stringify(await data.searchNotes(userId, q, limit)) };
      }
      case "get_focus": {
        const project = await data.getFocusProject(userId);
        if (!project) return { text: "Aucun projet en Focus." };
        const tasks = await data.listTasks(userId, project.id);
        return {
          text: JSON.stringify({
            project,
            openTasks: tasks.filter((t) => t.status !== "done"),
          }),
        };
      }
      case "get_project": {
        const projectId = str(input.projectId);
        if (!UUID.test(projectId)) return { text: "projectId invalide." };
        const card = await data.getProjectCard(userId, projectId);
        if (!card) return { text: `Projet ${projectId} introuvable.` };
        const tasks = await data.listTasks(userId, projectId);
        return { text: JSON.stringify({ project: card, tasks }) };
      }
      case "list_tasks": {
        const projectId = str(input.projectId);
        if (!UUID.test(projectId)) return { text: "projectId invalide." };
        const status = input.status;
        const filter =
          status === "todo" || status === "doing" || status === "done" ? status : undefined;
        return { text: JSON.stringify(await data.listTasks(userId, projectId, filter)) };
      }
      case "create_project": {
        const project = await data.createProject(userId, {
          name: str(input.name),
          description: str(input.description) || undefined,
        });
        return {
          text: JSON.stringify(project),
          action: {
            kind: "project",
            label: `Projet « ${project.name} » créé (pause)`,
            href: projectHref(project.slug, project.id),
          },
        };
      }
      case "create_task": {
        const projectId = str(input.projectId);
        if (!UUID.test(projectId)) return { text: "projectId invalide." };
        const project = await data.getProject(userId, projectId);
        if (!project) return { text: "Projet introuvable." };
        const task = await data.createTask(userId, {
          projectId,
          title: str(input.title),
          dueDate: str(input.dueDate) || undefined,
          notes: str(input.notes) || undefined,
        });
        return {
          text: JSON.stringify(task),
          action: {
            kind: "task",
            label: "Tâche ajoutée",
            href: projectHref(project.slug, projectId),
          },
        };
      }
      case "update_task": {
        const taskId = str(input.taskId);
        if (!UUID.test(taskId)) return { text: "taskId invalide." };
        const task = await data.updateTask(userId, taskId, {
          title: str(input.title) || undefined,
          status:
            input.status === "todo" || input.status === "doing" || input.status === "done"
              ? input.status
              : undefined,
          dueDate: str(input.dueDate) || undefined,
          notes: str(input.notes) || undefined,
        });
        return { text: task ? JSON.stringify(task) : `Tâche ${taskId} introuvable.` };
      }
      case "add_note": {
        const projectId = str(input.projectId);
        if (!UUID.test(projectId)) return { text: "projectId invalide." };
        const project = await data.getProject(userId, projectId);
        if (!project) return { text: "Projet introuvable." };
        const note = await data.addNote(userId, {
          projectId,
          title: str(input.title),
          content: str(input.content),
          source: str(input.source) || "copilote",
        });
        return {
          text: JSON.stringify({ id: note.id, title: note.title }),
          action: {
            kind: "note",
            label: "Note collée au projet",
            href: projectHref(project.slug, projectId),
          },
        };
      }
      case "create_schema": {
        const projectId = str(input.projectId);
        if (!UUID.test(projectId)) return { text: "projectId invalide." };
        const kind = input.kind;
        if (!isSchemaKind(kind) || kind === "libre") return { text: "Kind de schéma invalide." };
        const project = await data.getProject(userId, projectId);
        if (!project) return { text: "Projet introuvable." };
        const generated = await generateMermaidForProject({
          userId,
          projectId,
          kind,
          extra: str(input.extra) || undefined,
          model: opts?.model,
          signal: opts?.signal,
        });
        const row = await data.createSchemaRow(userId, {
          projectId,
          title: generated.title,
          kind,
          mermaid: generated.mermaid,
        });
        await data.addNote(userId, {
          projectId,
          title: generated.title,
          content: `\`\`\`mermaid\n${generated.mermaid}\n\`\`\``,
          source: "schema",
        });
        return {
          text: JSON.stringify({ id: row.id, title: row.title, href: `/schemas/${row.id}` }),
          action: {
            kind: "schema",
            label: "Schéma dans le projet",
            href: `/schemas/${row.id}`,
          },
        };
      }
      case "attach_component": {
        const projectId = str(input.projectId);
        if (!UUID.test(projectId)) return { text: "projectId invalide." };
        const project = await data.getProject(userId, projectId);
        if (!project) return { text: "Projet introuvable." };
        const needle = str(input.name).trim().toLowerCase();
        const comp = COMPONENTS.find((c) => c.n.toLowerCase() === needle);
        if (!comp) {
          return {
            text: `Composant inconnu. Noms : ${COMPONENTS.map((c) => c.n).join(", ")}.`,
          };
        }
        const row = await data.attachComponent(userId, {
          projectId,
          title: comp.n,
          html: comp.h,
          themeId: str(input.themeId) || undefined,
        });
        return {
          text: JSON.stringify(row),
          action: {
            kind: "component",
            label: `« ${comp.n} » collé`,
            href: projectHref(project.slug, projectId),
          },
        };
      }
      case "attach_landing": {
        const projectId = str(input.projectId);
        if (!UUID.test(projectId)) return { text: "projectId invalide." };
        const project = await data.getProject(userId, projectId);
        if (!project) return { text: "Projet introuvable." };
        const hero = getHero(str(input.slug).trim());
        if (!hero) {
          return { text: `Landing inconnue. Slugs : ${HEROES.map((h) => h.slug).join(", ")}.` };
        }
        const values = defaultValues(hero);
        const row = await data.attachComponent(userId, {
          projectId,
          title: `${values.MARQUE} · ${hero.nom}`,
          html: landingBrief(hero, values),
          themeId: hero.slug,
          kind: "landing",
        });
        return {
          text: JSON.stringify(row),
          action: {
            kind: "landing",
            label: `Landing « ${values.MARQUE} » collée`,
            href: projectHref(project.slug, projectId),
          },
        };
      }
      case "set_next": {
        const projectId = str(input.projectId);
        if (!UUID.test(projectId)) return { text: "projectId invalide." };
        const project = await data.getProject(userId, projectId);
        if (!project) return { text: "Projet introuvable." };
        const next = str(input.next).trim().slice(0, 300);
        if (!next) return { text: "next vide." };
        await data.setProjectNext(userId, projectId, next);
        await data.createTask(userId, { projectId, title: next });
        return {
          text: JSON.stringify({ next }),
          action: { kind: "task", label: "Prochaine action écrite", href: projectHref(project.slug, projectId) },
        };
      }
      case "add_log": {
        const projectId = str(input.projectId);
        if (!UUID.test(projectId)) return { text: "projectId invalide." };
        const project = await data.getProject(userId, projectId);
        if (!project) return { text: "Projet introuvable." };
        const row = await data.addLog(userId, projectId, str(input.text));
        return {
          text: JSON.stringify(row),
          action: { kind: "note", label: "Journal mis à jour", href: projectHref(project.slug, projectId) },
        };
      }
      case "patch_project": {
        const projectId = str(input.projectId);
        if (!UUID.test(projectId)) return { text: "projectId invalide." };
        const project = await data.getProject(userId, projectId);
        if (!project) return { text: "Projet introuvable." };
        await data.patchProject(userId, projectId, {
          site: str(input.site) || undefined,
          github: str(input.github) || undefined,
          figma: str(input.figma) || undefined,
          notion: str(input.notion) || undefined,
        });
        return {
          text: "Projet mis à jour.",
          action: { kind: "project", label: "Fiche à jour", href: projectHref(project.slug, projectId) },
        };
      }
      case "save_marketing": {
        const projectId = str(input.projectId);
        if (!UUID.test(projectId)) return { text: "projectId invalide." };
        const card = await data.getProjectCard(userId, projectId);
        if (!card) return { text: "Projet introuvable." };
        const channel = str(input.channel) as MarketChannel;
        const current =
          card.business && typeof card.business === "object"
            ? (card.business as Record<string, string>)
            : {};
        const prev = marketingFromBusiness(current);
        const business = mergeMarketing(current, {
          offer: str(input.offer) || prev.offer,
          channel: ["linkedin", "tiktok", "instagram", "email"].includes(channel)
            ? channel
            : prev.channel,
          hook: str(input.hook) || prev.hook,
          cta: str(input.cta) || prev.cta,
          post: str(input.post) || prev.post,
        });
        await data.updateBusiness(userId, projectId, business);
        const savedPost = str(input.post) || prev.post;
        if (str(input.post)) {
          await data.addNote(userId, {
            projectId,
            title: `Post · ${marketingFromBusiness(business).channel}`,
            content: str(input.post),
            source: "marketing",
          });
        }
        touchProject(card.slug);
        return {
          text: savedPost
            ? `Post enregistré. Propose ensuite produce_asset (canva / schema / figma).`
            : "Marketing enregistré. Il manque le post : rédige-le et rappelle save_marketing avec le champ post.",
          action: {
            kind: "note",
            label: "Voir le post",
            href: projectHref(card.slug, projectId),
          },
          reveal: savedPost ? `Post enregistré :\n${savedPost}` : undefined,
        };
      }
      case "produce_asset": {
        const projectId = str(input.projectId);
        if (!UUID.test(projectId)) return { text: "projectId invalide." };
        const target = str(input.target);
        if (!isStudioTarget(target)) return { text: "Cible invalide (canva, schema, figma)." };
        const project = await data.getProjectCard(userId, projectId);
        if (!project) return { text: "Projet introuvable." };
        const title = (str(input.title) || project.name).slice(0, 80);
        const business =
          project.business && typeof project.business === "object"
            ? (project.business as Record<string, string>)
            : {};
        let marketing = marketingFromBusiness(business);
        let wrotePost = false;
        if (target !== "schema" && !marketing.post.trim()) {
          let post = "";
          try {
            post = await writeMarketingPost({
              name: project.name,
              pitch: project.pitch,
              target: project.target,
              problem: project.problem,
              offer: marketing.offer,
              hook: marketing.hook,
              cta: marketing.cta,
              channel: marketing.channel,
              model: opts?.model,
              signal: opts?.signal,
            });
          } catch {
            post = [marketing.hook, marketing.offer, marketing.cta, project.pitch, project.name]
              .filter(Boolean)
              .join("\n\n")
              .slice(0, 2000);
          }
          if (post.trim()) {
            marketing = { ...marketing, post };
            await data.updateBusiness(userId, projectId, mergeMarketing(business, marketing));
            await data.addNote(userId, {
              projectId,
              title: `Post · ${marketing.channel}`,
              content: post,
              source: "marketing",
            });
            wrotePost = true;
          }
        }
        const brief =
          str(input.brief).trim() ||
          [marketing.post, marketing.offer, marketing.hook, marketing.cta].filter(Boolean).join("\n\n") ||
          project.pitch ||
          project.description ||
          title;

        if (target === "schema") {
          const kind = isSchemaKind(input.kind) && input.kind !== "libre" ? input.kind : "parcours";
          const generated = await generateMermaidForProject({
            userId,
            projectId,
            kind,
            extra: brief,
            model: opts?.model,
            signal: opts?.signal,
          });
          const row = await data.createSchemaRow(userId, {
            projectId,
            title: generated.title,
            kind,
            mermaid: generated.mermaid,
          });
          await data.addNote(userId, {
            projectId,
            title: generated.title,
            content: `\`\`\`mermaid\n${generated.mermaid}\n\`\`\``,
            source: "schema",
          });
          return {
            text: JSON.stringify({ id: row.id, title: row.title, href: `/schemas/${row.id}` }),
            action: { kind: "schema", label: "Schéma créé", href: `/schemas/${row.id}` },
          };
        }

        const href = studioHref(target, project.figma);
        await data.addNote(userId, {
          projectId,
          title: target === "canva" ? `Brief Canva · ${title}` : `Brief Figma · ${title}`,
          content: brief.slice(0, 4000),
          source: target,
        });
        touchProject(project.slug);
        return {
          text: marketing.post
            ? `Post ${wrotePost ? "rédigé et " : ""}enregistré. ${target === "canva" ? "Brief Canva" : "Brief Figma"} prêt. ${href}`
            : `${target === "canva" ? "Brief Canva" : "Brief Figma"} prêt. ${href}`,
          action: {
            kind: "studio",
            label: target === "canva" ? "Ouvrir Canva" : "Ouvrir Figma",
            href,
          },
          reveal: marketing.post ? `Post enregistré :\n${marketing.post}` : undefined,
        };
      }
      case "send_mail": {
        const projectId = str(input.projectId);
        if (!UUID.test(projectId)) return { text: "projectId invalide." };
        const project = await data.getProject(userId, projectId);
        if (!project) return { text: "Projet introuvable." };
        const to = str(input.to).trim();
        const subject = str(input.subject).trim().slice(0, 180);
        const body = str(input.body).trim().slice(0, 8000);
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) return { text: "Destinataire invalide." };
        if (!subject || !body) return { text: "Objet et corps requis." };
        const conns = await data.listConnections(userId);
        const gmail = conns.find((c) => c.tool_id === "gmail");
        const replyTo =
          gmail && "account_label" in gmail && typeof gmail.account_label === "string"
            ? gmail.account_label
            : undefined;
        const sent = await sendPlainEmail({ to, subject, text: body, replyTo });
        await data.addNote(userId, {
          projectId,
          title: sent.ok ? `Mail envoyé · ${to}` : `Brouillon mail · ${to}`,
          content: `À : ${to}\nObjet : ${subject}\n\n${body}${
            sent.ok ? "" : `\n\n(${sent.skipped ? "Resend non configuré" : sent.error})`
          }`,
          source: "mail",
        });
        await data.addLog(
          userId,
          projectId,
          sent.ok ? `Mail envoyé à ${to} : ${subject}` : `Brouillon mail pour ${to} : ${subject}`,
        );
        if (!sent.ok && !sent.skipped) {
          await data.createTask(userId, {
            projectId,
            title: `Renvoyer le mail à ${to}`,
            notes: subject,
          });
        }
        return {
          text: JSON.stringify(sent),
          action: {
            kind: "email",
            label: sent.ok ? `Mail parti vers ${to}` : `Brouillon collé · ${to}`,
            href: projectHref(project.slug, projectId),
          },
        };
      }
      case "get_launch_checks": {
        const projectId = str(input.projectId);
        if (!UUID.test(projectId)) return { text: "projectId invalide." };
        const card = await data.getProjectCard(userId, projectId);
        if (!card) return { text: "Projet introuvable." };
        const business =
          card.business && typeof card.business === "object"
            ? (card.business as Record<string, string>)
            : {};
        const launch = launchFromBusiness(business);
        const seo = seoFromBusiness(business);
        const connections = await data.listConnections(userId);
        const stripe = connections.some((c) => c.tool_id === "stripe");
        const open = remainingChecks(launch.done).map((c) => c.n);
        const tips = liveTips({
          name: card.name,
          site: card.site ?? "",
          gaId: seo.gaId,
          gsc: seo.gsc,
          stripe,
        }).map((t) => t.hint);
        const stack = (card.stack ?? []).map((s) => s.toLowerCase());
        const known = [
          card.site ? `Site renseigné : ${card.site}` : "Pas d’URL de site.",
          card.github ? `GitHub : ${card.github}` : "Pas de repo GitHub.",
          card.figma ? `Figma : ${card.figma}` : "Pas de fichier Figma.",
          card.notion ? `Notion : ${card.notion}` : "Pas de page Notion.",
          `Stack déclarée : ${(card.stack ?? []).join(", ") || "vide"}`,
          `Checks cochés : ${launch.done.length}/${open.length + launch.done.length}`,
        ];
        const unknown = [
          ...tips,
          open.length ? `Encore à cocher : ${open.join(", ")}` : "Les checks lancement sont cochés.",
          "Aucun check DNS (SPF/DKIM Resend, Vercel) n’est enregistré dans Navpit.",
        ];
        if (stack.some((s) => s.includes("resend"))) {
          unknown.push("Resend est dans la stack → demander si SPF/DKIM est fait, sans l’affirmer.");
        }
        return { text: JSON.stringify({ known, unknown, next: card.next, open }) };
      }
      default:
        return { text: `Outil inconnu : ${name}` };
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur outil.";
    return { text: message };
  }
}
