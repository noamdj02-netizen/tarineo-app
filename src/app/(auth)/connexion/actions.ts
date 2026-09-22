"use server";

import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { signIn } from "@/auth";
import { ROUTE_APRES_AUTH } from "@/lib/appRoutes";

export async function seConnecter(formData: FormData) {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: ROUTE_APRES_AUTH,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      const errCause = error.cause as { err?: { code?: string } } | undefined;
      const code = errCause?.err?.code ?? error.type;
      if (code === "google_only") {
        redirect("/connexion?erreur=google");
      }
      redirect("/connexion?erreur=1");
    }
    throw error;
  }
}

export async function seConnecterAvecGoogle() {
  await signIn("google", { redirectTo: ROUTE_APRES_AUTH });
}
