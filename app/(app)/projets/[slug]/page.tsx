import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LaunchReminders } from "@/components/projects/launch-reminders";
import { MarketingCard } from "@/components/projects/marketing-card";
import { ProjectAtelier } from "@/components/projects/project-atelier";
import { ProjectDetail } from "@/components/projects/project-detail";
import { SeoScoreCard } from "@/components/projects/seo-score-card";
import { STATUS_TITLE } from "@/components/projects/status-badge";
import { PageHead } from "@/components/shell/page-head";
import { loadConnectorSignals } from "@/lib/connectors/signals";
import { projectJourney } from "@/lib/projects/journey";
import { launchFromBusiness } from "@/lib/projects/launch-checks";
import { marketingFromBusiness } from "@/lib/projects/marketing";
import { seoFromBusiness } from "@/lib/projects/seo";
import { getProject, listProjectMedia, listProjects } from "@/lib/projects/queries";

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
  const media = await listProjectMedia(project.id);
  const [all, signals] = await Promise.all([listProjects(), loadConnectorSignals()]);
  const focusCount = all.filter((item) => item.status === "focus").length;
  const seo = seoFromBusiness(project.business);
  const marketing = marketingFromBusiness(project.business);
  const launch = launchFromBusiness(project.business);
  const steps = projectJourney({
    site: project.site,
    assets: media.assets,
    schemas: media.schemas,
    seo,
    marketing,
    launch,
  });
  return (
    <section className="mx-auto w-full max-w-[1080px]">
      <Link
        href="/projets"
        className="mb-4 inline-flex min-h-11 items-center gap-2 font-mono text-[11px] font-medium tracking-[0.1em] text-muted-foreground uppercase hover:text-ink"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Tous les projets
      </Link>
      <PageHead
        label={STATUS_TITLE[project.status]}
        title={project.name}
        tail="page atelier."
      >
        Du hero au lancement, tout se coche ici. Vert = fait.
      </PageHead>
      <ProjectAtelier steps={steps} />
      <div className="mb-3">
        <SeoScoreCard
          projectId={project.id}
          name={project.name}
          site={project.site}
          initial={seo}
        />
      </div>
      <div className="mb-3">
        <LaunchReminders
          projectId={project.id}
          name={project.name}
          site={project.site}
          gaId={seo.gaId}
          gsc={seo.gsc}
          stripe={Boolean(signals.connections.stripe)}
          initial={launch}
        />
      </div>
      <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_340px] xl:items-start">
        <ProjectDetail
          project={project}
          schemas={media.schemas}
          assets={media.assets}
          notes={media.notes}
          focusCount={focusCount}
        />
        <div className="xl:sticky xl:top-4">
          <MarketingCard
            projectId={project.id}
            name={project.name}
            initial={marketing}
          />
        </div>
      </div>
    </section>
  );
}
