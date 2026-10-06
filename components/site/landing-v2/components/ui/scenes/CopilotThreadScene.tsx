"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

import { Badge } from "@/components/site/landing-v2/components/ui/Badge";
import { LANDING_EASE, LANDING_VIEW } from "@/components/site/landing-v2/lib/landing-motion";

function buildThread(userRequest: string) {
  return [
  { role: "user" as const, text: userRequest },
  { role: "system" as const, text: "Lecture des lignes et comparaison à votre historique…" },
  { role: "assistant" as const, text: "3 prix fournisseurs ont augmenté sur ce document." },
  { role: "assistant" as const, text: "Impact estimé : −184 € de marge sur le chantier." },
  { role: "cta" as const, text: "Voir les détails des écarts" },
];
}

/** Fil assistant : réponses qui arrivent comme un traitement réel. */
export function CopilotThreadScene({
  className = "",
  userRequest = "Analyse cette facture Cedeo du chantier Dupont.",
}: {
  className?: string;
  userRequest?: string;
}) {
  const thread = buildThread(userRequest);
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { ...LANDING_VIEW, once: true });
  const [visible, setVisible] = useState(reduce ? thread.length : 1);

  useEffect(() => {
    if (reduce || !inView) return;
    let count = 1;
    const id = window.setInterval(() => {
      count += 1;
      setVisible(count);
      if (count >= thread.length) window.clearInterval(id);
    }, 550);
    return () => window.clearInterval(id);
  }, [inView, reduce]);

  return (
    <div ref={ref} className={`flex flex-col gap-3 ${className}`}>
      {thread.slice(0, visible).map((item, index) => (
        <motion.div
          key={`${item.role}-${index}`}
          initial={reduce ? false : { opacity: 0, y: 10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.42, ease: LANDING_EASE }}
          className={
            item.role === "user"
              ? "rounded-md border border-line bg-paper-50 px-4 py-3 text-sm text-ink-900"
              : item.role === "system"
                ? "px-1 text-xs text-ink-400"
                : item.role === "cta"
                  ? "pt-1"
                  : "rounded-md border border-line bg-paper-0 px-4 py-3 text-sm text-ink-600"
          }
        >
          {item.role === "user" ? (
            <p>« {item.text} »</p>
          ) : item.role === "system" ? (
            <p>{item.text}</p>
          ) : item.role === "cta" ? (
            <span className="inline-flex items-center rounded-full bg-ink-900 px-4 py-2 text-sm font-medium text-white">
              {item.text}
            </span>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <p>{item.text}</p>
              {index === 3 ? (
                <Badge tone="accent" dot>Priorité</Badge>
              ) : null}
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
}
