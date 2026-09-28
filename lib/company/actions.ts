"use server";

import { lookupCompany } from "@/lib/company/company-lookup";
import type { CompanyLookupResponse } from "@/lib/company/types";
import { getDb } from "@/lib/db";

/** Recherche entreprise (session requise) — préférer à /api pour l’onboarding. */
export async function lookupCompanyAction(query: string): Promise<CompanyLookupResponse> {
  const db = await getDb();
  if (!db) {
    return { status: "error", message: "Connexion requise." };
  }
  const q = String(query ?? "").trim();
  if (q.length < 2) {
    return { status: "error", message: "Indiquez un nom d’entreprise ou un site web." };
  }
  try {
    return await lookupCompany(q);
  } catch (err) {
    console.error("[lookupCompanyAction]", err);
    return {
      status: "error",
      message: "La recherche d’entreprise est temporairement indisponible. Saisissez les infos manuellement.",
    };
  }
}
