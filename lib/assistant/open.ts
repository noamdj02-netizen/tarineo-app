import type { AssistantFile } from "@/lib/assistant/files";

/** Événement qui ouvre le panneau de l'assistant (voir AssistantPanel), avec une question optionnelle. */
export const ASSISTANT_EVENT = "navpit:assistant";

export type AssistantEventDetail = { question?: string; files?: AssistantFile[] };

export function openAssistant(question?: string, files?: AssistantFile[]) {
  window.dispatchEvent(
    new CustomEvent<AssistantEventDetail>(ASSISTANT_EVENT, {
      detail: { question, files },
    }),
  );
}
