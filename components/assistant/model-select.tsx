"use client";

import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { DEFAULT_MODEL, MODELS, isModelId, type ModelId } from "@/lib/models";

const KEY = "tarineo-model";

/** Modèle choisi, mémorisé dans ce navigateur. */
export function useModel(initial?: string | null) {
  const [model, setModel] = useState<ModelId>(isModelId(initial) ? initial : DEFAULT_MODEL);
  useEffect(() => {
    if (isModelId(initial)) return;
    try {
      const saved = localStorage.getItem(KEY) ?? localStorage.getItem("navpit-model");
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
        className="h-7 appearance-none rounded-md border border-[rgba(10,10,10,0.08)] bg-transparent pr-6 pl-2 font-mono text-[10.5px] tracking-[0.04em] text-[#6E6E6E] uppercase outline-none hover:border-[#FF6B1A]/30 hover:text-ink focus-visible:border-[#FF6B1A] dark:border-white/8 dark:text-[#A1A1A1]"
      >
        {MODELS.map((m) => (
          <option key={m.id} value={m.id}>
            {m.label} · {m.hint}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute top-1/2 right-1.5 size-3 -translate-y-1/2 text-[#6E6E6E] dark:text-[#A1A1A1]"
        aria-hidden
      />
    </div>
  );
}
