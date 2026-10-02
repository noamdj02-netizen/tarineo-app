import type { LucideIcon } from "lucide-react";
import {
  Bell,
  Building2,
  CreditCard,
  FileText,
  Lock,
  Plug,
  Sparkles,
  UserRound,
  Users,
  Wallet,
} from "lucide-react";
import type { SettingsSectionId } from "@/lib/settings/roles";

export type SettingsNavItem = {
  id: SettingsSectionId;
  href: string;
  label: string;
  short: string;
  description: string;
  icon: LucideIcon;
  /** Entreprise = partagé ; utilisateur = préférences perso */
  scope: "entreprise" | "utilisateur";
};

export const SETTINGS_NAV: SettingsNavItem[] = [
  {
    id: "entreprise",
    href: "/parametres/entreprise",
    label: "Entreprise",
    short: "Entreprise",
    description: "Identité légale, SIRET, logo, coordonnées PDF",
    icon: Building2,
    scope: "entreprise",
  },
  {
    id: "equipe",
    href: "/parametres/equipe",
    label: "Équipe",
    short: "Équipe",
    description: "Membres, invitations et rôles",
    icon: Users,
    scope: "entreprise",
  },
  {
    id: "documents",
    href: "/parametres/documents",
    label: "Documents",
    short: "Documents",
    description: "Modèles, PDF, numérotation, mentions",
    icon: FileText,
    scope: "entreprise",
  },
  {
    id: "tarification",
    href: "/parametres/tarification",
    label: "Tarification",
    short: "Tarifs",
    description: "Marges, coefficients, TVA, taux horaires",
    icon: Wallet,
    scope: "entreprise",
  },
  {
    id: "ia",
    href: "/parametres/ia",
    label: "IA & Copilote",
    short: "IA",
    description: "Analyse IA (import), hausses, Copilote chat",
    icon: Sparkles,
    scope: "entreprise",
  },
  {
    id: "notifications",
    href: "/parametres/notifications",
    label: "Notifications",
    short: "Alertes",
    description: "Emails, relances, hausses, Copilote",
    icon: Bell,
    scope: "utilisateur",
  },
  {
    id: "integrations",
    href: "/parametres/integrations",
    label: "Intégrations",
    short: "Connecteurs",
    description: "Google, compta, fournisseurs — bientôt",
    icon: Plug,
    scope: "entreprise",
  },
  {
    id: "abonnement",
    href: "/parametres/abonnement",
    label: "Abonnement",
    short: "Offre",
    description: "Formule, utilisation, facturation",
    icon: CreditCard,
    scope: "entreprise",
  },
  {
    id: "compte",
    href: "/parametres/compte",
    label: "Mon compte",
    short: "Compte",
    description: "Nom, email, thème, langue",
    icon: UserRound,
    scope: "utilisateur",
  },
  {
    id: "securite",
    href: "/parametres/securite",
    label: "Sécurité",
    short: "Sécurité",
    description: "Mot de passe, sessions, compte",
    icon: Lock,
    scope: "utilisateur",
  },
];

export function settingsItem(id: SettingsSectionId) {
  return SETTINGS_NAV.find((i) => i.id === id)!;
}
