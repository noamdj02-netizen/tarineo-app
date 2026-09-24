import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export type OnboardingStep = { label: string; href: string; done: boolean };

/** Les 5 étapes de démarrage, calculées depuis les vraies données de l'utilisateur. */
export async function getOnboarding(): Promise<OnboardingStep[]> {
  const counts = { projects: 0, focus: 0, resources: 0, chats: 0 };

  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const head = { count: "exact" as const, head: true };
    const [projects, focus, resources, chats] = await Promise.all([
      supabase.from("projects").select("id", head),
      supabase.from("projects").select("id", head).eq("status", "focus"),
      supabase.from("resources").select("id", head).in("source", ["moi", "notion"]),
      supabase.from("chat_messages").select("id", head).eq("role", "user"),
    ]);
    counts.projects = projects.count ?? 0;
    counts.focus = focus.count ?? 0;
    counts.resources = resources.count ?? 0;
    counts.chats = chats.count ?? 0;
  }

  return [
    { label: "Créer ton compte", href: "/accueil", done: isSupabaseConfigured() },
    { label: "Ajouter un projet", href: "/projets", done: counts.projects > 0 },
    { label: "Mettre un projet en Focus", href: "/projets", done: counts.focus > 0 },
    { label: "Sauver une ressource", href: "/ressources", done: counts.resources > 0 },
    { label: "Poser une question au copilote", href: "/assistant", done: counts.chats > 0 },
  ];
}
