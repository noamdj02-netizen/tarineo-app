"use client";

import { useEffect, useState } from "react";
import { CHECKLIST } from "@/lib/design-data/frames";

/** Même clé et même format que le HTML d'origine : { "0": true, … }. */
const KEY = "kit-ck";

export function Checklist() {
  const [done, setDone] = useState<Record<number, boolean>>({});

  useEffect(() => {
    try {
      setDone(JSON.parse(localStorage.getItem(KEY) || "{}"));
    } catch {}
  }, []);

  function toggle(i: number, checked: boolean) {
    const next = { ...done, [i]: checked };
    setDone(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {}
  }

  const n = CHECKLIST.filter((_, i) => done[i]).length;

  return (
    <div className="check">
      <h2>Checklist avant mise en ligne</h2>
      <div
        className="prog"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={CHECKLIST.length}
        aria-valuenow={n}
        aria-label="Points validés"
      >
        <i style={{ width: `${(n / CHECKLIST.length) * 100}%` }} />
      </div>
      {CHECKLIST.map((t, i) => (
        <label key={t} className="min-h-11">
          <input type="checkbox" checked={!!done[i]} onChange={(e) => toggle(i, e.target.checked)} />
          <span>{t}</span>
        </label>
      ))}
    </div>
  );
}
