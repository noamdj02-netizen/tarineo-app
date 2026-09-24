"use server";

import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/db";
import { isLocale } from "@/lib/i18n";
import { updateUserMeta } from "@/lib/profile";
import { createAdminClient } from "@/lib/supabase/admin";
import { isOpenAccess } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

type Result = { ok: true } | { ok: false; error: string };

const MAX_AVATAR = 2 * 1024 * 1024;

function refresh() {
  revalidatePath("/compte");
  revalidatePath("/onboarding");
  revalidatePath("/", "layout");
}

/** Rouvre le wizard (5 étapes) même si tu l’avais déjà terminé. */
export async function openOnboardingWizard(): Promise<Result> {
  const res = await updateUserMeta({ onboarding_required: true, onboarding_done: false });
  if (!res.ok) return res;
  refresh();
  return { ok: true };
}

export async function updateProfile(input: {
  firstName?: string;
  locale?: string;
}): Promise<Result> {
  const data: Record<string, string> = {};
  if (input.firstName !== undefined) {
    const name = input.firstName.trim().slice(0, 60);
    if (!name) return { ok: false, error: "Indique un prénom." };
    data.first_name = name;
  }
  if (input.locale !== undefined) {
    if (!isLocale(input.locale)) return { ok: false, error: "Langue inconnue." };
    data.locale = input.locale;
  }
  const res = await updateUserMeta(data);
  if (!res.ok) return res;
  refresh();
  return { ok: true };
}

export async function uploadAvatar(formData: FormData): Promise<Result> {
  const db = await getDb();
  if (!db) return { ok: false, error: "Pas connecté." };

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { ok: false, error: "Choisis une photo." };
  if (file.size > MAX_AVATAR) return { ok: false, error: "Photo trop lourde (2 Mo max)." };
  if (!/^image\/(jpeg|png|webp|gif)$/.test(file.type)) {
    return { ok: false, error: "JPEG, PNG ou WebP seulement." };
  }

  const session = await createClient();
  const {
    data: { user },
  } = await session.auth.getUser();
  const storage = user ? session : isOpenAccess() ? createAdminClient() : null;
  if (!storage) return { ok: false, error: "Pas connecté." };

  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const path = `${db.user.id}/avatar.${ext}`;
  const { error: upErr } = await storage.storage.from("avatars").upload(path, file, {
    upsert: true,
    contentType: file.type,
  });
  if (upErr) {
    const msg = upErr.message.toLowerCase();
    if (msg.includes("bucket") || msg.includes("not found")) {
      return {
        ok: false,
        error: "Stockage avatars absent : applique la migration Supabase « avatars ».",
      };
    }
    return { ok: false, error: "Upload impossible. Réessaie ou choisis une image plus légère." };
  }

  const { data } = storage.storage.from("avatars").getPublicUrl(path);
  const meta = await updateUserMeta({ avatar_url: `${data.publicUrl}?t=${Date.now()}` });
  if (!meta.ok) return { ok: false, error: "Photo enregistrée, mais le profil n’a pas suivi." };
  refresh();
  return { ok: true };
}

export async function changePassword(input: {
  password: string;
  confirm: string;
}): Promise<Result> {
  if (input.password.length < 8) return { ok: false, error: "Au moins 8 caractères." };
  if (input.password !== input.confirm) return { ok: false, error: "Les deux mots de passe diffèrent." };
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: input.password });
  if (error) {
    return {
      ok: false,
      error: error.code === "same_password" ? "C’est déjà ton mot de passe." : "Changement impossible.",
    };
  }
  return { ok: true };
}
