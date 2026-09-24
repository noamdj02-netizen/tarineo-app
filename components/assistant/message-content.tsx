"use client";

import { Check, Copy } from "lucide-react";
import { Fragment, useState } from "react";

/**
 * Affiche une réponse de Claude : paragraphes, titres, listes, **gras**, `code`
 * et blocs ```code``` avec un bouton Copier. Pas de HTML injecté : tout est du texte React.
 */
export function MessageContent({ text }: { text: string }) {
  const parts = splitFences(text);
  return (
    <div className="flex flex-col gap-2.5">
      {parts.map((p, i) =>
        p.type === "code" ? (
          <CodeBlock key={i} lang={p.lang} code={p.text} />
        ) : (
          <Prose key={i} text={p.text} />
        ),
      )}
    </div>
  );
}

type Part = { type: "text"; text: string } | { type: "code"; lang: string; text: string };

function splitFences(text: string): Part[] {
  const out: Part[] = [];
  const re = /```([\w+-]*)\n?([\s\S]*?)(?:```|$)/g;
  let last = 0;
  for (const m of text.matchAll(re)) {
    if (m.index > last) out.push({ type: "text", text: text.slice(last, m.index) });
    out.push({ type: "code", lang: m[1], text: m[2].replace(/\n$/, "") });
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push({ type: "text", text: text.slice(last) });
  return out.filter((p) => p.type === "code" || p.text.trim());
}

function Prose({ text }: { text: string }) {
  const lines = text.replace(/^\n+|\n+$/g, "").split("\n");
  const blocks: React.ReactNode[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;

  const flush = () => {
    if (!list) return;
    const Tag = list.ordered ? "ol" : "ul";
    blocks.push(
      <Tag
        key={blocks.length}
        className={`flex flex-col gap-1 pl-5 ${list.ordered ? "list-decimal" : "list-disc"} marker:text-accent-2`}
      >
        {list.items.map((it, i) => (
          <li key={i}>
            <Inline text={it} />
          </li>
        ))}
      </Tag>,
    );
    list = null;
  };

  for (const line of lines) {
    const bullet = /^\s*[-*•]\s+(.*)$/.exec(line);
    const num = /^\s*\d+[.)]\s+(.*)$/.exec(line);
    const heading = /^#{1,4}\s+(.*)$/.exec(line);
    if (bullet || num) {
      const ordered = Boolean(num);
      if (list && list.ordered !== ordered) flush();
      list ??= { ordered, items: [] };
      list.items.push((bullet ?? num)![1]);
      continue;
    }
    flush();
    if (heading) {
      blocks.push(
        <p key={blocks.length} className="font-semibold tracking-[-0.01em]">
          <Inline text={heading[1]} />
        </p>,
      );
    } else if (line.trim()) {
      blocks.push(
        <p key={blocks.length}>
          <Inline text={line} />
        </p>,
      );
    }
  }
  flush();
  return <>{blocks}</>;
}

/** **gras** et `code` dans une ligne. */
function Inline({ text }: { text: string }) {
  const tokens = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return (
    <>
      {tokens.map((t, i) =>
        t.startsWith("**") && t.endsWith("**") && t.length > 4 ? (
          <strong key={i} className="font-semibold">
            {t.slice(2, -2)}
          </strong>
        ) : t.startsWith("`") && t.endsWith("`") && t.length > 2 ? (
          <code key={i} className="rounded-md bg-accent-soft px-1.5 py-0.5 font-mono text-[0.88em]">
            {t.slice(1, -1)}
          </code>
        ) : (
          <Fragment key={i}>{t}</Fragment>
        ),
      )}
    </>
  );
}

function CodeBlock({ lang, code }: { lang: string; code: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      // presse-papier refusé : l'utilisateur peut sélectionner le texte
    }
  }
  return (
    <div className="overflow-hidden rounded-xl bg-side text-side-ink">
      <div className="flex items-center justify-between border-b border-side-line px-3 py-1.5">
        <span className="font-mono text-[10.5px] tracking-[0.1em] text-side-muted uppercase">
          {lang || "texte"}
        </span>
        <button
          type="button"
          onClick={copy}
          className="inline-flex min-h-8 items-center gap-1.5 rounded-lg px-2 font-mono text-[11px] text-side-ink/80 hover:bg-white/10 hover:text-side-ink"
        >
          {copied ? (
            <Check className="size-3.5" aria-hidden />
          ) : (
            <Copy className="size-3.5" aria-hidden />
          )}
          {copied ? "Copié" : "Copier"}
        </button>
      </div>
      <pre className="overflow-x-auto p-3 font-mono text-[12.5px] leading-relaxed whitespace-pre">
        {code}
      </pre>
    </div>
  );
}
