export type AdminNavItem = { href: string; label: string };

export const ADMIN_NAV: { id: string; label: string; items: AdminNavItem[] }[] = [
  {
    id: "overview",
    label: "Overview",
    items: [{ href: "/admin/overview", label: "Vue générale" }],
  },
  {
    id: "users",
    label: "Users",
    items: [
      { href: "/admin/users", label: "Utilisateurs" },
      { href: "/admin/cohorts", label: "Cohortes" },
      { href: "/admin/sessions", label: "Sessions" },
    ],
  },
  {
    id: "product",
    label: "Product",
    items: [
      { href: "/admin/engagement", label: "Engagement" },
      { href: "/admin/features", label: "Features" },
      { href: "/admin/journeys", label: "Parcours" },
      { href: "/admin/funnel", label: "Funnel" },
    ],
  },
  {
    id: "ai",
    label: "AI",
    items: [
      { href: "/admin/ai", label: "Copilote" },
      { href: "/admin/agents", label: "Agents" },
      { href: "/admin/ai/performance", label: "Performance IA" },
      { href: "/admin/ai/costs", label: "Coûts IA" },
    ],
  },
  {
    id: "business",
    label: "Business",
    items: [
      { href: "/admin/conversion", label: "Conversion" },
      { href: "/admin/subscriptions", label: "Abonnements" },
      { href: "/admin/mrr", label: "MRR" },
      { href: "/admin/churn", label: "Churn" },
    ],
  },
  {
    id: "feedback",
    label: "Feedback",
    items: [
      { href: "/admin/feedback", label: "Retours" },
      { href: "/admin/exits", label: "Raisons de départ" },
      { href: "/admin/errors", label: "Bugs / erreurs" },
    ],
  },
  {
    id: "system",
    label: "System",
    items: [
      { href: "/admin/events", label: "Événements" },
      { href: "/admin/logs", label: "Logs" },
      { href: "/admin/tracking", label: "Tracking" },
    ],
  },
];
