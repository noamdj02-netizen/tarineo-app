import { redirect } from "next/navigation";

/** L'assistant vit maintenant dans un panneau latéral : les anciens liens l'ouvrent depuis l'accueil. */
export default async function AssistantPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  redirect(`/accueil?${new URLSearchParams({ ask: q?.slice(0, 500) || "1" })}`);
}
