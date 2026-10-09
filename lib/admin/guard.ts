import "server-only";
import { notFound, redirect } from "next/navigation";
import { isOwner } from "@/lib/billing/plan";
import { isOpenAccess } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

/**
 * Email qui a le droit de voir /admin.
 * Session réelle d’abord. En accès libre local, le site est déjà le compte seed :
 * on l’accepte seulement si c’est un owner, et jamais en production.
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

/** Vrai droit d’afficher le lien Analyses / admin. */
export async function sessionIsOwner() {
  return isOwner(await adminEmail());
}

/** Réservé aux comptes studio (Noam, Alan, NAVPIT_OWNER_EMAILS). */
export async function requireOwner() {
  const email = await adminEmail();
  if (!email) redirect("/login?next=/admin");
  if (!isOwner(email)) notFound();
  return email;
}
