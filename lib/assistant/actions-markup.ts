export type CopilotAction = {
  kind: "project" | "task" | "note" | "schema" | "component" | "landing" | "email" | "studio" | "piece" | "chantier" | "confirm";
  label: string;
  href?: string;
  actionId?: string;
};

export function encodeActions(actions: CopilotAction[]) {
  if (!actions.length) return "";
  return `\n\n<!--tarineo-actions:${JSON.stringify(actions)}-->`;
}

export function parseActions(text: string): { body: string; actions: CopilotAction[] } {
  const m = text.match(/<!--(?:tarineo|navpit)-actions:(\[[\s\S]*?\])-->/);
  if (!m) return { body: text, actions: [] };
  try {
    const actions = JSON.parse(m[1]) as CopilotAction[];
    return { body: text.replace(m[0], "").trim(), actions: Array.isArray(actions) ? actions : [] };
  } catch {
    return { body: text, actions: [] };
  }
}
