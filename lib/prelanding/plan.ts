import { SECTION_LABELS, type PreLandingTemplate } from "./templates";

export type LandingPlan = {
  templateId: string;
  templateName: string;
  theme: string;
  sections: { kind: string; label: string; brief: string }[];
};

/**
 * Structure de landing à partir d'un template.
 * Aujourd'hui elle devient des tâches dans le projet ; un futur générateur de pages
 * pourra partir du même objet.
 */
export function buildLandingPlan(t: PreLandingTemplate): LandingPlan {
  return {
    templateId: t.id,
    templateName: t.name,
    theme: t.theme,
    sections: t.sections.map((sec) => ({
      kind: sec.kind,
      label: SECTION_LABELS[sec.kind],
      brief: sec.brief,
    })),
  };
}

export function taskTitle(plan: LandingPlan, i: number) {
  const sec = plan.sections[i];
  return `Landing ${plan.templateName} · ${sec.label} : ${sec.brief}`;
}
