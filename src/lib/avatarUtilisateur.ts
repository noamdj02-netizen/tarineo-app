import { DOCUMENTS_BUCKET, getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";

const DUREE_URL_SEC = 3600;

export function estCleStockageAvatar(image: string): boolean {
  return image.startsWith("avatars/");
}

/** URL publique (Google) ou URL signée Supabase pour un avatar stocké en bucket. */
export async function resoudreUrlAvatar(image: string | null | undefined): Promise<string | null> {
  if (!image) return null;
  if (image.startsWith("http://") || image.startsWith("https://")) return image;
  if (!estCleStockageAvatar(image) || !isSupabaseConfigured()) return null;

  try {
    const { data } = await getSupabaseAdmin().storage.from(DOCUMENTS_BUCKET).createSignedUrl(image, DUREE_URL_SEC);
    return data?.signedUrl ?? null;
  } catch {
    return null;
  }
}
