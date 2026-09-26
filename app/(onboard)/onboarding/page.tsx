import { redirect } from "next/navigation";
import { getViewer } from "@/lib/session";
import { listMyProjects } from "./actions";
import { Wizard } from "./wizard";

export const metadata = { title: "Bienvenue" };

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; ask?: string }>;
}) {
  const [viewer, q, projects] = await Promise.all([getViewer(), searchParams, listMyProjects()]);
  if (!viewer) redirect("/login?next=/onboarding");
  return (
    <Wizard
      firstName={viewer.firstName}
      lastName={viewer.lastName}
      locale={viewer.locale}
      avatarUrl={viewer.avatarUrl}
      initial={viewer.initial}
      projects={projects}
      next={q.next}
      ask={q.ask}
    />
  );
}
