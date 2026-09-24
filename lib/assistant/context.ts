import "server-only";
import type { Db } from "@/lib/db";
import { COMPONENTS } from "@/lib/design-data/components";
import { FRAMES } from "@/lib/design-data/frames";
import { BLOCKS, PACKS } from "@/lib/design-data/packs";
import { CURATED_RESOURCES, STAGES } from "@/lib/design-data/resources";
import { THEMES, swatches } from "@/lib/design-data/themes";

/**
 * Partie fixe de la consigne : identique pour tout le monde, donc mise en cache par l'API.
 * Reprise du HTML d'origine (context()), sans les projets ni les ressources.
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

function intro(firstName: string) {
  const who = firstName || "l'utilisateur";
  return `Tu es le copilote de Navpit, le cockpit de ${who}, développeur solo et entrepreneur (SaaS). Réponds en français, simple, direct, phrases courtes, listes courtes : ${who} est TDAH et dyslexique. Quand il demande un prompt pour Cursor/Claude Code, donne-le dans un bloc prêt à copier.
Règle "Mon Bureau" : un seul projet en Focus jusqu'à sa première vente.`;
}

type ProjectCtx = {
  name: string;
  description: string;
  status: string;
  stage: number;
  next: string;
  site: string;
  theme: string;
  partner: string;
  pitch: string;
  business: unknown;
  stack: string[];
  risks: string[];
  project_features: { title: string; status: string; position: number }[] | null;
  project_tasks: { title: string; done: boolean; position: number }[] | null;
};

/** Partie propre à l'utilisateur : ses projets et ses ressources, lus dans Supabase. */
export async function userContext(db: Db, firstName: string) {
  const [projects, resources] = await Promise.all([
    db.supabase
      .from("projects")
      .select(
        "name, description, status, stage, next, site, theme, partner, pitch, business, stack, risks, project_features(title, status, position), project_tasks(title, done, position)",
      )
      .eq("user_id", db.user.id)
      .order("sort_order"),
    db.supabase
      .from("resources")
      .select("name, category, url, note")
      .eq("user_id", db.user.id)
      .neq("source", "curated")
      .order("created_at", { ascending: false })
      .limit(70),
  ]);

  const byPos = <T extends { position: number }>(a: T, b: T) => a.position - b.position;
  const P = ((projects.data ?? []) as unknown as ProjectCtx[]).map((p) => ({
    nom: p.name,
    desc: p.description,
    statut: p.status,
    etape: `${p.stage}/6 ${STAGES[(p.stage || 1) - 1]}`,
    prochaine_action: p.next,
    site: p.site,
    theme: p.theme,
    avec: p.partner,
    pitch: p.pitch,
    fonctions: [...(p.project_features ?? [])].sort(byPos).map((f) => `${f.title} [${f.status}]`),
    taches: [...(p.project_tasks ?? [])]
      .sort(byPos)
      .map((t) => t.title + (t.done ? " [fait]" : "")),
    business: p.business,
    stack: p.stack,
    risques: p.risks,
  }));

  // Mêmes 70 ressources max que l'original : les siennes d'abord, puis les « curated »
  const own = (resources.data ?? []).map((r) => ({
    name: r.name,
    cat: r.category,
    url: r.url,
    note: r.note,
  }));
  const all = [...own, ...CURATED_RESOURCES].slice(0, 70);

  return [
    intro(firstName),
    `PROJETS: ${JSON.stringify(P)}`,
    `RESSOURCES: ${all.map((r) => `${r.name} [${r.cat}] ${r.url || ""} — ${r.note || ""}`).join("\n")}`,
  ].join("\n");
}
