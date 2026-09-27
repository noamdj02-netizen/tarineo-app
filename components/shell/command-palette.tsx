"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CornerDownLeft, CreditCard, Search, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { TarineoHdMascot } from "@/components/tarineo-hd-mascot";
import { EASE } from "@/components/motion/reveal";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TABS } from "@/lib/nav";
import { cn } from "@/lib/utils";

function normalize(s: string) {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

/** Recherche ⌘K : aller vite à n'importe quel onglet (les projets s'ajouteront à l'étape 3). */
export function useCommandPalette() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    // ouverte aussi par le raccourci « Rechercher » de la barre mobile
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("navpit:search", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("navpit:search", onOpen);
    };
  }, []);
  return { open, setOpen };
}

export function CommandPalette({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const extras = useMemo(
    () => [
      { href: "/compte#configuration", label: "Configuration initiale", icon: User },
      { href: "/compte", label: "Compte", icon: User },
      { href: "/entreprise", label: "Mon entreprise", icon: User },
      { href: "/abonnement", label: "Tarifs", icon: CreditCard },
      { href: "/onboarding", label: "Onboarding guidé", icon: User },
    ],
    [],
  );
  const results = useMemo(() => {
    const all = [...TABS, ...extras];
    const n = normalize(q.trim());
    return n ? all.filter((t) => normalize(t.label).includes(n)) : all;
  }, [q, extras]);

  const close = useCallback(() => {
    setQ("");
    setSel(0);
    onClose();
  }, [onClose]);

  const go = useCallback(
    (href: string) => {
      close();
      router.push(href);
    },
    [close, router],
  );

  useEffect(() => {
    if (open) requestAnimationFrame(() => inputRef.current?.focus());
  }, [open]);

  // Portail vers <body> : le flou (backdrop-filter) de la barre du haut piégerait le « fixed ».
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") close();
    else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSel((s) => Math.min(s + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSel((s) => Math.max(s - 1, 0));
    } else if (e.key === "Enter" && results[sel]) {
      e.preventDefault();
      go(results[sel].href);
    }
  }

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-start justify-center bg-ink/20 px-4 pt-[12vh] backdrop-blur-[3px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onMouseDown={(e) => e.target === e.currentTarget && close()}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Recherche"
            className="card-soft w-full max-w-lg overflow-hidden"
            initial={{ opacity: 0, y: 14, filter: "blur(6px)", scale: 0.98 }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)", scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.35, ease: EASE }}
            onKeyDown={onKeyDown}
          >
            <div className="flex items-center gap-3 border-b border-line px-4 py-1">
              <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden />
              <Input
                ref={inputRef}
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setSel(0);
                }}
                placeholder="Aller à…"
                aria-label="Rechercher un onglet"
                className="min-h-11 flex-1 border-0 bg-transparent text-[15px] shadow-none focus-visible:ring-0"
              />
              <kbd className="rounded-md border border-line px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                ÉCHAP
              </kbd>
            </div>
            <ScrollArea className="max-h-[50vh]">
            <ul
              className="p-2"
              role="listbox"
              aria-label="Résultats"
            >
              {results.length === 0 ? (
                <li className="flex flex-col items-center gap-1 px-3 py-5 text-center text-sm text-muted-foreground">
                  <TarineoHdMascot name="06-loupe" className="h-16 w-20" label="" />
                  Rien trouvé.
                </li>
              ) : (
                results.map(({ href, label, icon: Icon }, i) => (
                  <li key={href} role="option" aria-selected={i === sel}>
                    <button
                      type="button"
                      onMouseEnter={() => setSel(i)}
                      onClick={() => go(href)}
                      className={cn(
                        "flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-[14px] transition-colors",
                        i === sel ? "bg-accent-soft text-ink" : "text-ink/80",
                      )}
                    >
                      <Icon className="size-4 text-muted-foreground" aria-hidden />
                      <span className="flex-1">{label}</span>
                      {i === sel ? (
                        <CornerDownLeft
                          className="size-3.5 text-muted-foreground"
                          aria-hidden
                        />
                      ) : null}
                    </button>
                  </li>
                ))
              )}
            </ul>
            </ScrollArea>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
