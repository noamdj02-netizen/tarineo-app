"use client";

import { Copy } from "lucide-react";
import { useEffect, useState } from "react";
import { COMPONENTS } from "@/lib/design-data/components";
import { swatches, THEMES } from "@/lib/design-data/themes";
import { kitDoc } from "@/lib/kit";
import { CopyButton } from "./copy-button";
import { FrameStage } from "./frame-stage";

const KEY = "kit-theme";
const DOCS = COMPONENTS.map((c) => kitDoc(c.h, "chantier"));

export function ComponentLibrary({
  icons,
  initialTheme,
}: {
  /** icônes rendues côté serveur, dans l'ordre de COMPONENTS */
  icons: React.ReactNode[];
  initialTheme?: string;
}) {
  const [theme, setTheme] = useState(initialTheme ?? "chantier");

  useEffect(() => {
    try {
      if (initialTheme) return localStorage.setItem(KEY, initialTheme);
      const saved = localStorage.getItem(KEY);
      if (saved && THEMES.some((t) => t.id === saved)) setTheme(saved);
    } catch {}
  }, [initialTheme]);

  function choose(id: string) {
    setTheme(id);
    try {
      localStorage.setItem(KEY, id);
    } catch {}
  }

  return (
    <>
      <div className="picker" role="group" aria-label="Thème des composants">
        {THEMES.map((t) => {
          const s = swatches(t.id);
          return (
            <button
              key={t.id}
              type="button"
              className="chip"
              aria-pressed={t.id === theme}
              onClick={() => choose(t.id)}
            >
              <span
                className="sw"
                style={{ background: `linear-gradient(135deg,${s[0].c} 50%,${s[3].c} 50%)` }}
              />
              {t.n}
            </button>
          );
        })}
      </div>
      <div>
        {COMPONENTS.map((c, i) => (
          <article key={c.n} className="comp">
            <div className="comp-h">
              <div>
                <h3>
                  {icons[i]}
                  {c.n}
                </h3>
                <p>{c.w}</p>
              </div>
              <CopyButton text={c.h}>
                <Copy aria-hidden />
                Copier HTML
              </CopyButton>
            </div>
            <div className="stage">
              <FrameStage doc={DOCS[i]} title={`Aperçu : ${c.n}`} kit={theme} />
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
