/**
 * Rôles workspace TARINEO.
 * Aujourd’hui chaque compte = admin de son entreprise (RLS user_id).
 * La matrice prépare l’équipe multi-utilisateurs sans fake UX.
 */
export type WorkspaceRole = "admin" | "chef_chantier" | "comptable";

export type SettingsSectionId =
  | "entreprise"
  | "equipe"
  | "documents"
  | "tarification"
  | "ia"
  | "notifications"
  | "integrations"
  | "abonnement"
  | "compte"
  | "securite";

/** Permissions par section : view | edit */
export type SectionAccess = "none" | "view" | "edit";

const MATRIX: Record<WorkspaceRole, Record<SettingsSectionId, SectionAccess>> = {
  admin: {
    entreprise: "edit",
    equipe: "edit",
    documents: "edit",
    tarification: "edit",
    ia: "edit",
    notifications: "edit",
    integrations: "edit",
    abonnement: "edit",
    compte: "edit",
    securite: "edit",
  },
  chef_chantier: {
    entreprise: "view",
    equipe: "none",
    documents: "view",
    tarification: "view",
    ia: "view",
    notifications: "edit",
    integrations: "none",
    abonnement: "none",
    compte: "edit",
    securite: "edit",
  },
  comptable: {
    entreprise: "view",
    equipe: "none",
    documents: "edit",
    tarification: "view",
    ia: "view",
    notifications: "edit",
    integrations: "none",
    abonnement: "none",
    compte: "edit",
    securite: "edit",
  },
};

export function sectionAccess(role: WorkspaceRole, section: SettingsSectionId): SectionAccess {
  return MATRIX[role][section];
}

export function canViewSection(role: WorkspaceRole, section: SettingsSectionId) {
  return sectionAccess(role, section) !== "none";
}

export function canEditSection(role: WorkspaceRole, section: SettingsSectionId) {
  return sectionAccess(role, section) === "edit";
}

/**
 * Rôle effectif du compte courant.
 * Solo = admin. Owner studio = admin. Équipe multi-users : à brancher plus tard.
 */
export function resolveWorkspaceRole(_opts?: { isOwner?: boolean }): WorkspaceRole {
  void _opts;
  return "admin";
}

export const ROLE_LABEL: Record<WorkspaceRole, string> = {
  admin: "Dirigeant / Admin",
  chef_chantier: "Chef de chantier",
  comptable: "Comptable",
};
