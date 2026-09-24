import { getViewer } from "@/lib/session";
import { Wizard } from "./wizard";

export const metadata = { title: "Bienvenue" };

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; ask?: string }>;
}) {
  const [viewer, q] = await Promise.all([getViewer(), searchParams]);
  if (!viewer) return null;
  return <Wizard firstName={viewer.firstName} locale={viewer.locale} next={q.next} ask={q.ask} />;
}
