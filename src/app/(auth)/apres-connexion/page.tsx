import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { resoudreRouteApresAuth } from "@/lib/routeApresAuth";

export default async function ApresConnexionPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const session = await getSession();
  if (!session?.user?.id) {
    redirect("/connexion");
  }

  const { callbackUrl } = await searchParams;
  const destination = await resoudreRouteApresAuth(session.user.id, callbackUrl ?? null);
  redirect(destination);
}
