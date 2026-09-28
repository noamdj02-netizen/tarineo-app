import { redirect } from "next/navigation";
import { getViewer } from "@/lib/session";
import { listMyProjects } from "./actions";
import { Wizard } from "./wizard";

export const metadata = { title: "Bienvenue" };

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; ask?: string; step?: string }>;
}) {
  const [viewer, q, projects] = await Promise.all([getViewer(), searchParams, listMyProjects()]);
  if (!viewer) redirect("/login?next=/onboarding");
  const jump = Number(q.step);
  const startStep =
    process.env.NODE_ENV !== "production" && Number.isInteger(jump) && jump >= 0 && jump <= 4
      ? jump
      : 0;
  return (
    <Wizard
      firstName={viewer.firstName}
      lastName={viewer.lastName}
      locale={viewer.locale}
      email={viewer.email ?? ""}
      avatarUrl={viewer.avatarUrl}
      initial={viewer.initial}
      projects={projects}
      next={q.next}
      ask={q.ask}
      startStep={startStep}
    />
  );
}
