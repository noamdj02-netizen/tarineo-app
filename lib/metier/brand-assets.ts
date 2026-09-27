import "server-only";
import { getDb } from "@/lib/db";
import { getCompanyProfile } from "@/lib/metier/queries";

export async function loadCompanyLogo() {
  const p = await getCompanyProfile();
  if (!p?.logo_path) return null;
  const db = await getDb();
  if (!db) return null;
  const { data } = await db.supabase.storage.from("documents").download(p.logo_path);
  if (!data) return null;
  const buffer = Buffer.from(await data.arrayBuffer());
  const ext = p.logo_path.endsWith(".png")
    ? "png"
    : p.logo_path.endsWith(".webp")
      ? "webp"
      : p.logo_path.endsWith(".gif")
        ? "gif"
        : "jpg";
  const mime =
    ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : ext === "gif" ? "image/gif" : "image/jpeg";
  return { buffer, mime, filename: `logo.${ext}`, cid: "company-logo" as const };
}

export async function loadCompanyLogoUrl() {
  const p = await getCompanyProfile();
  if (!p?.logo_path) return null;
  const db = await getDb();
  if (!db) return null;
  const { data } = await db.supabase.storage.from("documents").createSignedUrl(p.logo_path, 3600);
  return data?.signedUrl ?? null;
}
