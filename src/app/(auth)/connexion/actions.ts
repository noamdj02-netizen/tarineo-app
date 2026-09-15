"use server";

import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { signIn } from "@/auth";

export async function seConnecter(formData: FormData) {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/accueil",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      redirect("/connexion?erreur=1");
    }
    throw error;
  }
}

export async function seConnecterAvecGoogle() {
  await signIn("google", { redirectTo: "/accueil" });
}
