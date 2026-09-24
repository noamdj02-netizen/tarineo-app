"use client";

import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { DEFAULT_MODEL, MODELS, isModelId, type ModelId } from "@/lib/models";

const KEY = "navpit-model";

/** Modèle choisi, mémorisé dans ce navigateur. */
export function useModel(initial?: string | null) {
  const [model, setModel] = useState<ModelId>(isModelId(initial) ? initial : DEFAULT_MODEL);
  useEffect(() => {
    if (isModelId(initial)) return;
    try {
      const saved = localStorage.getItem(KEY);
      if (isModelId(saved)) setModel(saved);
    } catch {
      // stockage indisponible (navigation privée)
    }
  }, [initial]);
  const choose = (m: ModelId) => {
    setModel(m);
    try {
      localStorage.setItem(KEY, m);
    } catch {
      // ignoré
    }
  };
  return [model, choose] as const;
}

export function ModelSelect({
  value,
  onChange,
}: {
  value: ModelId;
  onChange: (m: ModelId) => void;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as ModelId)}
        aria-label="Modèle"
        className="h-10 appearance-none rounded-pill border border-line bg-surface-2 pr-8 pl-3.5 font-mono text-[11px] font-medium tracking-[0.08em] text-ink/80 uppercase outline-none hover:bg-accent-soft"
      >
        {MODELS.map((m) => (
          <option key={m.id} value={m.id}>
            {m.label} · {m.hint}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute top-1/2 right-2.5 size-3.5 -translate-y-1/2 text-muted"
        aria-hidden
      />
    </div>
  );
}
