import type { ResourceSource } from "@/lib/supabase/types";

export type Resource = {
  id: string;
  name: string;
  url: string;
  category: string;
  tags: string[];
  note: string;
  source: ResourceSource;
  verified: boolean;
  notion_url: string;
};

/** Tags signalés en orange dans l'original (licence, payant). */
export function isWarnTag(tag: string) {
  return /licence|payant/i.test(tag);
}
