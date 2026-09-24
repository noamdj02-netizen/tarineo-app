import { redirect } from "next/navigation";

/** L'assistant vit maintenant dans un panneau latéral : les anciens liens l'ouvrent depuis l'accueil. */
export default async function AssistantPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const sp = new URLSearchParams({ send: "1" });
  if (q) sp.set("q", q.slice(0, 500));
  redirect(`/copilote?${sp}`);
}
