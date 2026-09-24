"use client";

import { Copy } from "lucide-react";
import { useRef, useState } from "react";

async function writeClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const t = document.createElement("textarea");
    t.value = text;
    document.body.appendChild(t);
    t.select();
    let ok = false;
    try {
      ok = document.execCommand("copy");
    } catch {}
    t.remove();
    return ok;
  }
}

/** Bouton « .copy » du HTML d'origine : affiche « Copié ✓ » pendant 1,4 s. */
export function CopyButton({
  text,
  children,
  title,
}: {
  /** texte à copier, calculé au clic */
  text: string | (() => string);
  children?: React.ReactNode;
  title?: string;
}) {
  const [msg, setMsg] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  async function onClick() {
    const ok = await writeClipboard(typeof text === "function" ? text() : text);
    setMsg(ok ? "Copié ✓" : "Copie bloquée");
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setMsg(null), 1400);
  }

  return (
    <button type="button" className="copy" onClick={onClick} title={title} aria-live="polite">
      {msg ?? (
        children ?? (
          <>
            <Copy aria-hidden />
            Copier
          </>
        )
      )}
    </button>
  );
}
