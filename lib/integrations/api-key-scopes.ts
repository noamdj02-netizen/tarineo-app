import type { Scope } from "@/lib/mcp/types";

export function hasApiScope(scopes: Scope[], required: Scope): boolean {
  return scopes.includes(required);
}
