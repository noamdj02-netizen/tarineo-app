"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { MoreHorizontal } from "lucide-react";

import {
  LandingStatusBadge,
  type StatusState,
} from "@/components/site/landing-v2/components/ui/LandingStatusBadge";
import { Badge } from "@/components/site/landing-v2/components/ui/Badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DEMO_MARK } from "@/lib/site/tarineo";
import { cn } from "@/lib/utils";

type RelanceKind = "commercial" | "client";

type Row = {
  id: string;
  label: string;
  contact: string;
  kind: RelanceKind;
  status: StatusState;
  resolvedAt?: number;
};

const RESOLVED: ReadonlySet<StatusState> = new Set(["success", "failed"]);
const STATUS_CYCLE: StatusState[] = ["pending", "success", "failed"];

function cycleStatus(current: StatusState): StatusState {
  return STATUS_CYCLE[(STATUS_CYCLE.indexOf(current) + 1) % STATUS_CYCLE.length]!;
}

function sortRows(rows: Row[]): Row[] {
  return [...rows].sort((a, b) => {
    const aResolved = RESOLVED.has(a.status);
    const bResolved = RESOLVED.has(b.status);
    if (aResolved && !bResolved) return -1;
    if (!aResolved && bResolved) return 1;
    if (aResolved && bResolved) return (b.resolvedAt ?? 0) - (a.resolvedAt ?? 0);
    return 0;
  });
}

const INITIAL_ROWS: Row[] = [
  {
    id: "a",
    label: "Négocier hausse chauffe-eau",
    contact: "Cedeo",
    kind: "commercial",
    status: "pending",
  },
  {
    id: "b",
    label: "Devis SDB à valider",
    contact: "Dupont",
    kind: "client",
    status: "pending",
  },
  {
    id: "c",
    label: "Écart prix câble U1000",
    contact: "Rexel",
    kind: "commercial",
    status: "pending",
  },
  {
    id: "d",
    label: "Relance devis cuisine",
    contact: "Benali",
    kind: "client",
    status: "pending",
  },
];

const KIND_LABEL: Record<RelanceKind, string> = {
  commercial: "Fournisseur",
  client: "Client",
};

const ROW_VARIANTS = {
  initial: { opacity: 0, y: -6 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.22, ease: [0.25, 0.1, 0.25, 1] as const },
  },
  exit: {
    opacity: 0,
    y: 6,
    transition: { duration: 0.18, ease: [0.25, 0.1, 0.25, 1] as const },
  },
};

const LAYOUT_TRANSITION = {
  type: "spring" as const,
  stiffness: 380,
  damping: 32,
};

const MotionTableRow = motion.create(TableRow);

/** Tableau relances commerciales & clients — exemple landing. */
export function LandingRelanceTable({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  const [rows, setRows] = useState<Row[]>(INITIAL_ROWS);

  useEffect(() => {
    if (reduce) {
      setRows([
        { ...INITIAL_ROWS[0]!, status: "success", resolvedAt: 3 },
        { ...INITIAL_ROWS[1]!, status: "pending" },
        { ...INITIAL_ROWS[2]!, status: "failed", resolvedAt: 2 },
        { ...INITIAL_ROWS[3]!, status: "success", resolvedAt: 1 },
      ]);
      return;
    }

    let cursor = 0;
    const id = window.setInterval(() => {
      setRows((prev) => {
        const index = cursor % prev.length;
        cursor += 1;
        return prev.map((row, i) => {
          if (i !== index) return row;
          const next = cycleStatus(row.status);
          return {
            ...row,
            status: next,
            resolvedAt: RESOLVED.has(next) ? Date.now() : undefined,
          };
        });
      });
    }, 1400);

    return () => window.clearInterval(id);
  }, [reduce]);

  const sorted = sortRows(rows);

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-line bg-paper-0 shadow-float ring-1 ring-ink-900/[0.04]",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-3.5">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold tracking-tight text-ink-900">
              Relances commerciales & clients
            </p>
            <Badge tone="accent" size="sm">
              {DEMO_MARK}
            </Badge>
          </div>
          <p className="mt-0.5 text-xs text-ink-400">
            Fournisseurs à négocier · devis clients à suivre
          </p>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="border-line hover:bg-transparent">
            <TableHead className="w-[min(48%,14rem)] pl-5 text-ink-400">Action</TableHead>
            <TableHead className="hidden w-[6.5rem] text-ink-400 sm:table-cell">Type</TableHead>
            <TableHead className="hidden w-[6rem] text-ink-400 md:table-cell">Contact</TableHead>
            <TableHead className="w-[8.5rem] text-ink-400">Statut</TableHead>
            <TableHead className="w-10 pr-4" />
          </TableRow>
        </TableHeader>
        <TableBody>
          <AnimatePresence initial={false}>
            {sorted.map((row) => (
              <MotionTableRow
                key={row.id}
                layoutId={row.id}
                layout="position"
                transition={LAYOUT_TRANSITION}
                variants={ROW_VARIANTS}
                initial="initial"
                animate="animate"
                exit="exit"
                className="border-line/80 hover:bg-paper-50/80"
              >
                <TableCell className="py-3.5 pl-5 text-sm font-medium text-ink-800">
                  <span className="line-clamp-2 sm:line-clamp-1">{row.label}</span>
                  <span className="mt-0.5 block text-xs font-normal text-ink-400 sm:hidden">
                    {KIND_LABEL[row.kind]} · {row.contact}
                  </span>
                </TableCell>
                <TableCell className="hidden py-3.5 sm:table-cell">
                  <Badge
                    tone={row.kind === "commercial" ? "muted" : "outline"}
                    size="sm"
                  >
                    {KIND_LABEL[row.kind]}
                  </Badge>
                </TableCell>
                <TableCell className="hidden py-3.5 text-sm text-ink-500 md:table-cell">
                  {row.contact}
                </TableCell>
                <TableCell className="py-3.5">
                  <LandingStatusBadge state={row.status} />
                </TableCell>
                <TableCell className="py-3.5 pr-4 text-ink-300" aria-hidden>
                  <MoreHorizontal size={16} strokeWidth={1.75} />
                </TableCell>
              </MotionTableRow>
            ))}
          </AnimatePresence>
        </TableBody>
      </Table>
    </div>
  );
}
