/**
 * Source de vérité : modèles système de devis.
 * Disponibles pour tous les utilisateurs — pas de user_id, pas de table Supabase.
 */
import type { DevisDraft, DevisLine } from "@/lib/metier/devis/types";

export type SystemDevisTemplateType = "blank" | "structured";

export type SystemDevisTemplateLine = {
  description: string;
  quantity: number;
  unit: string;
  /** Toujours 0 sauf si le modèle possède un prix réel (jamais inventé). */
  unitPriceHT: number;
  vatRate: number;
};

export type SystemDevisTemplate = {
  id: "blank" | "plumbing" | "electrical" | "earthworks";
  title: string;
  description: string;
  type: SystemDevisTemplateType;
  lines: SystemDevisTemplateLine[];
};

/** @deprecated Utiliser getSystemTemplates() — alias rétrocompatible. */
export type DevisTemplate = {
  id: string;
  title: string;
  text: string;
  lines: { label: string; qty: number; unit: string; sell: number }[];
};

const SYSTEM_TEMPLATES: SystemDevisTemplate[] = [
  {
    id: "blank",
    title: "Devis vide",
    description: "Titre + client, vous ajoutez les lignes.",
    type: "blank",
    lines: [],
  },
  {
    id: "plumbing",
    title: "Plomberie / sanitaire",
    description: "Fourniture et pose, à ajuster.",
    type: "structured",
    lines: [
      { description: "Fourniture plomberie", quantity: 1, unit: "forfait", unitPriceHT: 0, vatRate: 20 },
      { description: "Pose plomberie", quantity: 1, unit: "forfait", unitPriceHT: 0, vatRate: 20 },
    ],
  },
  {
    id: "electrical",
    title: "Électricité",
    description: "Tableau, prises, éclairage.",
    type: "structured",
    lines: [
      { description: "Tableau électrique", quantity: 1, unit: "forfait", unitPriceHT: 0, vatRate: 20 },
      { description: "Prises électriques", quantity: 1, unit: "forfait", unitPriceHT: 0, vatRate: 20 },
      { description: "Éclairage", quantity: 1, unit: "forfait", unitPriceHT: 0, vatRate: 20 },
    ],
  },
  {
    id: "earthworks",
    title: "Terrassement / TP",
    description: "Forfait chantier type.",
    type: "structured",
    lines: [
      { description: "Terrassement", quantity: 1, unit: "forfait", unitPriceHT: 0, vatRate: 20 },
      { description: "Évacuation des terres", quantity: 1, unit: "forfait", unitPriceHT: 0, vatRate: 20 },
    ],
  },
];

/** Modèles système — même liste pour tous les comptes. */
export function getSystemTemplates(): SystemDevisTemplate[] {
  return SYSTEM_TEMPLATES.map((t) => ({
    ...t,
    lines: t.lines.map((l) => ({ ...l })),
  }));
}

export function getSystemTemplate(id: string): SystemDevisTemplate | null {
  return getSystemTemplates().find((t) => t.id === id) ?? null;
}

function lineToDraft(l: SystemDevisTemplateLine): DevisLine {
  const missing = l.unitPriceHT <= 0 ? ["prix"] : undefined;
  return {
    description: l.description,
    quantity: l.quantity,
    unit: l.unit,
    unitPriceHT: l.unitPriceHT,
    vatRate: l.vatRate,
    missing,
  };
}

/** Construit un DevisDraft depuis un modèle système + sélection client/chantier. */
export function draftFromSystemTemplate(
  template: SystemDevisTemplate,
  opts: {
    clientId?: string | null;
    clientName?: string | null;
    chantierId?: string | null;
    chantierName?: string | null;
    idempotencyKey?: string;
  } = {},
): DevisDraft {
  const clientName = opts.clientName?.trim() || "Client";
  return {
    client: {
      id: opts.clientId ?? null,
      name: clientName,
    },
    chantier:
      opts.chantierId || opts.chantierName
        ? { id: opts.chantierId ?? null, name: opts.chantierName ?? null }
        : undefined,
    lines: template.lines.map(lineToDraft),
    source: template.type === "blank" ? "manual" : "template",
    title: template.type === "blank" ? "Devis" : `Devis — ${template.title}`,
    vatMode: "standard",
    validityDays: 30,
    idempotencyKey: opts.idempotencyKey,
    warnings:
      template.lines.some((l) => l.unitPriceHT <= 0)
        ? ["Prix à renseigner sur une ou plusieurs lignes."]
        : undefined,
  };
}

/** Alias UI rétrocompatible (id / text / sell). */
export const DEVIS_TEMPLATES: DevisTemplate[] = getSystemTemplates().map((t) => ({
  id: t.id,
  title: t.title,
  text: t.description,
  lines: t.lines.map((l) => ({
    label: l.description,
    qty: l.quantity,
    unit: l.unit,
    sell: l.unitPriceHT,
  })),
}));
