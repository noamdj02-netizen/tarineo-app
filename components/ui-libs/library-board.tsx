"use client";

import { useMemo, useState } from "react";
import { allUiLibTags } from "@/lib/ui-libs/catalog";
import {
  UI_LIB_CATEGORIES,
  UI_LIB_CATEGORY_LABELS,
  UI_LIB_PRICING_LABELS,
  UI_LIB_PRICINGS,
  type UiLib,
  type UiLibCategory,
  type UiLibPricing,
} from "@/lib/ui-libs/types";
import { UiLibCard } from "./lib-card";

export function UiLibLibraryBoard({ libs }: { libs: UiLib[] }) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<UiLibCategory | "tous">("tous");
  const [pricing, setPricing] = useState<UiLibPricing | "tous">("tous");
  const [tag, setTag] = useState("tous");
  const tags = useMemo(() => allUiLibTags(), []);

  const list = libs.filter((lib) => {
    if (cat !== "tous" && lib.category !== cat) return false;
    if (pricing !== "tous" && lib.pricing !== pricing) return false;
    if (tag !== "tous" && !lib.tags.includes(tag)) return false;
    const needle = q.trim().toLowerCase();
    if (!needle) return true;
    const hay = [lib.name, lib.description, ...lib.tags, ...lib.stack].join(" ").toLowerCase();
    return hay.includes(needle);
  });

  return (
    <div>
      <label className="mb-3 flex flex-col gap-1.5">
        <span className="font-mono text-[11px] tracking-[0.1em] text-muted-foreground uppercase">
          Rechercher
        </span>
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Nom ou tag…"
          aria-label="Rechercher une librairie par nom ou tag"
          className="min-h-11 w-full max-w-md rounded-xl border border-line bg-surface-2 px-3 text-[14px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        />
      </label>

      <div className="picker" style={{ flexWrap: "wrap" }} role="group" aria-label="Filtrer par catégorie">
        <Chip pressed={cat === "tous"} onClick={() => setCat("tous")}>
          Toutes les catégories
        </Chip>
        {UI_LIB_CATEGORIES.map((c) => (
          <Chip key={c} pressed={cat === c} onClick={() => setCat(c)}>
            {UI_LIB_CATEGORY_LABELS[c]}
          </Chip>
        ))}
      </div>

      <div className="picker" style={{ flexWrap: "wrap" }} role="group" aria-label="Filtrer par tarif">
        <Chip pressed={pricing === "tous"} onClick={() => setPricing("tous")}>
          Tous les tarifs
        </Chip>
        {UI_LIB_PRICINGS.map((p) => (
          <Chip key={p} pressed={pricing === p} onClick={() => setPricing(p)}>
            {UI_LIB_PRICING_LABELS[p]}
          </Chip>
        ))}
      </div>

      <div className="picker" style={{ flexWrap: "wrap" }} role="group" aria-label="Filtrer par tag">
        <Chip pressed={tag === "tous"} onClick={() => setTag("tous")}>
          Tous les tags
        </Chip>
        {tags.map((t) => (
          <Chip key={t} pressed={tag === t} onClick={() => setTag(tag === t ? "tous" : t)}>
            {t}
          </Chip>
        ))}
      </div>

      {list.length === 0 ? (
        <p className="mt-4 text-[14px] text-muted-foreground">Aucune librairie trouvée</p>
      ) : (
        <ul className="mt-2 grid gap-5 md:grid-cols-2">
          {list.map((lib) => (
            <li key={lib.id}>
              <UiLibCard lib={lib} />
            </li>
          ))}
        </ul>
      )}
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
    <button
      type="button"
      className="chip focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
      aria-pressed={pressed}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
