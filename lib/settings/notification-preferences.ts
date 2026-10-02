/**
 * Préférences de notification — personnelles (user_id).
 * Ne jamais mélanger avec les settings entreprise.
 */

export type ChannelPair = { email: boolean; inApp: boolean };

export type NotificationEventKey =
  | "quote_generated"
  | "quote_sent"
  | "quote_accepted"
  | "quote_refused"
  | "invoice_created"
  | "invoice_overdue"
  | "supplier_increase"
  | "supplier_increase_major"
  | "supplier_watched"
  | "followup_due"
  | "followup_late"
  | "followup_sent"
  | "copilot_confirm"
  | "copilot_suggestion"
  | "copilot_review"
  | "project_document"
  | "project_deadline"
  | "project_activity"
  | "project_block";

export type NotificationPreferences = {
  emailQuotes: boolean;
  emailInvoices: boolean;
  emailSupplierIncreases: boolean;
  emailFollowups: boolean;
  emailCopilot: boolean;
  emailProjects: boolean;
  inAppQuotes: boolean;
  inAppInvoices: boolean;
  inAppSupplierIncreases: boolean;
  inAppFollowups: boolean;
  inAppCopilot: boolean;
  inAppProjects: boolean;
  pushQuotes: boolean;
  pushInvoices: boolean;
  pushSupplierIncreases: boolean;
  pushFollowups: boolean;
  pushCopilot: boolean;
  pushProjects: boolean;
  /** Consentement push navigateur enregistré côté app. */
  pushEnabled: boolean;
  /** Sous-événements : canal email / in-app. Absents = héritent de la catégorie. */
  events: Partial<Record<NotificationEventKey, ChannelPair>>;
  supplierThresholdPct: number;
  /** Résumé quotidien non envoyé tant qu’aucun cron n’existe — stocké mais UI honnête. */
  dailySummaryEnabled: boolean;
  dailySummaryTime: string;
};

export const DEFAULT_NOTIFICATION_PREFS: NotificationPreferences = {
  emailQuotes: true,
  emailInvoices: true,
  emailSupplierIncreases: true,
  emailFollowups: true,
  emailCopilot: true,
  emailProjects: true,
  inAppQuotes: true,
  inAppInvoices: true,
  inAppSupplierIncreases: true,
  inAppFollowups: true,
  inAppCopilot: true,
  inAppProjects: true,
  pushQuotes: true,
  pushInvoices: true,
  pushSupplierIncreases: true,
  pushFollowups: true,
  pushCopilot: true,
  pushProjects: true,
  pushEnabled: false,
  events: {},
  supplierThresholdPct: 5,
  dailySummaryEnabled: false,
  dailySummaryTime: "08:00",
};

export const QUOTE_EVENTS: { key: NotificationEventKey; label: string }[] = [
  { key: "quote_generated", label: "Nouveau devis généré" },
  { key: "quote_sent", label: "Devis envoyé" },
  { key: "quote_accepted", label: "Devis accepté" },
  { key: "quote_refused", label: "Devis refusé" },
  { key: "invoice_created", label: "Facture créée" },
  { key: "invoice_overdue", label: "Facture en retard" },
];

export const SUPPLIER_EVENTS: { key: NotificationEventKey; label: string }[] = [
  { key: "supplier_increase", label: "Nouvelle hausse détectée" },
  { key: "supplier_increase_major", label: "Hausse importante" },
  { key: "supplier_watched", label: "Variation sur un article suivi" },
];

export const FOLLOWUP_EVENTS: { key: NotificationEventKey; label: string }[] = [
  { key: "followup_due", label: "Relance client à effectuer" },
  { key: "followup_late", label: "Relance en retard" },
  { key: "followup_sent", label: "Relance envoyée" },
];

export const COPILOT_EVENTS: { key: NotificationEventKey; label: string }[] = [
  { key: "copilot_confirm", label: "Action nécessitant ma confirmation" },
  { key: "copilot_suggestion", label: "Nouvelle recommandation" },
  { key: "copilot_review", label: "Document nécessitant une vérification" },
];

export const PROJECT_EVENTS: { key: NotificationEventKey; label: string }[] = [
  { key: "project_document", label: "Nouveau document" },
  { key: "project_deadline", label: "Échéance proche" },
  { key: "project_activity", label: "Activité importante" },
  { key: "project_block", label: "Blocage détecté" },
];

function bool(v: unknown, fallback: boolean) {
  return typeof v === "boolean" ? v : fallback;
}

function num(v: unknown, fallback: number) {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export function parseNotificationPreferences(raw: unknown): NotificationPreferences {
  const d = DEFAULT_NOTIFICATION_PREFS;
  if (!raw || typeof raw !== "object") return { ...d, events: {} };
  const o = raw as Record<string, unknown>;
  const eventsRaw = o.event_prefs ?? o.events;
  const events: NotificationPreferences["events"] = {};
  if (eventsRaw && typeof eventsRaw === "object") {
    for (const [k, v] of Object.entries(eventsRaw as Record<string, unknown>)) {
      if (!v || typeof v !== "object") continue;
      const e = v as Record<string, unknown>;
      events[k as NotificationEventKey] = {
        email: bool(e.email, true),
        inApp: bool(e.inApp ?? e.in_app, true),
      };
    }
  }
  return {
    emailQuotes: bool(o.email_quotes ?? o.emailQuotes, d.emailQuotes),
    emailInvoices: bool(o.email_invoices ?? o.emailInvoices, d.emailInvoices),
    emailSupplierIncreases: bool(
      o.email_supplier_increases ?? o.emailSupplierIncreases,
      d.emailSupplierIncreases,
    ),
    emailFollowups: bool(o.email_followups ?? o.emailFollowups, d.emailFollowups),
    emailCopilot: bool(o.email_copilot ?? o.emailCopilot, d.emailCopilot),
    emailProjects: bool(o.email_projects ?? o.emailProjects, d.emailProjects),
    inAppQuotes: bool(o.in_app_quotes ?? o.inAppQuotes, d.inAppQuotes),
    inAppInvoices: bool(o.in_app_invoices ?? o.inAppInvoices, d.inAppInvoices),
    inAppSupplierIncreases: bool(
      o.in_app_supplier_increases ?? o.inAppSupplierIncreases,
      d.inAppSupplierIncreases,
    ),
    inAppFollowups: bool(o.in_app_followups ?? o.inAppFollowups, d.inAppFollowups),
    inAppCopilot: bool(o.in_app_copilot ?? o.inAppCopilot, d.inAppCopilot),
    inAppProjects: bool(o.in_app_projects ?? o.inAppProjects, d.inAppProjects),
    pushQuotes: bool(o.push_quotes ?? o.pushQuotes, d.pushQuotes),
    pushInvoices: bool(o.push_invoices ?? o.pushInvoices, d.pushInvoices),
    pushSupplierIncreases: bool(
      o.push_supplier_increases ?? o.pushSupplierIncreases,
      d.pushSupplierIncreases,
    ),
    pushFollowups: bool(o.push_followups ?? o.pushFollowups, d.pushFollowups),
    pushCopilot: bool(o.push_copilot ?? o.pushCopilot, d.pushCopilot),
    pushProjects: bool(o.push_projects ?? o.pushProjects, d.pushProjects),
    pushEnabled: bool(o.push_enabled ?? o.pushEnabled, d.pushEnabled),
    events,
    supplierThresholdPct: Math.min(100, Math.max(0, num(o.supplier_threshold_pct ?? o.supplierThresholdPct, d.supplierThresholdPct))),
    dailySummaryEnabled: bool(o.daily_summary_enabled ?? o.dailySummaryEnabled, d.dailySummaryEnabled),
    dailySummaryTime:
      typeof (o.daily_summary_time ?? o.dailySummaryTime) === "string"
        ? String(o.daily_summary_time ?? o.dailySummaryTime).slice(0, 5)
        : d.dailySummaryTime,
  };
}

export function preferencesToRow(prefs: NotificationPreferences) {
  return {
    email_quotes: prefs.emailQuotes,
    email_invoices: prefs.emailInvoices,
    email_supplier_increases: prefs.emailSupplierIncreases,
    email_followups: prefs.emailFollowups,
    email_copilot: prefs.emailCopilot,
    email_projects: prefs.emailProjects,
    in_app_quotes: prefs.inAppQuotes,
    in_app_invoices: prefs.inAppInvoices,
    in_app_supplier_increases: prefs.inAppSupplierIncreases,
    in_app_followups: prefs.inAppFollowups,
    in_app_copilot: prefs.inAppCopilot,
    in_app_projects: prefs.inAppProjects,
    push_quotes: prefs.pushQuotes,
    push_invoices: prefs.pushInvoices,
    push_supplier_increases: prefs.pushSupplierIncreases,
    push_followups: prefs.pushFollowups,
    push_copilot: prefs.pushCopilot,
    push_projects: prefs.pushProjects,
    push_enabled: prefs.pushEnabled,
    event_prefs: prefs.events,
    supplier_threshold_pct: prefs.supplierThresholdPct,
    daily_summary_enabled: prefs.dailySummaryEnabled,
    daily_summary_time: prefs.dailySummaryTime,
    updated_at: new Date().toISOString(),
  };
}
