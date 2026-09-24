import { Suspense } from "react";
import { Chat, type ChatMessage } from "@/components/assistant/chat";
import { PageHead } from "@/components/shell/page-head";
import { getDb } from "@/lib/db";
import { PRESETS } from "@/lib/design-data/assistant";

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

export default async function AssistantPage() {
  const history = await getHistory();
  return (
    <section className="mx-auto max-w-[820px]">
      <PageHead art="notif-nouvelle" label="Assistant IA" title="Ton copilote" tail="qui connaît tes projets.">
        Demande-lui un prompt Cursor, un choix de thème ou une section à écrire.
      </PageHead>
      <Suspense>
        <Chat
          initial={history}
          presets={PRESETS}
          keyMissing={!process.env.ANTHROPIC_API_KEY}
        />
      </Suspense>
    </section>
  );
}
