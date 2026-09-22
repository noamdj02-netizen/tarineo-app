"use server";

import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { signIn } from "@/auth";
import { estCallbackUrlInterne, lienHubApresConnexion } from "@/lib/routeApresAuth";

function redirectToDepuisFormData(formData: FormData): string {
  const brut = String(formData.get("callbackUrl") ?? "").trim();
  const callbackUrl = brut && estCallbackUrlInterne(brut) ? brut : null;
  return lienHubApresConnexion(callbackUrl);
}

function suffixeCallbackUrl(formData: FormData): string {
  const brut = String(formData.get("callbackUrl") ?? "").trim();
  if (!brut || !estCallbackUrlInterne(brut)) return "";
  return `&callbackUrl=${encodeURIComponent(brut)}`;
}

export async function seConnecter(formData: FormData) {
  const suffixe = suffixeCallbackUrl(formData);
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: redirectToDepuisFormData(formData),
    });
  } catch (error) {
    if (error instanceof AuthError) {
      const errCause = error.cause as { err?: { code?: string } } | undefined;
      const code = errCause?.err?.code ?? error.type;
      if (code === "google_only") {
        redirect(`/connexion?erreur=google${suffixe}`);
      }
      redirect(`/connexion?erreur=1${suffixe}`);
    }
    throw error;
  }
}

export async function seConnecterAvecGoogle(formData: FormData) {
  await signIn("google", { redirectTo: redirectToDepuisFormData(formData) });
}
