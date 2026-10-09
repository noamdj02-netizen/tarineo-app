"use client";

import { LANDING_SIGNUP } from "@/lib/site/landing-v2-auth";
import { proofTable } from "@/lib/site/landing-v2-content";
import { LandingSection } from "@/components/site/landing-v2/components/layout/LandingSection";
import { Badge } from "@/components/site/landing-v2/components/ui/Badge";
import { Button } from "@/components/site/landing-v2/components/ui/Button";
import { LandingDeltaBar } from "@/components/site/landing-v2/components/ui/LandingDeltaBar";
import { LandingPanelFooter } from "@/components/site/landing-v2/components/ui/LandingPanelFooter";
import { LandingProductFrame } from "@/components/site/landing-v2/components/ui/LandingProductFrame";
import { SectionHeading } from "@/components/site/landing-v2/components/ui/SectionLabel";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function ProofTable() {
  return (
    <LandingSection id="preuve" bleed>
      <div className="shell">
        <SectionHeading
          label="Preuve"
          title="Chaque ligne, comparée à vos prix habituels."
        />

        <LandingProductFrame
          title={`${proofTable.supplier} · ${proofTable.reference}`}
          className="mt-12 landing-surface-glow shadow-float"
          footer={
            <LandingPanelFooter>
              <div>
                <p className="text-xs uppercase tracking-wide text-ink-400">Total estimé</p>
                <p className="mt-1 text-lg font-semibold text-ink-900 nums">{proofTable.overcost}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  href={LANDING_SIGNUP}
                  variant="secondary"
                  size="sm"
                  className="min-h-11"
                >
                  Valider
                  <span className="sr-only"> — exemple, créer un compte</span>
                </Button>
                <Button href={LANDING_SIGNUP} size="sm" className="min-h-11">
                  Renégocier
                  <span className="sr-only"> — exemple, créer un compte</span>
                </Button>
              </div>
            </LandingPanelFooter>
          }
        >
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-3 sm:px-6">
            <Badge tone="muted">{proofTable.exampleLabel}</Badge>
            <p className="text-xs text-ink-400">Comparaison à l’historique d’achat</p>
          </div>

          <div className="overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch]">
          <Table className="min-w-[36rem]">
            <caption className="sr-only">
              Exemple de comparaison des lignes d’un devis fournisseur avec vos prix habituels
            </caption>
            <TableHeader className="bg-paper-50 [&_tr]:border-line">
              <TableRow className="hover:bg-transparent">
                <TableHead className="px-4 text-[11px] uppercase tracking-wider text-ink-400 sm:px-6">
                  Réf.
                </TableHead>
                <TableHead className="text-[11px] uppercase tracking-wider text-ink-400">Article</TableHead>
                <TableHead className="text-[11px] uppercase tracking-wider text-ink-400">Payé</TableHead>
                <TableHead className="text-[11px] uppercase tracking-wider text-ink-400">Habituel</TableHead>
                <TableHead className="px-4 text-[11px] uppercase tracking-wider text-ink-400 sm:px-6">
                  Écart
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {proofTable.lines.map((line) => (
                <TableRow key={line.ref} className="border-line hover:bg-accent-soft/30">
                  <TableCell className="px-4 font-mono text-xs text-ink-400 sm:px-6">{line.ref}</TableCell>
                  <TableCell className="max-w-[12rem] font-medium whitespace-normal text-ink-900 sm:max-w-none">
                    {line.label}
                  </TableCell>
                  <TableCell className="nums text-ink-900">{line.paid}</TableCell>
                  <TableCell className="nums text-ink-400">{line.usual}</TableCell>
                  <TableCell className="px-4 sm:px-6">
                    <LandingDeltaBar status={line.status} delta={line.delta} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>
        </LandingProductFrame>
      </div>
    </LandingSection>
  );
}
