import { ResumeSession } from "@/components/auth/resume-session";
import { safeNext } from "@/lib/safe-next";

export const metadata = { title: "Connexion" };

export default async function SessionPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  return <ResumeSession next={safeNext(next)} />;
}
