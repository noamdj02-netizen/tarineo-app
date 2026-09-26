import { LAUNCH_CHECKS, type LaunchState } from "./launch-checks";
import type { ProjectMarketing } from "./marketing";
import type { ProjectSeo } from "./seo";
import type { ProjectAssetItem, ProjectSchemaLink } from "./types";

export type JourneyStepId = "landing" | "schema" | "seo" | "marketing" | "lancer";

export type JourneyStep = {
  id: JourneyStepId;
  n: string;
  href: string;
  done: boolean;
  hint: string;
};

export function projectJourney(input: {
  site: string;
  assets: ProjectAssetItem[];
  schemas: ProjectSchemaLink[];
  seo: ProjectSeo;
  marketing: ProjectMarketing;
  launch: LaunchState;
}): JourneyStep[] {
  const landing = input.assets.some((a) => a.kind === "landing" || Boolean(a.theme_id));
  const site = Boolean(input.site.trim());
  const landingDone = landing || site;
  const schemaDone = input.schemas.length > 0;
  const seoDone = Boolean(input.seo.snapshot);
  const marketDone = Boolean(input.marketing.offer.trim() && input.marketing.cta.trim());
  const launchDone = input.launch.done.length >= LAUNCH_CHECKS.length;
  const launchHint =
    input.launch.done.length === 0
      ? `${LAUNCH_CHECKS.length} points avant d’ouvrir.`
      : `${input.launch.done.length}/${LAUNCH_CHECKS.length} cochés.`;

  return [
    {
      id: "landing",
      n: "Landing",
      href: landingDone ? "#seo" : "/bibliotheque/heros",
      done: landingDone,
      hint: landing ? "Hero attaché." : site ? "URL en ligne." : "Choisir un hero ou coller l’URL.",
    },
    {
      id: "schema",
      n: "Schéma",
      href: schemaDone ? "/schemas" : "/schemas",
      done: schemaDone,
      hint: schemaDone ? `${input.schemas.length} carte${input.schemas.length > 1 ? "s" : ""}.` : "Parcours avant de coder.",
    },
    {
      id: "seo",
      n: "SEO",
      href: "#seo",
      done: seoDone,
      hint: seoDone ? `Score ${input.seo.snapshot?.seo}/100.` : "Scorer le site.",
    },
    {
      id: "marketing",
      n: "Marketing",
      href: "#marketing",
      done: marketDone,
      hint: marketDone ? "Offre + CTA posés." : "Offre, canal, visuels.",
    },
    {
      id: "lancer",
      n: "Lancer",
      href: "#lancer",
      done: launchDone,
      hint: launchHint,
    },
  ];
}
