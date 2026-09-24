/**
 * Importe data/seed.json + les ressources « curated » dans Supabase.
 *
 *   npm run seed
 *
 * Besoin dans .env.local : NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SEED_USER_EMAIL
 * (et SEED_USER_FIRST_NAME, optionnel).
 * Crée ton compte (sans mot de passe) s'il n'existe pas encore.
 * Relançable sans doublons : projets (par slug) et ressources (par seed_key) sont mis à jour,
 * et les fonctionnalités / tâches / journal de chaque projet sont remplacés.
 */
import { config } from "dotenv";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";
import { CURATED_RESOURCES } from "../lib/design-data/resources";
import type { Database, FeatureStatus, ProjectStatus } from "../lib/supabase/types";

config({ path: resolve(process.cwd(), ".env.local") });

type SeedProject = {
  id: string;
  name: string;
  desc: string;
  status: ProjectStatus;
  stage: number;
  next: string;
  site: string;
  github: string;
  figma: string;
  notion: string;
  theme: string;
  partner: string;
  pitch: string;
  target: string;
  problem: string;
  business: Record<string, string>;
  stack: string[];
  team: string[];
  risks: string[];
  order: number;
  features: { t: string; s: FeatureStatus }[];
  tasks: { t: string; done: boolean }[];
  log: { d: string; t: string }[];
};

type SeedResource = {
  id: string;
  name: string;
  url: string;
  cat: string;
  tags: string[];
  note: string;
  source: "notion" | "moi";
  verified: boolean;
  notionUrl?: string;
  created: number;
};

function env(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Variable manquante dans .env.local : ${name}`);
  return v;
}

/** « 28/08/2026 » → « 2026-08-28 » */
function frDateToIso(d: string) {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(d.trim());
  if (!m) throw new Error(`Date illisible dans le journal : ${d}`);
  return `${m[3]}-${m[2]}-${m[1]}`;
}

function slug(s: string) {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function check<T>(label: string, res: { error: { message: string } | null; data?: T | null }) {
  if (res.error) throw new Error(`${label} : ${res.error.message}`);
  return res.data as T;
}

async function main() {
  const supabase = createClient<Database>(
    env("NEXT_PUBLIC_SUPABASE_URL"),
    env("SUPABASE_SERVICE_ROLE_KEY"),
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
  const email = env("SEED_USER_EMAIL").trim().toLowerCase();

  // 1. Ton compte : on le retrouve, sinon on le crée (confirmé, sans mot de passe).
  let userId: string | undefined;
  for (let page = 1; !userId; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw new Error(`Lecture des comptes : ${error.message}`);
    userId = data.users.find((u) => u.email?.toLowerCase() === email)?.id;
    if (data.users.length < 200) break;
  }
  if (!userId) {
    const { data, error } = await supabase.auth.admin.createUser({ email, email_confirm: true });
    if (error) throw new Error(`Création du compte : ${error.message}`);
    userId = data.user.id;
    console.log(`Compte créé pour ${email}`);
  } else {
    console.log(`Compte trouvé pour ${email}`);
  }

  // Prénom affiché sur l'accueil (« Bon retour, Noam »)
  const firstName = process.env.SEED_USER_FIRST_NAME?.trim();
  if (firstName) {
    const { error } = await supabase.auth.admin.updateUserById(userId, {
      user_metadata: { first_name: firstName },
    });
    if (error) throw new Error(`Prénom : ${error.message}`);
  }

  const seed = JSON.parse(readFileSync(resolve(process.cwd(), "data/seed.json"), "utf8")) as {
    projects: SeedProject[];
    resources: SeedResource[];
  };

  // 2. Projets + lignes enfants.
  for (const p of seed.projects) {
    const project = check<{ id: string }>(
      `Projet ${p.name}`,
      await supabase
        .from("projects")
        .upsert(
          {
            slug: p.id,
            user_id: userId,
            name: p.name,
            description: p.desc ?? "",
            status: p.status,
            stage: p.stage,
            next: p.next ?? "",
            site: p.site ?? "",
            github: p.github ?? "",
            figma: p.figma ?? "",
            notion: p.notion ?? "",
            theme: p.theme ?? "",
            partner: p.partner ?? "",
            pitch: p.pitch ?? "",
            target: p.target ?? "",
            problem: p.problem ?? "",
            business: p.business ?? {},
            stack: p.stack ?? [],
            team: p.team ?? [],
            risks: p.risks ?? [],
            sort_order: p.order ?? 0,
          },
          { onConflict: "user_id,slug" },
        )
        .select("id")
        .single(),
    );
    const projectId = project.id;

    for (const table of ["project_features", "project_tasks", "project_log"] as const) {
      check(
        `Nettoyage ${table} (${p.name})`,
        await supabase.from(table).delete().eq("project_id", projectId),
      );
    }

    if (p.features?.length) {
      check(
        `Fonctionnalités ${p.name}`,
        await supabase
          .from("project_features")
          .insert(
            p.features.map((f, i) => ({
              project_id: projectId,
              title: f.t,
              status: f.s,
              position: i,
            })),
          ),
      );
    }
    if (p.tasks?.length) {
      check(
        `Tâches ${p.name}`,
        await supabase
          .from("project_tasks")
          .insert(
            p.tasks.map((t, i) => ({
              project_id: projectId,
              title: t.t,
              done: !!t.done,
              position: i,
            })),
          ),
      );
    }
    if (p.log?.length) {
      check(
        `Journal ${p.name}`,
        await supabase.from("project_log").insert(
          // created_at décalé pour garder l'ordre d'origine à date égale
          p.log.map((l, i) => ({
            project_id: projectId,
            date: frDateToIso(l.d),
            text: l.t,
            created_at: new Date(Date.now() - i * 1000).toISOString(),
          })),
        ),
      );
    }
    console.log(
      `✓ ${p.name} : ${p.features?.length ?? 0} fonctionnalités, ${p.tasks?.length ?? 0} tâches, ${p.log?.length ?? 0} entrées de journal`,
    );
  }

  // 3. Ressources Notion / perso + curated.
  const resources = [
    ...seed.resources.map((r) => ({
      seed_key: r.id,
      user_id: userId,
      name: r.name,
      url: r.url ?? "",
      category: r.cat ?? "",
      tags: r.tags ?? [],
      note: r.note ?? "",
      source: r.source,
      verified: !!r.verified,
      notion_url: r.notionUrl ?? "",
      created_at: new Date(r.created ?? Date.now()).toISOString(),
    })),
    ...CURATED_RESOURCES.map((r, i) => ({
      seed_key: `c-${slug(r.name)}`,
      user_id: userId,
      name: r.name,
      url: r.url,
      category: r.cat,
      tags: r.tags,
      note: r.note,
      source: "curated" as const,
      verified: false,
      notion_url: "",
      // plus ancien que tout le reste, et dans l'ordre d'origine
      created_at: new Date(Date.UTC(2020, 0, 1) - i * 1000).toISOString(),
    })),
  ];
  check(
    "Ressources",
    await supabase.from("resources").upsert(resources, { onConflict: "user_id,seed_key" }),
  );
  console.log(
    `✓ ${seed.resources.length} ressources Notion/perso + ${CURATED_RESOURCES.length} ressources curated`,
  );
  console.log("Import terminé.");
}

main().catch((e: unknown) => {
  console.error("✗", e instanceof Error ? e.message : e);
  process.exit(1);
});
