import type { AssistantFile } from "@/lib/assistant/files";

/** Événement qui ouvre le panneau de l'assistant (voir AssistantPanel), avec une question optionnelle. */
export const ASSISTANT_EVENT = "navpit:assistant";

export type AssistantEventDetail = {
  question?: string;
  files?: AssistantFile[];
  /** Projet ciblé (carte / fiche) — charge l’historique et le contexte associés. */
  projectId?: string | null;
};

export function openAssistant(
  question?: string,
  files?: AssistantFile[],
  projectId?: string | null,
) {
  window.dispatchEvent(
    new CustomEvent<AssistantEventDetail>(ASSISTANT_EVENT, {
      detail: { question, files, projectId: projectId ?? null },
    }),
  );
}
