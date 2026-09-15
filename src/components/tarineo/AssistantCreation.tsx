"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageCard, PageHeader, SearchField } from "@/components/tarineo/PageHeader";
import { WizardSteps } from "@/components/tarineo/WizardSteps";
import { StatusBadge } from "@/components/tarineo/StatusBadge";
import { BtnBlue, BtnGhost, BtnOrangeOutline, BtnPrimary } from "@/components/tarineo/Actions";
import { IconCalendar } from "@/components/tarineo/NavIcons";
import { DataTable, TableCell, TableRow } from "@/components/tarineo/DataTable";
import { DEMO_DEVIS_LIGNES, formaterEurosDemo } from "@/lib/uiDemo";
import { Input } from "@/components/ui/input";

const STEPS = ["Client", "Chantier", "Prestations", "Aperçu"];

export function AssistantCreation({
  titre,
  variante,
}: {
  titre: string;
  variante: "devis" | "facture";
}) {
  const router = useRouter();
  const [etape, setEtape] = useState(1);
  const [clientChoisi, setClientChoisi] = useState(variante === "facture");

  function continuer() {
    if (etape < 4) setEtape(etape + 1);
    else router.push(variante === "devis" ? "/devis-clients/dv-2026-001" : "/factures-clients/fa-2026-012");
  }

  return (
    <div>
      <PageHeader title={titre} />
      <WizardSteps steps={STEPS} actif={etape} />

      {etape === 1 && (
        <div className="flex flex-col gap-5">
          <PageCard>
            <h2 className="mb-4 text-base font-semibold text-[#172935]">Informations client</h2>
            <div className="flex flex-col gap-3 sm:flex-row">
              <SearchField placeholder="Rechercher un client..." className="flex-1" />
              <BtnBlue className="shrink-0">+ Nouveau client</BtnBlue>
            </div>
            <div className="mt-4 flex flex-col gap-3 rounded-[20px] border border-[#EEE] p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-full bg-[#EEF1FF] text-sm font-semibold text-[#3B6AE1]">
                  {variante === "facture" ? "D" : "C"}
                </div>
                <div>
                  <p className="flex flex-wrap items-center gap-2 font-medium text-[#172935]">
                    {variante === "facture" ? "Dupont Rénovation" : "Cedeo"}
                    <StatusBadge statut="actif" />
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {variante === "facture" ? "SIRET 812 345 678 00012 · Paris" : "SIRET 812 345 678 00012 · 75011 Paris"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <BtnOrangeOutline className="h-10 px-4" onClick={() => setClientChoisi(true)}>
                  {clientChoisi ? "Sélectionné" : "Sélectionner"}
                </BtnOrangeOutline>
                <button type="button" className="grid size-8 place-items-center text-muted-foreground" aria-label="Retirer">
                  ×
                </button>
              </div>
            </div>
          </PageCard>

          {variante === "devis" ? (
            <PageCard>
              <h2 className="mb-4 text-base font-semibold text-[#172935]">Informations du chantier</h2>
              <div className="grid gap-4 sm:grid-cols-3">
                <Champ label="Adresse du chantier" placeholder="12 Rue des Lilas" className="sm:col-span-3" />
                <Champ label="Code postal" placeholder="75011" />
                <Champ label="Ville" placeholder="Paris" />
                <Champ label="Description (optionnel)" placeholder="Ex : Rénovation salle de bain" className="sm:col-span-3" />
              </div>
            </PageCard>
          ) : (
            <div className="grid gap-5 lg:grid-cols-2">
              <PageCard>
                <h2 className="mb-4 text-base font-semibold text-[#172935]">Informations de facturation</h2>
                <div className="grid gap-4 sm:grid-cols-3">
                  <Champ label="Adresse de facturation" placeholder="12 Rue des Lilas" className="sm:col-span-3" />
                  <Champ label="Code postal" placeholder="75011" />
                  <Champ label="Ville" placeholder="Paris" />
                  <Champ label="Référence (optionnelle)" placeholder="Ex : FACT-2026-001" />
                  <Champ label="Message (optionnel)" placeholder="Ex : Merci pour votre confiance." className="sm:col-span-2" />
                </div>
              </PageCard>
              <PageCard>
                <h2 className="mb-4 text-base font-semibold text-[#172935]">Informations complémentaires</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <ChampDate label="Date de facturation" value="11 septembre 2026" />
                  <ChampDate label="Échéance de paiement" value="11 octobre 2026" />
                  <div>
                    <label className="mb-1 block text-xs text-muted-foreground">Mode de paiement</label>
                    <select className="h-11 w-full rounded-xl border border-[#E6E9EB] bg-white px-3 text-sm">
                      <option>Virement bancaire</option>
                      <option>Chèque</option>
                      <option>Espèces</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-muted-foreground">TVA par défaut</label>
                    <select className="h-11 w-full rounded-xl border border-[#E6E9EB] bg-white px-3 text-sm">
                      <option>20%</option>
                      <option>10%</option>
                      <option>5,5%</option>
                    </select>
                  </div>
                </div>
              </PageCard>
            </div>
          )}
        </div>
      )}

      {etape === 2 && (
        <PageCard>
          <h2 className="mb-4 text-base font-semibold">Informations du chantier</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <Champ label="Adresse du chantier" placeholder="12 Rue des Lilas" className="sm:col-span-3" />
            <Champ label="Code postal" placeholder="75011" />
            <Champ label="Ville" placeholder="Paris" />
            <Champ label="Description (optionnel)" placeholder="Rénovation salle de bain" className="sm:col-span-3" />
          </div>
        </PageCard>
      )}

      {etape === 3 && (
        <PageCard>
          <h2 className="mb-4 text-base font-semibold">Prestations</h2>
          <DataTable columns={["Désignation", "Quantité", "Prix unitaire HT", "TVA", "Total HT"]}>
            {DEMO_DEVIS_LIGNES.map((l) => (
              <TableRow key={l.designation}>
                <TableCell>{l.designation}</TableCell>
                <TableCell>{l.quantite} m²</TableCell>
                <TableCell>{l.pu.toFixed(2).replace(".", ",")} €</TableCell>
                <TableCell>{l.tva}%</TableCell>
                <TableCell>{formaterEurosDemo(l.total)}</TableCell>
              </TableRow>
            ))}
          </DataTable>
        </PageCard>
      )}

      {etape === 4 && (
        <PageCard>
          <h2 className="mb-4 text-base font-semibold">Aperçu</h2>
          <p className="text-sm text-muted-foreground">
            {variante === "facture" ? "Dupont Rénovation" : "Cedeo"} · Rénovation salle de bain
          </p>
          <div className="mt-6 ml-auto flex w-full max-w-xs flex-col gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total HT</span>
              <span>1 240 €</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">TVA</span>
              <span>248 €</span>
            </div>
            <div className="flex justify-between text-base font-semibold">
              <span>Total TTC</span>
              <span>1 488 €</span>
            </div>
          </div>
        </PageCard>
      )}

      <div className="mt-6 flex items-center justify-between">
        {etape === 1 ? (
          <BtnGhost href={variante === "devis" ? "/devis-clients" : "/factures-clients"}>Retour</BtnGhost>
        ) : (
          <BtnGhost onClick={() => setEtape(etape - 1)}>Retour</BtnGhost>
        )}
        <BtnPrimary onClick={continuer}>Continuer →</BtnPrimary>
      </div>
    </div>
  );
}

function Champ({ label, placeholder, className }: { label: string; placeholder: string; className?: string }) {
  return (
    <div className={className}>
      <label className="mb-1 block text-xs text-muted-foreground">{label}</label>
      <Input placeholder={placeholder} defaultValue={placeholder.startsWith("Ex") ? "" : placeholder} className="h-11 rounded-xl" />
    </div>
  );
}

function ChampDate({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="mb-1 block text-xs text-muted-foreground">{label}</label>
      <div className="relative">
        <Input defaultValue={value} className="h-11 rounded-xl pr-10" />
        <IconCalendar className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
      </div>
    </div>
  );
}
