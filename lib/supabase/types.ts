// Types des tables Supabase (voir supabase/migrations).
// À régénérer si le schéma change : npx supabase gen types typescript --project-id <id>

export type ProjectStatus = "focus" | "pause";
export type FeatureStatus = "afaire" | "encours" | "fait" | "verif";
export type ResourceSource = "notion" | "moi" | "curated";

export type ProjectRow = {
  id: string;
  user_id: string;
  slug: string;
  name: string;
  description: string;
  status: ProjectStatus;
  stage: number;
  next: string;
  site: string;
  github: string;
  figma: string;
  notion: string;
  theme: string;
  partner: string;
  pitch: string;
  target: string;
  problem: string;
  business: Record<string, string>;
  stack: string[];
  team: string[];
  risks: string[];
  notes: string;
  sort_order: number;
  updated_at: string;
};

export type FeatureRow = {
  id: string;
  project_id: string;
  title: string;
  status: FeatureStatus;
  position: number;
};

export type TaskRow = {
  id: string;
  project_id: string;
  title: string;
  done: boolean;
  position: number;
};

export type LogRow = {
  id: string;
  project_id: string;
  date: string;
  text: string;
  created_at: string;
};

export type ResourceRow = {
  id: string;
  user_id: string;
  seed_key: string | null;
  name: string;
  url: string;
  category: string;
  tags: string[];
  note: string;
  source: ResourceSource;
  verified: boolean;
  notion_url: string;
  created_at: string;
};

export type ChatMessageRow = {
  id: string;
  user_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
};

type Table<Row, Required extends keyof Row> = {
  Row: Row;
  Insert: Partial<Row> & Pick<Row, Required>;
  Update: Partial<Row>;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      projects: Table<ProjectRow, "slug" | "name">;
      project_features: Table<FeatureRow, "project_id" | "title">;
      project_tasks: Table<TaskRow, "project_id" | "title">;
      project_log: Table<LogRow, "project_id" | "text">;
      resources: Table<ResourceRow, "name">;
      chat_messages: Table<ChatMessageRow, "role" | "content">;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
