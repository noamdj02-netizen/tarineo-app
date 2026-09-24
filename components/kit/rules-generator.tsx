"use client";

import { Copy } from "lucide-react";
import { useState } from "react";
import { THEMES } from "@/lib/design-data/themes";
import { rulesFor } from "@/lib/kit";
import { CopyButton } from "./copy-button";

/** Choix du thème + fichier de règles .cursor/rules/design.mdc à copier. */
export function RulesGenerator() {
  const [theme, setTheme] = useState("chantier");
  const rules = rulesFor(theme);
  return (
    <>
      <div className="codehead gap-2">
        <select
          className="inp min-h-11"
          style={{ width: "auto" }}
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
          aria-label="Thème du fichier de règles"
        >
          {THEMES.map((t) => (
            <option key={t.id} value={t.id}>
              Thème {t.n}
            </option>
          ))}
        </select>
        <CopyButton text={rules}>
          <Copy aria-hidden />
          Copier
        </CopyButton>
      </div>
      <pre className="code">{rules}</pre>
    </>
  );
}
