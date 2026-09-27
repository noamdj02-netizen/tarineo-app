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

export type AutomationJob = "debrief-focus" | "next-action" | "schema-parcours";

export type Automation = {
  id: string;
  label: string;
  hint: string;
  prompt: string;
  category: AutomationCategory;
  /** Job in-app. Sinon, simple prompt d’analyse. */
  job?: AutomationJob;
};

export const AUTOMATION_CATEGORY_LABELS: Record<AutomationCategory, string> = {
  focus: "Chantier",
  communication: "Documents",
  produit: "Prix",
  design: "Devis",
};

/** Consignes prêtes à lancer dans le copilote. */
export const AUTOMATIONS: Automation[] = [
  {
    id: "debrief-focus",
    label: "Débrief chantier",
    hint: "Note du jour + 3 actions",
    prompt:
      "Fais le débrief du chantier en cours : lis les documents et les notes des 24 h, écris une note « Débrief JJ/MM » et ajoute 3 actions cochables.",
    category: "focus",
    job: "debrief-focus",
  },
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
    label: "Lire un document",
    hint: "Lis ce devis ou cette facture…",
    prompt:
      "Lis le devis ou la facture que je viens de déposer : extraits les lignes, les prix, et signale ce qui a augmenté par rapport à mes derniers achats.",
    category: "focus",
  },
  {
    id: "parcours-client",
    label: "Lignes du document",
    hint: "Extrais les lignes et les prix…",
    prompt:
      "Extrais les lignes (référence, désignation, quantité, prix) du document et attache-les au chantier en cours.",
    category: "produit",
    job: "schema-parcours",
  },
  {
    id: "post-linkedin",
    label: "Prévenir d’une hausse",
    hint: "Préviens d’une hausse de prix…",
    prompt:
      "Rédige un message court pour prévenir mon client d’une hausse de prix détectée sur son chantier. Ton direct, sans emojis.",
    category: "communication",
  },
  {
    id: "prochaine-action",
    label: "Prochaine action",
    hint: "Quelle est ma prochaine action…",
    prompt:
      "À partir du chantier en cours, propose UNE prochaine action concrète pour les 24 prochaines heures, avec pourquoi et comment la valider.",
    category: "focus",
    job: "next-action",
  },
  {
    id: "pitch-30s",
    label: "Pitch 30 secondes",
    hint: "Explique Tarinéo en 30 s…",
    prompt:
      "Écris un pitch oral de 30 secondes pour Tarinéo : hausses de prix, documents par chantier, marge protégée.",
    category: "communication",
  },
  {
    id: "user-stories",
    label: "User stories",
    hint: "Compare ce prix à mon historique…",
    prompt:
      "Compare les prix de ce document à mon historique d’achats : dernier prix payé, écart en € et en %, alerte au-delà de +3 %.",
    category: "produit",
  },
  {
    id: "landing-hero",
    label: "Devis client",
    hint: "Prépare un devis client…",
    prompt:
      "À partir des achats du chantier en cours, prépare un devis client : matériel, main-d’œuvre, total HT.",
    category: "design",
  },
  {
    id: "checklist-lancement",
    label: "Checklist lancement",
    hint: "Checklist avant de chiffrer…",
    prompt:
      "Donne une checklist de 12 points à valider avant d’envoyer le devis client (prix à jour, marge, documents du chantier).",
    category: "focus",
  },
  {
    id: "email-bienvenue",
    label: "Email bienvenue",
    hint: "Relance le client du chantier…",
    prompt:
      "Rédige un email de relance pour le client du chantier en cours : devis envoyé, une action claire, signature courte.",
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
    label: "Alertes",
    description: "Hausses relevées sur tes documents.",
    icon: Shapes,
  },
  {
    href: "/anatomie",
    label: "Classement",
    description: "Tes factures, rangées par mois et par enseigne.",
    icon: Layers,
  },
  {
    href: "/composants",
    label: "Devis client",
    description: "Matériel, main-d’œuvre, PDF à ton logo.",
    icon: Sparkles,
  },
  {
    href: "/projets",
    label: "Chantiers",
    description: "Documents, étape en cours et marge.",
    icon: LayoutDashboard,
  },
  {
    href: "/outils",
    label: "Fournisseurs",
    description: "Achats par enseigne et export comptable.",
    icon: Sparkles,
  },
  {
    href: "/ressources",
    label: "Documents",
    description: "Devis, factures et bons à importer.",
    icon: FileText,
  },
  {
    href: "/audit",
    label: "Comparateur",
    description: "Le meilleur prix entre tes enseignes.",
    icon: Target,
  },
];

export const CATEGORY_ICONS: Record<AutomationCategory, LucideIcon> = {
  focus: Target,
  communication: Mail,
  produit: LayoutDashboard,
  design: Megaphone,
};
