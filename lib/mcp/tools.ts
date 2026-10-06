import type { AuthInfo, McpServer } from "@modelcontextprotocol/server";
import { z } from "zod";
import { defaultValues, landingBrief } from "@/lib/heroes/apply";
import { HEROES, getHero } from "@/lib/heroes/catalog";
import { data } from "./data";
import { getUserId, McpAuthError, requireScope } from "./auth";
import type { Scope } from "./types";

type ToolResult = {
  content: { type: "text"; text: string }[];
  isError?: boolean;
};

const ok = (payload: unknown): ToolResult => ({
  content: [
    { type: "text", text: typeof payload === "string" ? payload : JSON.stringify(payload, null, 2) },
  ],
});

const fail = (message: string): ToolResult => ({
  content: [{ type: "text", text: message }],
  isError: true,
});

// Enveloppe commune : auth + scope + erreurs lisibles pour l'agent.
function guarded<A>(
  scope: Scope,
  fn: (args: A, userId: string) => Promise<ToolResult>
) {
  return async (args: A, ctx: { http?: { authInfo?: AuthInfo } }): Promise<ToolResult> => {
    try {
      const authInfo = ctx.http?.authInfo;
      requireScope(authInfo, scope);
      const userId = getUserId(authInfo);
      const { canUseFeature, featureDeniedMessage } = await import("@/lib/billing/entitlements");
      const { planForUserId } = await import("@/lib/billing/plan");
      const plan = await planForUserId(userId);
      if (!canUseFeature(plan, "api_access")) {
        return fail(featureDeniedMessage("api_access"));
      }
      return await fn(args, userId);
    } catch (err) {
      if (err instanceof McpAuthError) return fail(err.message);
      console.error("[navpit-mcp]", err);
      return fail("Erreur interne TARINEO. Réessaie dans un instant.");
    }
  };
}

const id = z.string().min(1).max(100);

export function registerNavpitTools(server: McpServer): void {
  // ── LECTURE ─────────────────────────────────────────────

  server.registerTool(
    "get_focus",
    {
      title: "Projet en Focus",
      description:
        "Renvoie le projet actuellement en Focus dans TARINEO (un seul à la fois, jusqu'à la 1ère vente), avec ses tâches ouvertes. À appeler en premier pour savoir sur quoi l'utilisateur travaille.",
      inputSchema: z.object({}),
    },
    guarded<Record<string, never>>("read", async (_args, userId) => {
      const project = await data.getFocusProject(userId);
      if (!project) return ok("Aucun projet en Focus pour l'instant.");
      const tasks = await data.listTasks(userId, project.id);
      return ok({ project, openTasks: tasks.filter((t) => t.status !== "done") });
    })
  );

  server.registerTool(
    "list_projects",
    {
      title: "Lister les projets",
      description: "Liste tous les projets TARINEO de l'utilisateur (Focus, en attente, terminés).",
      inputSchema: z.object({}),
    },
    guarded<Record<string, never>>("read", async (_args, userId) =>
      ok(await data.listProjects(userId))
    )
  );

  server.registerTool(
    "get_project",
    {
      title: "Détail d'un projet",
      description: "Renvoie un projet et toutes ses tâches.",
      inputSchema: z.object({ projectId: id }),
    },
    guarded<{ projectId: string }>("read", async ({ projectId }, userId) => {
      const project = await data.getProject(userId, projectId);
      if (!project) return fail(`Projet ${projectId} introuvable.`);
      return ok({ project, tasks: await data.listTasks(userId, projectId) });
    })
  );

  server.registerTool(
    "list_tasks",
    {
      title: "Lister les tâches",
      description: "Liste les tâches d'un projet, filtrables par statut.",
      inputSchema: z.object({
        projectId: id,
        status: z.enum(["todo", "doing", "done"]).optional(),
      }),
    },
    guarded<{ projectId: string; status?: "todo" | "doing" | "done" }>(
      "read",
      async ({ projectId, status }, userId) => ok(await data.listTasks(userId, projectId, status))
    )
  );

  server.registerTool(
    "search_notes",
    {
      title: "Chercher dans les notes",
      description: "Recherche plein texte dans les notes TARINEO de l'utilisateur.",
      inputSchema: z.object({
        query: z.string().min(2).max(200),
        limit: z.number().int().min(1).max(25).default(10),
      }),
    },
    guarded<{ query: string; limit: number }>("read", async ({ query, limit }, userId) =>
      ok(await data.searchNotes(userId, query, limit ?? 10))
    )
  );

  // ── ÉCRITURE ────────────────────────────────────────────

  server.registerTool(
    "create_project",
    {
      title: "Créer un projet",
      description:
        "Crée un projet en attente (jamais en Focus : c'est l'utilisateur qui choisit son Focus dans TARINEO).",
      inputSchema: z.object({
        name: z.string().min(1).max(120),
        description: z.string().max(2000).optional(),
      }),
    },
    guarded<{ name: string; description?: string }>("write", async (args, userId) =>
      ok(await data.createProject(userId, args))
    )
  );

  server.registerTool(
    "create_task",
    {
      title: "Créer une tâche",
      description: "Ajoute une tâche à un projet.",
      inputSchema: z.object({
        projectId: id,
        title: z.string().min(1).max(200),
        dueDate: z.string().date().optional().describe("Format YYYY-MM-DD"),
        notes: z.string().max(5000).optional(),
      }),
    },
    guarded<{ projectId: string; title: string; dueDate?: string; notes?: string }>(
      "write",
      async (args, userId) => {
        const project = await data.getProject(userId, args.projectId);
        if (!project) return fail(`Projet ${args.projectId} introuvable.`);
        return ok(await data.createTask(userId, args));
      }
    )
  );

  server.registerTool(
    "update_task",
    {
      title: "Modifier une tâche",
      description: "Change le titre, le statut (todo/doing/done), la date ou les notes d'une tâche.",
      inputSchema: z.object({
        taskId: id,
        title: z.string().min(1).max(200).optional(),
        status: z.enum(["todo", "doing", "done"]).optional(),
        dueDate: z.string().date().nullable().optional(),
        notes: z.string().max(5000).nullable().optional(),
      }),
    },
    guarded<{
      taskId: string;
      title?: string;
      status?: "todo" | "doing" | "done";
      dueDate?: string | null;
      notes?: string | null;
    }>("write", async ({ taskId, ...patch }, userId) => {
      const task = await data.updateTask(userId, taskId, patch);
      return task ? ok(task) : fail(`Tâche ${taskId} introuvable.`);
    })
  );

  server.registerTool(
    "add_note",
    {
      title: "Ajouter une note",
      description:
        "Ajoute une note markdown à un projet. Idéal pour importer une note Obsidian ou un compte rendu d'agent. Mets source='obsidian' si ça vient d'Obsidian.",
      inputSchema: z.object({
        projectId: id,
        title: z.string().min(1).max(200),
        content: z.string().min(1).max(50_000),
        source: z.string().max(50).optional(),
      }),
    },
    guarded<{ projectId: string; title: string; content: string; source?: string }>(
      "write",
      async (args, userId) => {
        const project = await data.getProject(userId, args.projectId);
        if (!project) return fail(`Projet ${args.projectId} introuvable.`);
        return ok(await data.addNote(userId, args));
      }
    )
  );

  server.registerTool(
    "list_landings",
    {
      title: "Landings disponibles",
      description:
        "Liste les 12 landings de /bibliotheque/heros (slug, marque, titre). Pour construire une page en 5 minutes.",
      inputSchema: z.object({}),
    },
    guarded<Record<string, never>>("read", async () =>
      ok(
        HEROES.map((h) => {
          const v = defaultValues(h);
          return {
            slug: h.slug,
            nom: h.nom,
            marque: v.MARQUE,
            titre: v.TITRE,
            acces: h.acces,
          };
        }),
      ),
    ),
  );

  server.registerTool(
    "attach_landing",
    {
      title: "Coller une landing sur un projet",
      description:
        "Attache le brief d'une landing (slug) au projet. Ensuite construis components/hero.tsx à partir du brief retourné.",
      inputSchema: z.object({
        projectId: id,
        slug: z.string().min(1).max(80),
      }),
    },
    guarded<{ projectId: string; slug: string }>("write", async (args, userId) => {
      const project = await data.getProject(userId, args.projectId);
      if (!project) return fail(`Projet ${args.projectId} introuvable.`);
      const hero = getHero(args.slug.trim());
      if (!hero) return fail(`Landing inconnue. Slugs : ${HEROES.map((h) => h.slug).join(", ")}.`);
      const values = defaultValues(hero);
      const brief = landingBrief(hero, values);
      const row = await data.attachComponent(userId, {
        projectId: args.projectId,
        title: `${values.MARQUE} · ${hero.nom}`,
        html: brief,
        themeId: hero.slug,
        kind: "landing",
      });
      return ok({ asset: row, brief });
    }),
  );
}
