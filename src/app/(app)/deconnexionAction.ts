"use server";

import { signOut } from "@/auth";

// Extrait de layout.tsx (ex-nav horizontale) pour pouvoir être utilisé comme
// `action` de formulaire depuis AppShell.tsx, qui est un composant client (le hamburger
// mobile a besoin d'état local) — une server action inline "use server" ne peut pas
// être définie directement dans un arbre client.
export async function deconnexionAction() {
  await signOut({ redirectTo: "/" });
}
