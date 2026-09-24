import type { LucideIcon } from "lucide-react";
import {
  FileText,
  Layers,
  LayoutDashboard,
  Mail,
  Megaphone,
  Shapes,
  Sparkles,
  Target,
} from "lucide-react";

export type AutomationCategory = "focus" | "communication" | "produit" | "design";

export type Automation = {
  id: string;
  label: string;
  hint: string;
  prompt: string;
  category: AutomationCategory;
};

export const AUTOMATION_CATEGORY_LABELS: Record<AutomationCategory, string> = {
  focus: "Focus & plan",
  communication: "Communication",
  produit: "Produit",
  design: "Design",
};

/** Consignes prêtes à lancer dans le copilote. */
export const AUTOMATIONS: Automation[] = [
  {
    id: "mail-relance",
    label: "Rédiger un mail",
    hint: "Rédige un mail de relance…",
    prompt:
      "Rédige un mail court et clair pour relancer mon dernier contact. Propose un objet et un corps prêts à copier.",
    category: "communication",
  },
  {
    id: "resume-fichier",
    label: "Résumer un fichier",
    hint: "Résume ce fichier…",
    prompt:
      "Lis le fichier que je viens de déposer et donne-moi : 3 points clés, les décisions à prendre, les prochaines actions.",
    category: "focus",
  },
  {
    id: "parcours-client",
    label: "Schéma du parcours",
    hint: "Dessine le parcours client…",
    prompt:
      "Propose le parcours client de mon projet en Focus, en 5 étapes, prêt à coller dans un schéma.",
    category: "produit",
  },
  {
    id: "post-linkedin",
    label: "Post LinkedIn",
    hint: "Écris un post LinkedIn…",
    prompt:
      "Écris un post LinkedIn de 8 lignes pour annoncer l’avancement de mon projet en Focus. Ton direct, sans emojis.",
    category: "communication",
  },
  {
    id: "prochaine-action",
    label: "Prochaine action",
    hint: "Quelle est ma prochaine action…",
    prompt:
      "À partir de mon projet en Focus, propose UNE prochaine action concrète pour les 24 prochaines heures, avec pourquoi et comment la valider.",
    category: "focus",
  },
  {
    id: "pitch-30s",
    label: "Pitch 30 secondes",
    hint: "Pitch mon projet en 30 s…",
    prompt:
      "Écris un pitch oral de 30 secondes pour mon projet en Focus : problème, solution, pour qui, preuve d’avancement.",
    category: "communication",
  },
  {
    id: "user-stories",
    label: "User stories",
    hint: "Liste 5 user stories…",
    prompt:
      "Génère 5 user stories au format « En tant que… je veux… afin de… » pour la prochaine fonctionnalité de mon projet en Focus.",
    category: "produit",
  },
  {
    id: "landing-hero",
    label: "Hero landing",
    hint: "Propose un titre hero…",
    prompt:
      "Propose 3 titres hero + un sous-titre pour la landing de mon projet en Focus. Ton sobre, orienté bénéfice client.",
    category: "design",
  },
  {
    id: "checklist-lancement",
    label: "Checklist lancement",
    hint: "Checklist avant lancement…",
    prompt:
      "Donne une checklist de 12 points à valider avant de lancer mon projet en Focus (légal, produit, marketing, technique).",
    category: "focus",
  },
  {
    id: "email-bienvenue",
    label: "Email bienvenue",
    hint: "Email de bienvenue utilisateur…",
    prompt:
      "Rédige un email de bienvenue pour le premier utilisateur de mon SaaS : ton chaleureux, une action claire, signature courte.",
    category: "communication",
  },
];

export const DASHBOARD_AUTOMATION_LIMIT = 4;

/** Raccourcis vers d’autres modules Navpit (hors copilote). */
export type CopilotFeatureLink = {
  href: string;
  label: string;
  description: string;
  icon: LucideIcon;
};

export const COPILOT_FEATURE_LINKS: CopilotFeatureLink[] = [
  {
    href: "/schemas",
    label: "Schémas",
    description: "Parcours, architecture et tunnels en un clic.",
    icon: Shapes,
  },
  {
    href: "/anatomie",
    label: "Anatomie landing",
    description: "Les 12 frames d’une page qui convertit.",
    icon: Layers,
  },
  {
    href: "/projets",
    label: "Projets",
    description: "Focus, étapes et prochaine action.",
    icon: LayoutDashboard,
  },
  {
    href: "/themes",
    label: "Thèmes & pre-landing",
    description: "Palettes et pages d’attente prêtes à copier.",
    icon: Sparkles,
  },
  {
    href: "/ressources",
    label: "Ressources",
    description: "Bibliothèque design et liens utiles.",
    icon: FileText,
  },
  {
    href: "/audit",
    label: "Mes sites",
    description: "Audite tes URLs et repère les quick wins.",
    icon: Target,
  },
];

export const CATEGORY_ICONS: Record<AutomationCategory, LucideIcon> = {
  focus: Target,
  communication: Mail,
  produit: LayoutDashboard,
  design: Megaphone,
};
