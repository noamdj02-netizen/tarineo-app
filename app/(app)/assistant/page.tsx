import { Suspense } from "react";
import { Chat, type ChatMessage } from "@/components/assistant/chat";
import { PageHead } from "@/components/shell/page-head";
import { isOwner } from "@/lib/billing/plan";
import { getDb } from "@/lib/db";
import { PRESETS } from "@/lib/design-data/assistant";
import { getViewer } from "@/lib/session";

export const metadata = { title: "Assistant IA" };

/** Les 50 derniers messages, du plus ancien au plus récent. */
async function getHistory(): Promise<ChatMessage[]> {
  const db = await getDb();
  if (!db) return [];
  const { data } = await db.supabase
    .from("chat_messages")
    .select("id, role, content")
    .eq("user_id", db.user.id)
    .order("created_at", { ascending: false })
    .limit(50);
  return (data ?? []).reverse();
}

/** Questions prêtes pour les nouveaux comptes (PRESETS cite les projets du créateur). */
const GENERIC_PRESETS = [
  "Quelle est ma priorité cette semaine ?",
  "Écris le prompt Cursor du hero de mon projet en Focus",
  "5 titres de hero pour mon projet en Focus",
  "Quelles ressources pour un site 3D immersif ?",
  "Structure ma landing, frame par frame",
];

export default async function AssistantPage() {
  const [history, viewer, db] = await Promise.all([getHistory(), getViewer(), getDb()]);
  const presets = isOwner(db?.user.email) ? PRESETS : GENERIC_PRESETS;
  return (
    <section className="mx-auto max-w-[820px]">
      <PageHead
        art="notif-nouvelle"
        label="Assistant IA"
        title="Ton copilote"
        tail="qui connaît tes projets."
      >
        Demande-lui un prompt Cursor, un choix de thème ou une section à écrire.
      </PageHead>
      <Suspense>
        <Chat
          initial={history}
          presets={presets}
          keyMissing={!process.env.ANTHROPIC_API_KEY}
          firstName={viewer?.firstName}
        />
      </Suspense>
    </section>
  );
}
