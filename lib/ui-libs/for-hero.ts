import type { HeroCard } from "@/lib/heroes/types";
import { UI_LIBS } from "./catalog";
import type { UiLib, UiLibCategory } from "./types";

const HERO_TAG_TO_LIB: Record<string, string[]> = {
  verre: ["background", "hero"],
  tore: ["background", "hero"],
  objet: ["hero"],
  luxe: ["hero"],
  scroll: ["hero", "background"],
  carte: ["features", "hero"],
  fintech: ["features", "pricing"],
  métal: ["hero", "background"],
  globe: ["background", "hero"],
  réseau: ["features"],
  voyage: ["hero"],
  équipes: ["features"],
};

function wantedTags(hero: Pick<HeroCard, "categorie" | "tags">) {
  const tags = new Set<string>(["hero"]);
  if (hero.categorie === "ui") {
    tags.add("features");
    tags.add("pricing");
  }
  if (hero.categorie === "3d" || hero.categorie === "shaders" || hero.categorie === "particules" || hero.categorie === "video") {
    tags.add("background");
    tags.add("text-effect");
  }
  for (const tag of hero.tags) {
    HERO_TAG_TO_LIB[tag.toLowerCase()]?.forEach((t) => tags.add(t));
  }
  return tags;
}

function preferredCategory(categorie: HeroCard["categorie"]): UiLibCategory {
  return categorie === "ui" ? "base" : "animated";
}

function norm(s: string) {
  return s.toLowerCase().replace(/[\s/_-]+/g, "");
}

export function libsForHero(hero: Pick<HeroCard, "categorie" | "tags" | "stack">, limit = 3): UiLib[] {
  const tags = wantedTags(hero);
  const cat = preferredCategory(hero.categorie);
  const stacks = new Set(hero.stack.map(norm));

  const scored = UI_LIBS.map((lib) => {
    let score = 0;
    if (lib.category === cat) score += 2;
    if (hero.categorie === "ui" && lib.category === "sections") score += 2;
    for (const t of lib.tags) {
      if (tags.has(t)) score += 2;
    }
    for (const s of lib.stack) {
      if (stacks.has(norm(s)) || (norm(s) === "framermotion" && stacks.has("framermotion"))) {
        score += 1;
      }
    }
    return { lib, score };
  })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || a.lib.name.localeCompare(b.lib.name, "fr"));

  return scored.slice(0, limit).map((x) => x.lib);
}
