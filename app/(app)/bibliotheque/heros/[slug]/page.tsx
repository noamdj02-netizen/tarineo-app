import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { HeroStudio } from "@/components/heroes/hero-studio";
import { HeroRelatedLibs } from "@/components/ui-libs/related-libs";
import { PageHead } from "@/components/shell/page-head";
import { getPlan } from "@/lib/billing/plan";
import { getHeroWithMedia } from "@/lib/heroes/queries";
import { listProjects } from "@/lib/projects/queries";
import { libsForHero } from "@/lib/ui-libs/for-hero";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const hero = await getHeroWithMedia(slug);
  return { title: hero?.nom ?? "Hero" };
}

export default async function HeroDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [hero, plan, projects] = await Promise.all([
    getHeroWithMedia(slug),
    getPlan(),
    listProjects(),
  ]);
  if (!hero) notFound();
  const canUnlock = Boolean(plan && (plan.plan !== "free" || plan.isFreeTrial));

  return (
    <section>
      <Link
        href="/bibliotheque/heros"
        className="mb-4 inline-flex min-h-11 items-center gap-2 font-mono text-[11px] tracking-[0.1em] text-muted-foreground uppercase hover:text-ink"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Tous les heros
      </Link>
      <PageHead label={hero.id} title={hero.nom} tail={hero.pour}>
        {hero.tags.join(" · ")} · {hero.stack.join(", ")}
      </PageHead>
      <HeroStudio
        hero={hero}
        canUnlock={canUnlock}
        projects={projects.map((p) => ({
          id: p.id,
          slug: p.slug,
          name: p.name,
          status: p.status,
        }))}
      />
      <HeroRelatedLibs libs={libsForHero(hero)} />
    </section>
  );
}
