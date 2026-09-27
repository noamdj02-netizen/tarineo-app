"use server";

import { revalidatePath } from "next/cache";
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
    const ext = file.type.includes("png") ? "png" : file.type.includes("webp") ? "webp" : "jpg";
    const path = `${db.user.id}/entreprise/logo.${ext}`;
    const buf = Buffer.from(await file.arrayBuffer());
    const { error } = await db.supabase.storage.from("documents").upload(path, buf, {
      contentType: file.type || "image/jpeg",
      upsert: true,
    });
    if (!error) profile.logo_path = path;
  }

  await saveCompanyProfile(profile);
  revalidatePath("/entreprise");
  revalidatePath("/composants");
  return { ok: true as const };
}
