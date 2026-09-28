"use client";

import { Check, Copy } from "lucide-react";
import { Fragment, useMemo, useState } from "react";
import { parseActions } from "@/lib/assistant/actions-markup";
import { ActionPills } from "./action-pills";
import { StreamingCaret } from "./copilot-states";

const FOLD_LINES = 12;

/**
 * Affiche une réponse de Claude : paragraphes, titres, listes, **gras**, `code`
 * et blocs ```code``` avec un bouton Copier. Pavés repliés au-delà de ~12 lignes.
 */
export function MessageContent({ text, streaming = false }: { text: string; streaming?: boolean }) {
  const { body, actions } = parseActions(text);
  const hasVerdict = Boolean(grab("Verdict", body) && grab("Preuve", body) && grab("Action", body));
  const parts = splitFences(hasVerdict ? stripVerdict(body) : body);
  const lineCount = body.split("\n").length;
  const [open, setOpen] = useState(lineCount <= FOLD_LINES);
  const shown = useMemo(() => {
    if (open) return parts;
    return foldParts(parts, FOLD_LINES);
  }, [open, parts]);

  return (
    <div className="flex flex-col gap-3">
      <VerdictCard text={body} />
      <div className="flex flex-col gap-2.5">
        {shown.map((p, i) =>
          p.type === "code" ? (
            <CodeBlock key={i} lang={p.lang} code={p.text} />
          ) : (
            <Prose key={i} text={p.text} />
          ),
        )}
      </div>
      {lineCount > FOLD_LINES && !open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="self-start font-mono text-[12px] tracking-[0.06em] text-muted-foreground uppercase hover:text-ink"
        >
          Voir la suite
        </button>
      ) : null}
      {streaming ? <StreamingCaret /> : null}
      {!streaming ? <ActionPills actions={actions} /> : null}
    </div>
  );
}

type Part = { type: "text"; text: string } | { type: "code"; lang: string; text: string };

function foldParts(parts: Part[], maxLines: number): Part[] {
  let used = 0;
  const out: Part[] = [];
  for (const p of parts) {
    const n = p.text.split("\n").length;
    if (used + n <= maxLines) {
      out.push(p);
      used += n;
      continue;
    }
    if (p.type === "text") {
      out.push({ type: "text", text: p.text.split("\n").slice(0, Math.max(1, maxLines - used)).join("\n") });
    }
    break;
  }
  return out;
}

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

function stripVerdict(text: string) {
  return text
    .replace(/(?:^|\n)\s*(?:\*\*)?(?:Verdict|Preuve|Action)(?:\*\*)?\s*[:—-][\s\S]*?(?=\n\s*(?:\*\*)?(?:Verdict|Preuve|Action)(?:\*\*)?\s*[:—-]|$)/gi, "")
    .trim();
}

function grab(label: string, text: string) {
  const re = new RegExp(
    `(?:\\*\\*)?${label}(?:\\*\\*)?\\s*[:—-]\\s*([\\s\\S]*?)(?=\\n\\s*(?:\\*\\*)?(?:Verdict|Preuve|Action)(?:\\*\\*)?\\s*[:—-]|$)`,
    "i",
  );
  return re.exec(text)?.[1]?.trim() ?? "";
}

function VerdictCard({ text }: { text: string }) {
  const verdict = grab("Verdict", text);
  const preuve = grab("Preuve", text);
  const action = grab("Action", text);
  if (!verdict || !preuve || !action) return null;
  return (
    <div className="grid gap-2 rounded-xl border border-line bg-accent-soft/60 p-3 text-[15px] leading-[1.55] sm:grid-cols-3">
      <div>
        <p className="font-mono text-[10.5px] tracking-[0.1em] text-muted-foreground uppercase">Verdict</p>
        <p className="mt-1 font-semibold">{verdict}</p>
      </div>
      <div>
        <p className="font-mono text-[10.5px] tracking-[0.1em] text-muted-foreground uppercase">Preuve</p>
        <p className="mt-1">{preuve}</p>
      </div>
      <div>
        <p className="font-mono text-[10.5px] tracking-[0.1em] text-muted-foreground uppercase">Action</p>
        <p className="mt-1">{action}</p>
      </div>
    </div>
  );
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
        className={`flex flex-col gap-1.5 pl-5 ${list.ordered ? "list-decimal" : "list-disc"} marker:text-accent-2`}
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
        <p key={blocks.length} className="text-[14px] font-semibold tracking-[-0.02em]">
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
      // presse-papier refusé
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
          {copied ? <Check className="size-3.5" aria-hidden /> : <Copy className="size-3.5" aria-hidden />}
          {copied ? "Copié" : "Copier"}
        </button>
      </div>
      <pre className="overflow-x-auto p-3 font-mono text-[13px] leading-relaxed whitespace-pre">{code}</pre>
    </div>
  );
}
