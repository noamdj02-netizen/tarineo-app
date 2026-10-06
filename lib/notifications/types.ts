export type NotificationType =
  | "client_followup"
  | "supplier_price_increase"
  | "invoice_anomaly"
  | "quote_ready"
  | "quote_to_send"
  | "document_analyzed"
  | "site_activity"
  | "ai_alert"
  | "payment_alert"
  | "margin_below_target"
  | "system";

export type NotificationPriority = "critical" | "high" | "normal" | "low";

export type AppNotification = {
  id: string;
  userId: string;
  organizationId: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  read: boolean;
  archived: boolean;
  createdAt: string;
  readAt: string | null;
  actionUrl: string;
  entityType: string;
  entityId: string;
  metadata: Record<string, unknown>;
  idempotencyKey: string;
};

export type CreateNotificationInput = {
  type: NotificationType;
  title: string;
  message: string;
  priority?: NotificationPriority;
  actionUrl?: string;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  /** Clé unique anti-spam par utilisateur. */
  idempotencyKey: string;
  /** Canal préférences : quotes | invoices | supplier | followups | copilot | projects */
  preferenceChannel?: "quotes" | "invoices" | "supplier" | "followups" | "copilot" | "projects";
};

export const NOTIFICATION_TYPE_LABEL: Record<NotificationType, string> = {
  client_followup: "Relance client",
  supplier_price_increase: "Hausse fournisseur",
  invoice_anomaly: "Anomalie facture",
  quote_ready: "Devis prêt",
  quote_to_send: "Devis à envoyer",
  document_analyzed: "Analyse terminée",
  site_activity: "Chantier",
  ai_alert: "IA",
  payment_alert: "Paiement",
  margin_below_target: "Marge sous seuil",
  system: "Système",
};

export function priorityDot(p: NotificationPriority) {
  switch (p) {
    case "critical":
      return "bg-tarineo-orange";
    case "high":
      return "bg-tarineo-orange";
    case "normal":
      return "bg-[#16A34A]";
    case "low":
      return "bg-muted-foreground/40";
  }
}
