import { redirect } from "next/navigation";
import { R } from "@/lib/routes";

export default async function RedirectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  redirect(R.chantier(slug));
}
