"use client";

import {
  Code,
  MessageSquare,
  Monitor,
  MousePointer2,
  Palette,
  RotateCcw,
  Smartphone,
  Wind,
} from "lucide-react";
import { useRef, useState } from "react";
import { CopyButton } from "@/components/kit/copy-button";
import { FrameStage, type FrameStageHandle } from "@/components/kit/frame-stage";
import { BLOCKS, PACKS, type Block } from "@/lib/design-data/packs";
import { packDoc, pkCode, pkCursor, pkGpt, pkTokens, pkTw } from "@/lib/kit2";

type Kind = "tout" | "web" | "mobile";
const KINDS: [Kind, string][] = [
  ["tout", "Web + mobile"],
  ["web", "Web"],
  ["mobile", "Mobile"],
];
const DOCS = BLOCKS.map(packDoc);

export function PackLibrary() {
  const [sel, setSel] = useState("tout");
  const [kind, setKind] = useState<Kind>("tout");
  const packs = PACKS.filter((p) => sel === "tout" || p.id === sel);

  return (
    <>
      <div className="picker" style={{ flexWrap: "wrap" }} role="group" aria-label="Filtrer">
        <button type="button" className="chip" aria-pressed={sel === "tout"} onClick={() => setSel("tout")}>
          Tous les styles
        </button>
        {PACKS.map((p) => (
          <button
            key={p.id}
            type="button"
            className="chip"
            aria-pressed={sel === p.id}
            onClick={() => setSel(p.id)}
          >
            <span
              className="sw"
              style={{ background: `linear-gradient(135deg,${p.t.bg} 50%,${p.t.accent} 50%)` }}
            />
            {p.n}
          </button>
        ))}
        {KINDS.map(([k, label]) => (
          <button key={k} type="button" className="chip" aria-pressed={kind === k} onClick={() => setKind(k)}>
            {label}
          </button>
        ))}
      </div>
      <div>
        {packs.map((p) => {
          const items = BLOCKS.map((c, i) => ({ c, i })).filter(
            ({ c }) => c.pk === p.id && (kind === "tout" || c.k === kind),
          );
          if (!items.length) return null;
          return (
            <div key={p.id}>
              <div className="pkhead">
                <div>
                  <div className="eyebrow">D’après tes captures</div>
                  <h3>{p.n}</h3>
                  <a href={p.u} target="_blank" rel="noopener noreferrer" className="hint">
                    {p.from} ↗
                  </a>
                  <p className="hint" style={{ margin: "4px 0 0", maxWidth: "60ch" }}>
                    {p.mood}
                  </p>
                </div>
                <div className="sws">
                  {(["bg", "surface", "text", "accent", "glow"] as const).map((k) => (
                    <span key={k}>
                      <i style={{ background: p.t[k] }} />
                      {p.t[k].startsWith("rgba") ? "rgba" : p.t[k]}
                    </span>
                  ))}
                </div>
                <div className="tbtns">
                  <CopyButton text={() => pkTokens(p)}>
                    <Palette aria-hidden />
                    Tokens CSS
                  </CopyButton>
                  <CopyButton text={() => pkTw(p)}>
                    <Wind aria-hidden />
                    Config Tailwind
                  </CopyButton>
                </div>
              </div>
              {items.map(({ c, i }) => (
                <BlockCard key={i} c={c} doc={DOCS[i]} />
              ))}
            </div>
          );
        })}
      </div>
    </>
  );
}

function BlockCard({ c, doc }: { c: Block; doc: string }) {
  const stage = useRef<FrameStageHandle>(null);
  return (
    <article className="comp">
      <div className="comp-h">
        <div>
          <h3>
            {c.k === "mobile" ? <Smartphone aria-hidden /> : <Monitor aria-hidden />}
            {c.n}
          </h3>
          <p>{c.d}</p>
        </div>
        <div className="tbtns">
          <CopyButton text={() => pkCode(c)}>
            <Code aria-hidden />
            Code
          </CopyButton>
          <CopyButton text={() => pkCursor(c)}>
            <MousePointer2 aria-hidden />
            Prompt Cursor
          </CopyButton>
          <CopyButton text={() => pkGpt(c)}>
            <MessageSquare aria-hidden />
            Prompt ChatGPT
          </CopyButton>
          <button
            type="button"
            className="copy"
            title="Rejouer l’animation"
            aria-label="Rejouer l’animation"
            onClick={() => stage.current?.replay()}
          >
            <RotateCcw aria-hidden />
          </button>
        </div>
      </div>
      <div className="stage">
        <FrameStage
          ref={stage}
          doc={doc}
          title={`Aperçu : ${c.n}`}
          minHeight={c.k === "mobile" ? 600 : 320}
        />
      </div>
    </article>
  );
}
