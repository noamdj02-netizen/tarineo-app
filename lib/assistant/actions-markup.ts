export type CopilotAction = {
  kind: "project" | "task" | "note" | "schema" | "component" | "landing" | "email";
  label: string;
  href: string;
};

export function encodeActions(actions: CopilotAction[]) {
  if (!actions.length) return "";
  return `\n\n<!--navpit-actions:${JSON.stringify(actions)}-->`;
}

export function parseActions(text: string): { body: string; actions: CopilotAction[] } {
  const m = text.match(/<!--navpit-actions:(\[[\s\S]*?\])-->/);
  if (!m) return { body: text, actions: [] };
  try {
    const actions = JSON.parse(m[1]) as CopilotAction[];
    return { body: text.replace(m[0], "").trim(), actions: Array.isArray(actions) ? actions : [] };
  } catch {
    return { body: text, actions: [] };
  }
}
