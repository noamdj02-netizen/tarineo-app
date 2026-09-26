import "server-only";
import { notFound, redirect } from "next/navigation";
import { OWNER_EMAIL } from "@/lib/billing/plan";
import { isOpenAccess } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

function isAdmin(email: string | undefined) {
  return email?.trim().toLowerCase() === OWNER_EMAIL;
}

/**
 * Email qui a le droit de voir Analyses.
 * Session réelle d’abord. En accès libre local, le site est déjà le compte seed :
 * on l’accepte seulement si c’est cette adresse, et jamais en production.
 */
async function adminEmail() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user?.email) return user.email;
  if (isOpenAccess() && process.env.NODE_ENV !== "production") {
    return process.env.SEED_USER_EMAIL;
  }
  return undefined;
}

/** Vrai droit d’afficher le lien Analyses. */
export async function sessionIsOwner() {
  return isAdmin(await adminEmail());
}

/** Réservé à noamdj02@gmail.com. Sans droit : connexion, ou 404 si un autre compte est connecté. */
export async function requireOwner() {
  const email = await adminEmail();
  if (!email) redirect("/login?next=/admin");
  if (!isAdmin(email)) notFound();
  return email;
}
