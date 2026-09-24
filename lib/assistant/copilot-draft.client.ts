"use client";

/** Même forme que `AssistantFile`, sans importer `files.ts` (évite les soucis HMR Turbopack). */
export type CopilotDraftFile = {
  name: string;
  mime: string;
  size: number;
  data: string;
};

export type CopilotDraft = {
  question: string;
  files?: CopilotDraftFile[];
};

const KEY = "navpit:copilot-draft";

export function stashCopilotDraft(draft: CopilotDraft) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(KEY, JSON.stringify(draft));
  } catch {
    // quota dépassé : la question peut passer dans l’URL
  }
}

export function consumeCopilotDraft(): CopilotDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    sessionStorage.removeItem(KEY);
    const parsed = JSON.parse(raw) as CopilotDraft;
    if (!parsed?.question?.trim() && !parsed?.files?.length) return null;
    return parsed;
  } catch {
    return null;
  }
}
