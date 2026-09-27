// Types des tables Supabase (voir supabase/migrations).
// À régénérer si le schéma change : npx supabase gen types typescript --project-id <id>

export type ProjectStatus = "focus" | "pause" | "fini";
export type FeatureStatus = "afaire" | "encours" | "fait" | "verif";
export type ResourceSource = "notion" | "moi" | "curated";

export type NextPriority = "faible" | "normale" | "elevee";

export type ProjectRow = {
  id: string;
  user_id: string;
  slug: string;
  name: string;
  description: string;
  status: ProjectStatus;
  stage: number;
  next: string;
  next_due_date: string | null;
  next_priority: NextPriority | null;
  next_estimated_minutes: number | null;
  blocked: boolean;
  blocker_reason: string;
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
  audit_frames?: string[];
  audit_critique?: Record<string, unknown>;
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
  notes: string;
  due_date: string | null;
};

export type ApiKeyRow = {
  id: string;
  user_id: string;
  name: string;
  prefix: string;
  hash: string;
  scopes: string[];
  last_used_at: string | null;
  revoked_at: string | null;
  created_at: string;
};

export type ToolConnectionRow = {
  user_id: string;
  tool_id: string;
  connected_at: string;
  account_label?: string;
  bind_kind?: string;
  config?: Record<string, unknown>;
};

export type ProjectNoteRow = {
  id: string;
  user_id: string;
  project_id: string;
  title: string;
  content: string;
  source: string | null;
  created_at: string;
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

export type AgentRole = "general" | "tech" | "produit" | "design" | "launch";

export type ChatMessageRow = {
  id: string;
  user_id: string;
  role: "user" | "assistant";
  content: string;
  project_id: string | null;
  agent_role: AgentRole;
  created_at: string;
};

export type ProjectAssetRow = {
  id: string;
  user_id: string;
  project_id: string;
  kind: "component" | "landing";
  title: string;
  html: string;
  theme_id: string | null;
  created_at: string;
};

export type SchemaKind =
  | "libre"
  | "architecture"
  | "parcours"
  | "tunnel"
  | "roadmap"
  | "donnees"
  | "formation"
  | "offre";

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

export type HeroLibraryRow = {
  id: string;
  slug: string;
  nom: string;
  categorie: string;
  tags: string[];
  niveau: string;
  stack: string[];
  apercu_video_url: string | null;
  apercu_poster_url: string | null;
  prompt_template: string;
  variables: unknown;
  code_reference: string;
  acces: "gratuit" | "pro";
  created_at: string;
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
      api_keys: Table<ApiKeyRow, "user_id" | "name" | "prefix" | "hash">;
      project_notes: Table<ProjectNoteRow, "user_id" | "project_id" | "title" | "content">;
      project_log: Table<LogRow, "project_id" | "text">;
      resources: Table<ResourceRow, "name">;
      chat_messages: Table<ChatMessageRow, "role" | "content">;
      project_assets: Table<ProjectAssetRow, "user_id" | "project_id" | "title">;
      project_schemas: Table<SchemaRow, never>;
      calendar_events: Table<CalendarEventRow, "title" | "starts_at">;
      calendar_feeds: Table<CalendarFeedRow, "url">;
      subscriptions: Table<SubscriptionRow, "user_id">;
      analytics_events: Table<AnalyticsEventRow, "name" | "session_id">;
      user_dashboard: Table<
        { user_id: string; layout: Record<string, unknown>; updated_at: string },
        "user_id"
      >;
      tool_connections: Table<ToolConnectionRow, "user_id" | "tool_id">;
      hero_library: Table<HeroLibraryRow, "slug" | "nom">;
      parties: Table<
        {
          id: string;
          user_id: string;
          kind: "client" | "fournisseur" | "distributeur" | "atelier";
          name: string;
          address: string;
          seed_key: string | null;
          created_at: string;
        },
        "kind" | "name"
      >;
      chantiers: Table<
        {
          id: string;
          user_id: string;
          slug: string;
          name: string;
          address: string;
          client_id: string | null;
          project_id: string | null;
          status: "focus" | "pause" | "fini";
          seed_key: string | null;
          created_at: string;
          updated_at: string;
        },
        "slug" | "name"
      >;
      products: Table<
        {
          id: string;
          user_id: string;
          name: string;
          family: string;
          unit: string;
          seed_key: string | null;
        },
        "name"
      >;
      documents: Table<
        {
          id: string;
          user_id: string;
          direction: "in" | "out";
          kind: "devis" | "facture" | "bon_commande" | "bl" | "bon_enlevement" | "autre";
          title: string;
          party_id: string | null;
          chantier_id: string | null;
          source_document_id: string | null;
          file_path: string;
          extract: Record<string, unknown>;
          status: "uploading" | "reading" | "ready" | "error";
          error: string;
          seed_key: string | null;
          created_at: string;
        },
        "direction" | "kind"
      >;
      document_lines: Table<
        {
          id: string;
          user_id: string;
          document_id: string;
          product_id: string | null;
          supplier_party_id: string | null;
          distributor_party_id: string | null;
          label: string;
          qty: number;
          unit: string;
          buy_price: number;
          sell_price: number;
          position: number;
        },
        "document_id" | "label"
      >;
      company_profiles: Table<
        {
          user_id: string;
          raison_sociale: string;
          siret: string;
          forme_juridique: string;
          adresse_rue: string;
          adresse_code_postal: string;
          adresse_ville: string;
          telephone: string;
          email_contact: string;
          regime_tva: "NORMAL" | "FRANCHISE_293B";
          registre_immatriculation: string;
          assurance_nom: string;
          assurance_adresse: string;
          assurance_numero_contrat: string;
          assurance_activites_garanties: string;
          assurance_zone_geographique: string;
          logo_path: string;
          marge_par_defaut_pct: number;
          updated_at: string;
        },
        "user_id"
      >;
      price_alerts: Table<
        {
          id: string;
          user_id: string;
          product_id: string | null;
          document_id: string | null;
          chantier_id: string | null;
          label: string;
          old_price: number;
          new_price: number;
          created_at: string;
          seed_key: string | null;
        },
        "label" | "old_price" | "new_price"
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
