"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import Link from "next/link";
import { parseActions, type CopilotAction } from "@/lib/assistant/actions-markup";
import { ToolLine } from "./copilot-states";

export function ActionPills({ actions }: { actions: CopilotAction[] }) {
  if (!actions.length) return null;
  const confirms = actions.filter((a) => a.kind === "confirm" && a.actionId);
  const links = actions.filter((a) => a.kind !== "confirm");
  return (
    <div className="flex flex-col gap-2">
      {confirms.map((a, i) => (
        <ConfirmationCard key={`${a.actionId}-${i}`} action={a} />
      ))}
      {links.length ? (
        <ul className="flex flex-wrap gap-1.5">
          {links.map((a, i) => (
            <li key={`${a.kind}-${i}`}>
              {a.href ? (
                <Link
                  href={a.href}
                  target={a.href.startsWith("http") ? "_blank" : undefined}
                  rel={a.href.startsWith("http") ? "noreferrer" : undefined}
                  className="inline-flex min-h-8 items-center rounded-[10px] border border-[rgba(10,10,10,0.08)] px-2.5 text-[12px] text-ink transition-colors duration-150 hover:border-[#FF6B1A]/35 hover:text-[#FF6B1A] dark:border-white/8"
                >
                  {a.label} →
                </Link>
              ) : (
                <span className="inline-flex min-h-8 items-center rounded-[10px] border border-[rgba(10,10,10,0.08)] px-2.5 text-[12px] text-ink dark:border-white/8">
                  {a.label}
                </span>
              )}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function ConfirmationCard({ action }: { action: CopilotAction }) {
  const reduce = useReducedMotion();
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<{ message: string; href?: string; label?: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const actionId = action.actionId ?? "";

  async function confirm() {
    if (busy || done || !actionId) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/assistant/confirm", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actionId }),
      });
      const json = (await res.json()) as {
        success?: boolean;
        error?: string;
        message?: string;
      };
      if (!res.ok || !json.success) {
        setError(typeof json.error === "string" ? json.error : "Impossible de confirmer l’action.");
        return;
      }
      const raw = typeof json.message === "string" ? json.message : "";
      const { body, actions } = parseActions(raw);
      const follow = actions.find((a) => a.href);
      setDone({
        message: humanConfirmMessage(body),
        href: follow?.href,
        label: follow?.label,
      });
    } catch {
      setError("Confirmation interrompue.");
    } finally {
      setBusy(false);
    }
  }

  if (dismissed) return null;

  if (done) {
    return (
      <motion.div
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18, ease: [0.2, 0.8, 0.2, 1] }}
        className="rounded-[12px] border border-line bg-surface-2 px-3.5 py-3"
      >
        <ToolLine label={done.message} tone="success" />
        {done.href ? (
          <Link
            href={done.href}
            className="mt-2 inline-flex text-[12px] text-[#FF6B1A] hover:underline"
          >
            {done.label ? `${done.label} →` : "Voir →"}
          </Link>
        ) : null}
      </motion.div>
    );
  }

  return (
    <div className="rounded-[12px] border border-line bg-surface-2 px-3.5 py-3">
      <p className="font-mono text-[10px] tracking-[0.12em] text-[#6E6E6E] uppercase dark:text-[#A1A1A1]">
        Confirmation
      </p>
      <p className="mt-1 text-[13.5px] font-semibold text-ink">
        {action.label && action.label !== "Confirmer" ? action.label : "Valider cette action"}
      </p>
      {busy ? <div className="mt-2"><ToolLine label="Exécution en cours…" tone="running" /></div> : null}
      {error ? (
        <div className="mt-2 flex flex-col gap-1.5">
          <p className="text-[12.5px] text-destructive">{error}</p>
          <button
            type="button"
            onClick={() => void confirm()}
            className="self-start text-[12px] font-medium text-[#FF6B1A] hover:underline"
            aria-label="Réessayer la confirmation"
          >
            Réessayer
          </button>
        </div>
      ) : null}
      {!busy ? (
        <div className="mt-3 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => setDismissed(true)}
            aria-label="Annuler la confirmation"
            className="inline-flex h-8 items-center rounded-[10px] px-3 text-[12.5px] text-[#6E6E6E] transition-colors hover:bg-black/[0.04] hover:text-ink dark:text-[#A1A1A1] dark:hover:bg-white/[0.04]"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={() => void confirm()}
            aria-label="Confirmer l’action"
            className="inline-flex h-8 items-center rounded-[10px] bg-[#FF6B1A] px-3 text-[12.5px] font-medium text-white transition-[filter] duration-150 hover:brightness-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B1A]/40"
          >
            Confirmer
          </button>
        </div>
      ) : null}
    </div>
  );
}

function humanConfirmMessage(raw: string) {
  const trimmed = raw.trim();
  if (!trimmed) return "Action effectuée.";
  try {
    const j = JSON.parse(trimmed) as { message?: unknown; success?: unknown; text?: unknown };
    if (typeof j.message === "string" && j.message.trim()) return j.message.trim();
    if (typeof j.text === "string" && j.text.trim()) return j.text.trim();
    if (j.success === true) return "Action effectuée.";
  } catch {
    // texte libre
  }
  return trimmed.length > 220 ? `${trimmed.slice(0, 217)}…` : trimmed;
}
