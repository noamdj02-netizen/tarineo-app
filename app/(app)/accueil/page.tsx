import { loadDashboardLayout } from "@/app/(app)/accueil/dashboard-actions";
import type { ActionCard } from "@/components/home/action-cards";
import { HomeDashboard } from "@/components/home/home-dashboard";
import { getDb } from "@/lib/db";
import { getWeekStats } from "@/lib/home/week";
import { getViewer } from "@/lib/session";

import { siteMetadata } from "@/lib/seo";

export const metadata = {
  title: "Accueil",
  ...siteMetadata({ title: "Accueil", path: "/accueil", noIndex: true }),
};

async function getDashboardData() {
  const db = await getDb();
  if (!db) return { focus: null, projects: [], schemas: [] as { id: string; title: string; kind: string }[] };
  const [focusRes, projectsRes, schemasRes] = await Promise.all([
    db.supabase
      .from("projects")
      .select("slug, name, next")
      .eq("user_id", db.user.id)
      .eq("status", "focus")
      .order("sort_order")
      .limit(1)
      .maybeSingle(),
    db.supabase
      .from("projects")
      .select("slug, name, status, next")
      .eq("user_id", db.user.id)
      .order("sort_order")
      .limit(8),
    db.supabase
      .from("project_schemas")
      .select("id, title, kind")
      .eq("user_id", db.user.id)
      .order("updated_at", { ascending: false })
      .limit(6),
  ]);
  return {
    focus: focusRes.data,
    projects: projectsRes.data ?? [],
    schemas: schemasRes.data ?? [],
  };
}

export default async function AccueilPage() {
  const [viewer, dashData, week, dashboardLayout] = await Promise.all([
    getViewer(),
    getDashboardData(),
    getDb().then((db) => (db ? getWeekStats(db) : null)),
    loadDashboardLayout(),
  ]);
  const { focus, projects, schemas } = dashData;

  const cards: ActionCard[] = [
    focus
      ? {
          n: "01",
          label: "Projet en Focus",
          title: `Continuer ${focus.name}`,
          text:
            focus.next || "Ouvre la fiche pour choisir ta prochaine action.",
          href: `/projets/${focus.slug}`,
          icon: "rocket",
        }
      : {
          n: "01",
          label: "Projets",
          title: "Choisir ton projet en Focus",
          text: "Un seul projet à la fois, jusqu’à sa première vente.",
          href: "/projets",
          icon: "rocket",
        },
    {
      n: "02",
      label: "Landing",
      title: "Ta landing en 5 minutes",
      text: "Choisis un hero, ajoute-le au projet, envoie-le à Cursor ou au copilote.",
      href: "/bibliotheque/heros",
      icon: "check",
    },
    {
      n: "03",
      label: "Thèmes",
      title: "Choisir un thème",
      text: "Couleurs, typos et arrondis prêts à copier dans ton projet.",
      href: "/themes",
      icon: "palette",
    },
  ];

  return (
    <HomeDashboard
      firstName={viewer?.firstName}
      cards={cards}
      week={week}
      initialLayout={dashboardLayout}
      projects={projects}
      schemas={schemas}
      focus={focus}
      showTour={viewer?.needsTour === true}
    />
  );
}
