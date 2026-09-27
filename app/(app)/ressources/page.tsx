import { redirect } from "next/navigation";
import { R } from "@/lib/routes";

export default async function RedirectPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const q = new URLSearchParams();
  const sp = await searchParams;
  for (const [k, v] of Object.entries(sp)) if (v) q.set(k, v);
  redirect(q.size ? `${R.distributeur}?${q}` : R.distributeur);
}
