"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { EASE, SectionEnter } from "@/components/motion/reveal";
import { IMPORTANT_CHANGE, PriceMove } from "@/components/site/delta-badge";
import { LandingFrame } from "@/components/site/landing-frame";
import { SupplierLogo } from "@/components/site/supplier-logo";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DEMO_DOCUMENTS,
  DEMO_NOTE,
  SUPPLIERS_DISCLAIMER,
  euro,
  euroDelta,
  signedPct,
  variation,
} from "@/lib/site/tarineo";
import { cn } from "@/lib/utils";

/** Id stable (SSR = client) : les ids générés par base-ui divergent quand la section est pré-rendue. */
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-");

/** Démo : un document fournisseur (papier) et sa lecture par Tarinéo, un onglet par fournisseur. */
export function LandingDocument() {
  const [supplier, setSupplier] = useState(DEMO_DOCUMENTS[0].supplier);
  const reduce = useReducedMotion();
  const doc =
    DEMO_DOCUMENTS.find((d) => d.supplier === supplier) ?? DEMO_DOCUMENTS[0];
  const rows = doc.lines.map((l) => ({
    ...l,
    pct: variation(l.before, l.after),
    delta: l.after - l.before,
  }));
  const ups = rows.filter((r) => r.pct > 0.05);
  const euroImpact = ups.reduce((s, r) => s + r.delta, 0);

  return (
    <SectionEnter>
      <Tabs
        value={supplier}
        onValueChange={(v) => setSupplier(String(v))}
        className="mx-auto w-full max-w-[1080px] gap-5"
      >
        <div className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:flex sm:justify-center sm:px-0">
          <TabsList aria-label="Exemples de documents fournisseurs">
            {DEMO_DOCUMENTS.map((d) => (
              <TabsTrigger
                key={d.supplier}
                id={`doc-tab-${slug(d.supplier)}`}
                value={d.supplier}
                className="px-3.5 sm:px-4"
              >
                {d.supplier}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <div className="grid items-stretch gap-4 lg:grid-cols-2">
          <AnimatePresence mode="wait" initial={false}>
            <motion.article
              key={doc.supplier}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: EASE }}
              className="relative overflow-hidden rounded-2xl bg-paper text-paper-ink shadow-lift ring-1 ring-black/10"
              aria-label={`${doc.kind} ${doc.supplier}, exemple`}
            >
              <header className="flex items-start justify-between gap-4 border-b border-black/12 px-5 py-4 sm:px-6">
                <div className="flex items-center gap-3">
                  <SupplierLogo
                    name={doc.supplier}
                    size={36}
                    className="ring-black/10"
                  />
                  <div>
                    <p className="font-display text-[20px] leading-none font-semibold tracking-tight uppercase">
                      {doc.supplier}
                    </p>
                    <p className="mt-1 text-[13px] text-black/55">
                      {doc.kind} {doc.number}
                    </p>
                  </div>
                </div>
                <p className="font-display text-[15px] font-semibold tabular-nums">
                  {doc.date}/2026
                </p>
              </header>

              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-black/10 text-[11px] font-medium tracking-[0.04em] text-black/45 uppercase">
                    <th className="px-5 py-2.5 font-medium sm:px-6">
                      Désignation
                    </th>
                    <th className="hidden py-2.5 pr-3 text-right font-medium sm:table-cell">
                      Avant
                    </th>
                    <th className="px-5 py-2.5 text-right font-medium sm:px-6">
                      P.U. HT
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => {
                    const hit = r.pct >= IMPORTANT_CHANGE;
                    return (
                      <tr
                        key={r.ref}
                        className={cn(
                          "border-t border-black/8",
                          hit && "bg-brand-orange/10",
                        )}
                      >
                        <td className="px-5 py-3 pr-3 sm:px-6">
                          <span className="block text-[11px] text-black/40">
                            {r.ref}
                          </span>
                          <span className="text-[14px] font-medium leading-snug">
                            {r.label}
                          </span>
                        </td>
                        <td className="hidden py-3 pr-3 text-right font-display text-[13px] text-black/40 tabular-nums line-through sm:table-cell">
                          {hit ? euro(r.before) : ""}
                        </td>
                        <td
                          className={cn(
                            "px-5 py-3 text-right font-display text-[15px] font-semibold tabular-nums sm:px-6",
                            hit && "text-brand-orange",
                          )}
                        >
                          {euro(r.after)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {!reduce ? (
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 top-0 h-10 animate-[doc-scan_1.6s_ease-in-out_1_both] bg-[linear-gradient(180deg,transparent,rgba(236,88,33,0.16),transparent)] [--scan-distance:360px]"
                />
              ) : null}
            </motion.article>
          </AnimatePresence>

          <LandingFrame className="h-full" innerClassName="h-full">
            <div className="flex items-center justify-between gap-3 px-5 py-4">
              <div>
                <p className="text-[15px] font-semibold">Lecture Tarinéo</p>
                <p className="text-[13px] text-muted-foreground">
                  Comparé à vos derniers achats
                </p>
              </div>
              <Badge className="bg-brand-orange text-white">
                {ups.length} hausses
              </Badge>
            </div>
            <Separator />
            <ul className="flex-1">
              {rows.map((r, i) => (
                <motion.li
                  key={`${doc.supplier}-${r.ref}`}
                  initial={reduce ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.3,
                    ease: EASE,
                    delay: 0.1 + i * 0.06,
                  }}
                  className={cn(
                    "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border px-5 py-3.5 last:border-b-0",
                    r.pct >= IMPORTANT_CHANGE && "bg-brand-orange/[0.07]",
                  )}
                >
                  <div className="min-w-0">
                    <p className="truncate text-[14px] font-medium">
                      {r.label}
                    </p>
                    {r.since ? (
                      <p className="text-[12px] text-muted-foreground">
                        Dernier achat : {r.since}
                      </p>
                    ) : (
                      <p className="text-[12px] text-muted-foreground">
                        Même prix
                      </p>
                    )}
                  </div>
                  <PriceMove before={r.before} after={r.after} />
                </motion.li>
              ))}
            </ul>

            <div className="flex items-center justify-between gap-3 border-t border-border bg-surface-2 px-5 py-4">
              <span className="text-[14px] text-muted-foreground">
                Écart sur ce document
              </span>
              <span className="flex flex-col items-end">
                <span className="font-display text-[22px] leading-none font-semibold tracking-tight text-brand-orange-light tabular-nums">
                  {euroDelta(euroImpact)}
                </span>
                <span className="mt-1 text-[12px] text-muted-foreground">
                  {signedPct(
                    ups.reduce((s, r) => s + r.pct, 0) / (ups.length || 1),
                  )}{" "}
                  en moyenne
                </span>
              </span>
            </div>
          </LandingFrame>
        </div>

        <p className="text-center text-[15px] text-muted-foreground sm:text-base">
          {DEMO_NOTE} {SUPPLIERS_DISCLAIMER}
        </p>
      </Tabs>
    </SectionEnter>
  );
}
