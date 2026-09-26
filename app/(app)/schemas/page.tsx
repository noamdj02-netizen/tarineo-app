import {
  SchemaLibrary,
  type SchemaCard,
} from "@/components/schemas/schema-library";
import { PageHead } from "@/components/shell/page-head";
import { getDb } from "@/lib/db";

export const metadata = { title: "Schémas" };

async function getData() {
  const db = await getDb();
  if (!db) return { schemas: [], projects: [] };
  const [schemas, projects] = await Promise.all([
    db.supabase
      .from("project_schemas")
      .select("id, title, kind, project_id, updated_at")
      .eq("user_id", db.user.id)
      .order("updated_at", { ascending: false }),
    db.supabase
      .from("projects")
      .select("id, name, status")
      .eq("user_id", db.user.id)
      .order("sort_order"),
  ]);
  return {
    schemas: (schemas.data ?? []) as SchemaCard[],
    projects: (projects.data ?? []).map((p) => ({
      id: p.id,
      name: p.name,
      focus: p.status === "focus",
    })),
  };
}

export default async function SchemasPage() {
  const { schemas, projects } = await getData();
  return (
    <section>
      <PageHead
        art="onboarding-decouvrir"
        label="Schémas"
        title="Tes schémas,"
        tail="dessinés ou générés."
      >
        Un agent pour l’archi, le parcours, le tunnel, la roadmap, les
        données, la formation ou l’offre. Tu donnes les variables, il
        dessine, tu corriges.
      </PageHead>
      <SchemaLibrary schemas={schemas} projects={projects} />
    </section>
  );
}
