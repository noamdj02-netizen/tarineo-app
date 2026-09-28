"use server";

import { revalidatePath } from "next/cache";
import { isSafePublicHttpUrl } from "@/lib/company/website-logo";
import { getDb } from "@/lib/db";
import { emptyCompany, siretValide, type CompanyProfile } from "@/lib/metier/company";
import { saveCompanyProfile } from "@/lib/metier/queries";
import type { RegimeTva } from "@/lib/metier/pdf/mentions";

export async function enregistrerEntreprise(form: FormData) {
  const db = await getDb();
  const siret = String(form.get("siret") ?? "").replace(/\s/g, "");
  if (!siretValide(siret)) return { ok: false as const, error: "SIRET invalide (14 chiffres, clé de Luhn)." };
  const regime = String(form.get("regimeTva") ?? "FRANCHISE_293B") as RegimeTva;
  const profile: CompanyProfile = {
    ...emptyCompany(),
    raison_sociale: String(form.get("raisonSociale") ?? "").trim(),
    siret,
    forme_juridique: String(form.get("formeJuridique") ?? "").trim(),
    adresse_rue: String(form.get("adresseRue") ?? "").trim(),
    adresse_code_postal: String(form.get("adresseCodePostal") ?? "").trim(),
    adresse_ville: String(form.get("adresseVille") ?? "").trim(),
    telephone: String(form.get("telephone") ?? "").trim(),
    email_contact: String(form.get("emailContact") ?? "").trim(),
    regime_tva: regime === "NORMAL" ? "NORMAL" : "FRANCHISE_293B",
    registre_immatriculation: String(form.get("registreImmatriculation") ?? "").trim(),
    assurance_nom: String(form.get("assuranceNom") ?? "").trim(),
    assurance_adresse: String(form.get("assuranceAdresse") ?? "").trim(),
    assurance_numero_contrat: String(form.get("assuranceNumeroContrat") ?? "").trim(),
    assurance_activites_garanties: String(form.get("assuranceActivitesGaranties") ?? "").trim(),
    assurance_zone_geographique: String(form.get("assuranceZoneGeographique") ?? "").trim(),
    logo_path: String(form.get("logoPath") ?? ""),
    marge_par_defaut_pct: Number(form.get("margeParDefautPct") ?? 35) || 35,
  };
  if (!profile.raison_sociale || !profile.adresse_rue || !profile.adresse_ville) {
    return { ok: false as const, error: "Raison sociale et adresse sont requises." };
  }

  const file = form.get("logo");
  if (file instanceof File && file.size > 0 && db) {
    const uploaded = await uploadLogo(db.user.id, db.supabase, file);
    if (uploaded) profile.logo_path = uploaded;
  } else {
    const remoteLogo = String(form.get("logoUrl") ?? "").trim();
    if (remoteLogo && db && !profile.logo_path) {
      const uploaded = await importLogoFromUrl(db.user.id, db.supabase, remoteLogo);
      if (uploaded) profile.logo_path = uploaded;
    }
  }

  try {
    await saveCompanyProfile(profile);
  } catch (err) {
    console.error("[metier] enregistrerEntreprise", err);
    return { ok: false as const, error: "Profil non enregistré." };
  }
  revalidatePath("/entreprise");
  revalidatePath("/onboarding");
  return { ok: true as const };
}

async function uploadLogo(
  userId: string,
  supabase: NonNullable<Awaited<ReturnType<typeof getDb>>>["supabase"],
  file: File,
) {
  const ext = file.type.includes("png") ? "png" : file.type.includes("webp") ? "webp" : "jpg";
  const path = `${userId}/entreprise/logo.${ext}`;
  const buf = Buffer.from(await file.arrayBuffer());
  const { error } = await supabase.storage.from("documents").upload(path, buf, {
    contentType: file.type || "image/jpeg",
    upsert: true,
  });
  return error ? null : path;
}

async function importLogoFromUrl(
  userId: string,
  supabase: NonNullable<Awaited<ReturnType<typeof getDb>>>["supabase"],
  url: string,
) {
  if (!isSafePublicHttpUrl(url)) return null;
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(5_000),
      headers: { Accept: "image/*,*/*" },
      redirect: "follow",
    });
    if (!res.ok) return null;
    if (!isSafePublicHttpUrl(res.url)) return null;
    const type = (res.headers.get("content-type") ?? "").split(";")[0]?.trim() ?? "";
    if (!/^image\/(png|jpeg|jpg|webp|gif)$/i.test(type)) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.byteLength < 64 || buf.byteLength > 2_000_000) return null;
    const ext = type.includes("png") ? "png" : type.includes("webp") ? "webp" : type.includes("gif") ? "gif" : "jpg";
    const path = `${userId}/entreprise/logo.${ext}`;
    const { error } = await supabase.storage.from("documents").upload(path, buf, {
      contentType: type,
      upsert: true,
    });
    return error ? null : path;
  } catch {
    return null;
  }
}
