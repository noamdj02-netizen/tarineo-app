/** Événement qui ouvre le panneau de l'assistant (voir AssistantPanel), avec une question optionnelle. */
export const ASSISTANT_EVENT = "navpit:assistant";

export type AssistantEventDetail = { question?: string };

export function openAssistant(question?: string) {
  window.dispatchEvent(
    new CustomEvent<AssistantEventDetail>(ASSISTANT_EVENT, { detail: { question } }),
  );
}
