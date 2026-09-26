// Types des tables Supabase (voir supabase/migrations).
// À régénérer si le schéma change : npx supabase gen types typescript --project-id <id>

export type ProjectStatus = "focus" | "pause" | "fini";
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

export type SchemaKind = "libre" | "architecture" | "parcours" | "tunnel" | "roadmap" | "donnees";

export type SchemaRow = {
  id: string;
  user_id: string;
  project_id: string | null;
  title: string;
  kind: SchemaKind;
  /** files = images du tableau (data URL), seulement celles encore utilisées */
  scene: { elements: unknown[]; appState: Record<string, unknown>; files?: Record<string, unknown> };
  created_at: string;
  updated_at: string;
};

export type CalendarEventRow = {
  id: string;
  user_id: string;
  project_id: string | null;
  title: string;
  starts_at: string;
  ends_at: string | null;
  all_day: boolean;
  created_at: string;
};

export type CalendarFeedRow = {
  user_id: string;
  url: string;
  updated_at: string;
};

export type AnalyticsEventRow = {
  id: string;
  name: string;
  user_id: string | null;
  session_id: string;
  feature: string;
  project_id: string | null;
  plan: string;
  path: string;
  properties: Record<string, unknown>;
  duration_ms: number | null;
  created_at: string;
};

export type SubscriptionRow = {
  user_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  plan: "free" | "starter" | "pro" | "founder";
  status: string;
  billing_interval: "month" | "year" | null;
  tier: number;
  started_at: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  updated_at: string;
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
      project_schemas: Table<SchemaRow, never>;
      calendar_events: Table<CalendarEventRow, "title" | "starts_at">;
      calendar_feeds: Table<CalendarFeedRow, "url">;
      subscriptions: Table<SubscriptionRow, "user_id">;
      analytics_events: Table<AnalyticsEventRow, "name" | "session_id">;
      user_dashboard: Table<
        { user_id: string; layout: Record<string, unknown>; updated_at: string },
        "user_id"
      >;
    };
    Views: Record<string, never>;
    Functions: {
      founder_seats_taken: { Args: Record<string, never>; Returns: number };
      start_pro_trial: { Args: Record<string, never>; Returns: undefined };
      enforce_pro_trial_expiry: { Args: Record<string, never>; Returns: undefined };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
