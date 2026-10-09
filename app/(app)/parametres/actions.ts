"use server";

import { revalidatePath } from "next/cache";
import { extractEmailSignatureFromPaste } from "@/lib/metier/email-signature-extract";
import { getEntrepriseConfig, saveWorkspaceSettings } from "@/lib/settings/entreprise-config";
import { canEditSection } from "@/lib/settings/roles";
import {
  emptyAiSettings,
  emptyCommercial,
  emptyDocumentSettings,
  emptyEmailSettings,
  type AiSettings,
  type CommercialSettings,
  type DocumentSettings,
  type EmailSettings,
} from "@/lib/settings/workspace-settings";

function refresh() {
  revalidatePath("/parametres");
  revalidatePath("/parametres/tarification");
  revalidatePath("/parametres/documents");
  revalidatePath("/parametres/ia");
  revalidatePath("/parametres/entreprise");
  revalidatePath("/entreprise");
  revalidatePath("/accueil");
  revalidatePath("/fournisseurs");
  revalidatePath("/achats/export");
}

function numOrNull(v: FormDataEntryValue | null): number | null {
  if (v == null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export async function saveCommercialSettingsAction(form: FormData) {
  const { role, settings } = await getEntrepriseConfig();
  if (!canEditSection(role, "tarification")) {
    return { ok: false as const, error: "Permission refusée." };
  }
  const commercial: CommercialSettings = {
    ...settings.commercial,
    tauxHoraireHt: numOrNull(form.get("tauxHoraireHt")),
    coefficientMateriaux: numOrNull(form.get("coefficientMateriaux")),
    margeCiblePct: numOrNull(form.get("margeCiblePct")),
    tvaDefautPct: numOrNull(form.get("tvaDefautPct")),
    conditionsPaiement: String(form.get("conditionsPaiement") ?? "").trim().slice(0, 500),
    acomptePct: numOrNull(form.get("acomptePct")),
    validiteDevisJours: numOrNull(form.get("validiteDevisJours")) ?? 30,
  };
  const res = await saveWorkspaceSettings({ ...settings, commercial });
  if (!res.ok) return res;
  refresh();
  return { ok: true as const };
}

export async function saveDistributorGoalsAction(form: FormData) {
  const { role, settings } = await getEntrepriseConfig();
  if (!canEditSection(role, "tarification")) {
    return { ok: false as const, error: "Permission refusée." };
  }
  const annual: Record<string, number> = { ...settings.commercial.distributorGoalsHt };
  const monthly: Record<string, number> = { ...settings.commercial.distributorGoalsMonthlyHt };
  for (const [key, value] of form.entries()) {
    if (key.startsWith("goal:")) {
      const label = key.slice(5).trim();
      if (!label) continue;
      const n = numOrNull(value);
      if (n != null && n > 0) annual[label] = n;
      else delete annual[label];
      continue;
    }
    if (key.startsWith("goalMonth:")) {
      const label = key.slice("goalMonth:".length).trim();
      if (!label) continue;
      const n = numOrNull(value);
      if (n != null && n > 0) monthly[label] = n;
      else delete monthly[label];
    }
  }
  const commercial: CommercialSettings = {
    ...settings.commercial,
    distributorGoalsHt: annual,
    distributorGoalsMonthlyHt: monthly,
  };
  const res = await saveWorkspaceSettings({ ...settings, commercial });
  if (!res.ok) return res;
  refresh();
  return { ok: true as const };
}

export async function saveDocumentSettingsAction(form: FormData) {
  const { role, settings } = await getEntrepriseConfig();
  if (!canEditSection(role, "documents")) {
    return { ok: false as const, error: "Permission refusée." };
  }
  const documents: DocumentSettings = {
    ...emptyDocumentSettings(),
    mentionPiedPage: String(form.get("mentionPiedPage") ?? "").trim().slice(0, 2000),
    conditionsGenerales: String(form.get("conditionsGenerales") ?? "").trim().slice(0, 8000),
    numerotationPrefixe: String(form.get("numerotationPrefixe") ?? "").trim().slice(0, 32),
  };
  const res = await saveWorkspaceSettings({ ...settings, documents });
  if (!res.ok) return res;
  refresh();
  return { ok: true as const };
}

export async function saveAiSettingsAction(form: FormData) {
  const { role, settings } = await getEntrepriseConfig();
  if (!canEditSection(role, "ia")) {
    return { ok: false as const, error: "Permission refusée." };
  }
  const ai: AiSettings = {
    ...emptyAiSettings(),
    analyseDevis: form.get("analyseDevis") === "on",
    analyseFacture: form.get("analyseFacture") === "on",
    detectionHausses: form.get("detectionHausses") === "on",
    copilote: form.get("copilote") === "on",
  };
  const res = await saveWorkspaceSettings({ ...settings, ai });
  if (!res.ok) return res;
  refresh();
  return { ok: true as const };
}

export async function extractEmailSignatureAction(raw: string) {
  const { role } = await getEntrepriseConfig();
  if (!canEditSection(role, "entreprise")) {
    return { ok: false as const, error: "Permission refusée." };
  }
  const text = String(raw ?? "").trim();
  if (text.length < 20) {
    return { ok: false as const, error: "Collez un e-mail plus complet (au moins la signature)." };
  }
  const extracted = await extractEmailSignatureFromPaste(text);
  if (!extracted.signatureText && !extracted.signOff) {
    return { ok: false as const, error: "Aucune signature détectée. Vérifiez le collage." };
  }
  return { ok: true as const, extracted };
}

export async function saveEmailSignatureAction(input: {
  signOff: string;
  signatureText: string;
  fromName: string;
  logoFromEmailUrl: string;
}) {
  const { role, settings } = await getEntrepriseConfig();
  if (!canEditSection(role, "entreprise")) {
    return { ok: false as const, error: "Permission refusée." };
  }
  const email: EmailSettings = {
    ...emptyEmailSettings(),
    signOff: String(input.signOff ?? "").trim().slice(0, 120),
    signatureText: String(input.signatureText ?? "").trim().slice(0, 2000),
    fromName: String(input.fromName ?? "").trim().slice(0, 120),
    logoFromEmailUrl: String(input.logoFromEmailUrl ?? "").trim().slice(0, 500),
  };
  const res = await saveWorkspaceSettings({ ...settings, email });
  if (!res.ok) return res;
  refresh();
  return { ok: true as const };
}

export async function getCompanyMailIdentityAction() {
  const { getCompanyMailIdentity } = await import("@/lib/metier/company-mail-identity");
  return getCompanyMailIdentity();
}
