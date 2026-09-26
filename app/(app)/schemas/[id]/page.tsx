import { notFound } from "next/navigation";
import { SchemaEditorLoader } from "@/components/schemas/schema-editor-loader";
import { getDb } from "@/lib/db";
import { isSchemaKind } from "@/lib/schemas/agents";
import type { SchemaRow } from "@/lib/supabase/types";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function getSchema(id: string) {
  if (!UUID.test(id)) return null;
  const db = await getDb();
  if (!db) return null;
  const { data } = await db.supabase
    .from("project_schemas")
    .select("id, title, kind, project_id, scene, projects(name)")
    .eq("id", id)
    .eq("user_id", db.user.id)
    .maybeSingle();
  return data as
    | (Pick<SchemaRow, "id" | "title" | "kind" | "project_id" | "scene"> & {
        projects: { name: string } | null;
      })
    | null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const schema = await getSchema(id);
  return { title: schema?.title ?? "Schéma" };
}

export default async function SchemaPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ agent?: string; extra?: string }>;
}) {
  const [{ id }, { agent, extra }] = await Promise.all([params, searchParams]);
  const schema = await getSchema(id);
  if (!schema) notFound();
  // un agent ne dessine que sur un schéma encore vide
  const generate =
    agent &&
    isSchemaKind(agent) &&
    agent !== "libre" &&
    schema.project_id &&
    !schema.scene.elements.length
      ? {
          kind: agent,
          projectId: schema.project_id,
          extra: extra?.slice(0, 800) ?? "",
        }
      : null;

  return (
    <SchemaEditorLoader
      id={schema.id}
      title={schema.title}
      project={schema.projects?.name ?? null}
      scene={schema.scene}
      generate={generate}
    />
  );
}
