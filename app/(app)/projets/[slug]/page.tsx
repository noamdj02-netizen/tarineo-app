import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProjectDetail } from "@/components/projects/project-detail";
import { PageHead } from "@/components/shell/page-head";
import { getProject } from "@/lib/projects/queries";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProject(slug);
  return { title: project?.name ?? "Projet" };
}

/** Lien direct (/projets/tarineo) ou rechargement : la fiche en pleine page. */
export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) notFound();
  return (
    <section className="mx-auto max-w-[760px]">
      <Link
        href="/projets"
        className="mb-4 inline-flex min-h-11 items-center gap-2 font-mono text-[11px] font-medium tracking-[0.1em] text-muted uppercase hover:text-ink"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Tous les projets
      </Link>
      <PageHead
        label={project.status === "focus" ? "Projet en focus" : "Projet en pause"}
        title={project.name}
      />
      <ProjectDetail project={project} />
    </section>
  );
}
