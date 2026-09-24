import "server-only";
import { getDb } from "@/lib/db";
import { createAdminClient } from "@/lib/supabase/admin";
import { isOpenAccess } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

type Result = { ok: true } | { ok: false; error: string };

/** Met à jour user_metadata. En accès libre, passe par le service role. */
export async function updateUserMeta(data: Record<string, unknown>): Promise<Result> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    const { error } = await supabase.auth.updateUser({ data });
    if (!error) return { ok: true };
    if (!isOpenAccess()) return { ok: false, error: "Enregistrement impossible." };
  }
  if (!isOpenAccess()) return { ok: false, error: "Pas connecté." };
  const db = await getDb();
  if (!db) return { ok: false, error: "Pas connecté." };
  const { error } = await createAdminClient().auth.admin.updateUserById(db.user.id, {
    user_metadata: { ...db.user.user_metadata, ...data },
  });
  if (error) return { ok: false, error: "Enregistrement impossible." };
  return { ok: true };
}
