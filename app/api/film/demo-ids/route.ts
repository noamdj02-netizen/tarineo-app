import { NextResponse } from "next/server";
import { DEMO_IDS } from "@/lib/metier/demo";
import { ensureMetierSeed, listDocuments } from "@/lib/metier/queries";
import { isOpenAccess } from "@/lib/supabase/config";
import { productSlug } from "@/lib/tarineo/product-slug";

export async function GET() {
  if (process.env.NODE_ENV === "production" || !isOpenAccess()) {
    return NextResponse.json({ error: "Indisponible." }, { status: 404 });
  }
  await ensureMetierSeed();
  const docs = await listDocuments();
  const bySeed = (key: string) => docs.find((d) => d.seed_key === key)?.id ?? null;
  return NextResponse.json({
    docOut: bySeed(DEMO_IDS.docOut),
    docOutPret: bySeed(DEMO_IDS.docOutPret),
    docIn: bySeed(DEMO_IDS.docIn),
    productSlug: productSlug("Tube PVC Ø 500"),
  });
}
