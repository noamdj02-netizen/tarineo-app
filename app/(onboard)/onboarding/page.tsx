import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { listChantiers, listDocuments, listParties } from "@/lib/metier/queries";
import { resolveOnboardingStartStep } from "@/lib/onboarding/resolve-start-step";
import { getViewer } from "@/lib/session";
import { ensureOnboardingChantier, saveWelcome } from "./actions";
import { Wizard } from "./wizard";

export const metadata = { title: "Bienvenue" };

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; ask?: string; step?: string }>;
}) {
  const [viewer, q] = await Promise.all([getViewer(), searchParams]);
  if (!viewer) redirect("/login?next=/onboarding");

  const db = await getDb();
  const meta = db?.user.user_metadata ?? {};
  const jump = Number(q.step);
  const startStep = resolveOnboardingStartStep({
    firstName: viewer.firstName,
    onboardingStep: typeof meta.onboarding_step === "string" ? meta.onboarding_step : null,
    queryStep: Number.isInteger(jump) ? jump : undefined,
    devJump: process.env.NODE_ENV !== "production",
  });

  await ensureOnboardingChantier();

  const stepMeta = typeof meta.onboarding_step === "string" ? meta.onboarding_step : null;
  if (
    startStep >= 1 &&
    viewer.firstName.trim().length >= 2 &&
    stepMeta !== "identite" &&
    stepMeta !== "document" &&
    stepMeta !== "document_skipped"
  ) {
    await saveWelcome(viewer.firstName, viewer.locale, viewer.lastName);
  }
  const [chantiers, clients, docs] = await Promise.all([
    listChantiers(),
    listParties("client"),
    listDocuments(),
  ]);

  return (
    <Wizard
      firstName={viewer.firstName}
      lastName={viewer.lastName}
      locale={viewer.locale}
      email={viewer.email ?? ""}
      chantiers={chantiers}
      clients={clients}
      next={q.next}
      ask={q.ask}
      startStep={startStep}
      hasInboundDoc={docs.some((d) => d.direction === "in")}
    />
  );
}
