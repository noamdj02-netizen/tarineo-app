import { redirect } from "next/navigation";
import { R } from "@/lib/routes";

export default async function RedirectPage({
  searchParams,
}: {
  searchParams: Promise<{ article?: string }>;
}) {
  const { article } = await searchParams;
  redirect(article ? `${R.comparateur}?article=${encodeURIComponent(article)}` : R.comparateur);
}
