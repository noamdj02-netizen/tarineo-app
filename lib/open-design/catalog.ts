/** Skills Open Design qu’on reprend dans Navpit. Pas le studio desktop. */

export type OdSkillId = "saas-landing" | "web-prototype" | "design-md" | "critique";

export type OdSkill = {
  id: OdSkillId;
  label: string;
  trigger: string[];
  stay: string;
  brief: string;
};

export const OD_SKILLS: OdSkill[] = [
  {
    id: "saas-landing",
    label: "Landing SaaS",
    trigger: ["landing", "saas", "hero", "page d’accueil"],
    stay: "/bibliotheque/heros",
    brief: `Landing une page. Lis le DESIGN.md du projet. Sections dans l’ordre des 12 frames Navpit (Navbar, Hero, Preuve, Probleme, Marche, Fonctions, Demo, Temoignages, Resultats, Tarifs, FAQ, CTA). Un seul fichier HTML, CSS inline, pas de JS. Couleurs uniquement depuis le DESIGN.md. Accent 2 fois max. Copy réelle du projet, pas de lorem. Attache le HTML au projet (kind landing).`,
  },
  {
    id: "web-prototype",
    label: "Prototype page",
    trigger: ["prototype", "maquette", "page"],
    stay: "/composants",
    brief: `Prototype HTML self-contained. Colle des sections existantes (hero, features, CTA). Mappe les tokens DESIGN.md. Pas de CSS inventé hors tokens.`,
  },
  {
    id: "design-md",
    label: "Contrat DESIGN.md",
    trigger: ["design.md", "thème", "tokens", "marque"],
    stay: "/themes",
    brief: `Écris ou mets à jour le DESIGN.md du projet à partir du thème kit. Palette, typos, boutons, do/don't. N’invente pas de hex hors thème.`,
  },
  {
    id: "critique",
    label: "Critique landing",
    trigger: ["critique", "review", "audit design"],
    stay: "/audit",
    brief: `Critique en 5 axes (philosophie, hierarchie, detail, fonction, innovation) PLUS les 12 frames. Keep / Fix / Quick-wins. Pas de notes inventées.`,
  },
];

export function pickOdSkill(question: string): OdSkill | null {
  const q = question.toLowerCase();
  return (
    OD_SKILLS.find((s) => s.trigger.some((t) => q.includes(t))) ??
    ( /landing|hero|frame/i.test(question) ? OD_SKILLS[0] : null)
  );
}
