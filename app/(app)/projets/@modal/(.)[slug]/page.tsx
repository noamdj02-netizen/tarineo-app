import { notFound } from "next/navigation";
import { ProjectDetail } from "@/components/projects/project-detail";
import { ProjectSheet } from "@/components/projects/project-sheet";
import { getProject } from "@/lib/projects/queries";

/** Clic sur une carte : la fiche s'ouvre en panneau, la liste reste derrière. */
export default async function ProjectSheetPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) notFound();
  return (
    <ProjectSheet name={project.name} status={project.status}>
      <ProjectDetail project={project} />
    </ProjectSheet>
  );
}
