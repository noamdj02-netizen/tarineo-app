"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AttachToProject, type AttachTarget } from "@/components/kit/attach-to-project";
import { HERO_CATEGORIES, HERO_LEVELS } from "@/lib/heroes/catalog";
import {
  HERO_CATEGORY_LABELS,
  HERO_LEVEL_LABELS,
  type HeroCard,
  type HeroCategory,
  type HeroLevel,
} from "@/lib/heroes/types";
import { HeroCapture } from "./hero-capture";

export function HeroLibraryBoard({
  heroes,
  projects,
}: {
  heroes: HeroCard[];
  projects: AttachTarget[];
}) {
  const [cat, setCat] = useState<HeroCategory | "tous">("tous");
  const [lvl, setLvl] = useState<HeroLevel | "tous">("tous");
  const [stack, setStack] = useState("tous");

  const stacks = useMemo(() => {
    const s = new Set<string>();
    heroes.forEach((h) => h.stack.forEach((x) => s.add(x)));
    return [...s].sort();
  }, [heroes]);

  const list = heroes.filter((h) => {
    if (cat !== "tous" && h.categorie !== cat) return false;
    if (lvl !== "tous" && h.niveau !== lvl) return false;
    if (stack !== "tous" && !h.stack.includes(stack)) return false;
    return true;
  });

  const featured = heroes.filter((h) => h.acces === "gratuit").slice(0, 3);

  return (
    <div>
      {featured.length ? (
        <div className="mb-8">
          <p className="mb-3 font-mono text-[11px] tracking-[0.12em] text-muted-foreground uppercase">
            Commence ici — landing gratuite en 5 minutes
          </p>
          <ul className="grid gap-4 md:grid-cols-3">
            {featured.map((h) => (
              <li key={h.slug}>
                <article className="comp">
                  <div className="comp-h">
                    <div>
                      <h3>{h.nom}</h3>
                      <p>{h.variables.find((v) => v.key === "MARQUE")?.defaut}</p>
                    </div>
                    <AttachToProject
                      name={h.nom}
                      landingSlug={h.slug}
                      projects={projects}
                      variant="primary"
                    />
                  </div>
                  <Link href={`/bibliotheque/heros/${h.slug}`} className="stage block p-3">
                    <HeroCapture hero={h} shine />
                  </Link>
                </article>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="picker" style={{ flexWrap: "wrap" }} role="group" aria-label="Filtrer">
        <Chip pressed={cat === "tous"} onClick={() => setCat("tous")}>
          Tous les styles
        </Chip>
        {HERO_CATEGORIES.map((c) => (
          <Chip key={c} pressed={cat === c} onClick={() => setCat(c)}>
            {HERO_CATEGORY_LABELS[c]}
          </Chip>
        ))}
        {HERO_LEVELS.map((l) => (
          <Chip key={l} pressed={lvl === l} onClick={() => setLvl(lvl === l ? "tous" : l)}>
            {HERO_LEVEL_LABELS[l]}
          </Chip>
        ))}
        {stacks.slice(0, 5).map((s) => (
          <Chip key={s} pressed={stack === s} onClick={() => setStack(stack === s ? "tous" : s)}>
            {s}
          </Chip>
        ))}
      </div>

      <ul className="mt-2 grid gap-5 lg:grid-cols-2">
        {list.map((h) => (
          <li key={h.slug}>
            <article className="comp">
              <div className="comp-h">
                <div>
                  <h3>{h.nom}</h3>
                  <p>
                    {h.variables.find((v) => v.key === "MARQUE")?.defaut} ·{" "}
                    {HERO_CATEGORY_LABELS[h.categorie]}
                    {h.acces === "pro" ? " · Pro" : ""}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <AttachToProject
                    name={h.nom}
                    landingSlug={h.slug}
                    projects={projects}
                    variant="primary"
                  />
                  <Link href={`/bibliotheque/heros/${h.slug}`} className="copy">
                    Ouvrir
                  </Link>
                </div>
              </div>
              <Link
                href={`/bibliotheque/heros/${h.slug}`}
                className="stage block p-3 transition-transform duration-300 ease-out-soft hover:-translate-y-0.5"
              >
                <HeroCapture hero={h} shine />
              </Link>
            </article>
          </li>
        ))}
      </ul>
      {list.length === 0 ? (
        <p className="text-[14px] text-muted-foreground">Aucun hero pour ce filtre.</p>
      ) : null}
    </div>
  );
}

function Chip({
  pressed,
  onClick,
  children,
}: {
  pressed: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button type="button" className="chip" aria-pressed={pressed} onClick={onClick}>
      {children}
    </button>
  );
}
