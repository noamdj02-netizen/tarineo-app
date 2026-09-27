import { MENTION_FRANCHISE_TVA, MENTIONS_RETARD_PAIEMENT } from "@/lib/metier/pdf/mentions";
import type { EntrepriseInfoPdf } from "@/lib/metier/pdf/pdf-clients";
import {
  PIECE_TITRES,
  assuranceRenseignee,
  entrepriseFromCompany,
  formaterDate,
  formaterEuros,
  pieceDonneesFromDocument,
} from "@/lib/metier/pdf/piece-model";
import type { CompanyProfile } from "@/lib/metier/company";
import type { DocumentCard } from "@/lib/metier/types";
import { cn } from "@/lib/utils";

export function DocumentPreview({
  doc,
  company,
  logoUrl,
  size = "full",
}: {
  doc: DocumentCard;
  company?: CompanyProfile | null;
  logoUrl?: string | null;
  size?: "thumb" | "full";
}) {
  const entreprise = entrepriseFromCompany(company, null, logoUrl);
  const piece = pieceDonneesFromDocument(doc, entreprise);
  const titre = PIECE_TITRES[piece.kind];
  const validite = piece.dureeValiditeJours
    ? new Date(piece.dateEmission.getTime() + piece.dureeValiditeJours * 86400000)
    : null;
  const thumb = size === "thumb";
  const avecSignature = piece.kind === "devis" || piece.kind === "bon_commande";
  const avecRetard = piece.kind === "facture";

  return (
    <article
      className={cn(
        "relative overflow-hidden bg-white text-[#1a1a1a] shadow-[0_18px_50px_rgba(20,16,12,0.12)]",
        thumb ? "pointer-events-none aspect-[210/297] select-none" : "mx-auto w-full max-w-[210mm]",
      )}
    >
      <div
        className={cn(
          "box-border flex flex-col px-10 py-10 text-[9px] leading-snug",
          thumb
            ? "absolute top-0 left-0 h-[297mm] w-[210mm] origin-top-left scale-[0.34]"
            : "min-h-[297mm] w-full",
        )}
        style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
      >
        <AlanSheet
          entreprise={entreprise}
          titre={titre}
          numero={piece.numero}
          dateEmission={piece.dateEmission}
          validite={validite}
          dateEcheance={piece.dateEcheance}
          numeroOrigine={piece.numeroOrigine}
          chantier={piece.chantier}
          clientNom={piece.clientNom}
          clientAdresse={piece.clientAdresse}
          lignes={piece.lignes}
          totalHt={piece.totalHt}
          totalTva={piece.totalTva}
          totalTtc={piece.totalTtc}
          conditionsPaiement={piece.conditionsPaiement}
          avecSignature={avecSignature}
          avecRetard={avecRetard}
        />
      </div>
    </article>
  );
}

function AlanSheet({
  entreprise,
  titre,
  numero,
  dateEmission,
  validite,
  dateEcheance,
  numeroOrigine,
  chantier,
  clientNom,
  clientAdresse,
  lignes,
  totalHt,
  totalTva,
  totalTtc,
  conditionsPaiement,
  avecSignature,
  avecRetard,
}: {
  entreprise: EntrepriseInfoPdf;
  titre: string;
  numero: string;
  dateEmission: Date;
  validite: Date | null;
  dateEcheance?: Date;
  numeroOrigine?: string | null;
  chantier?: string | null;
  clientNom: string;
  clientAdresse: string | null;
  lignes: { designation: string; quantite: number; prixUnitaireHt: number; tauxTva: number; totalHt: number }[];
  totalHt: number;
  totalTva: number;
  totalTtc: number;
  conditionsPaiement: string;
  avecSignature: boolean;
  avecRetard: boolean;
}) {
  return (
    <>
      <header className="mb-6 flex items-start justify-between gap-6">
        <div className="min-w-0">
          {entreprise.logoDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={entreprise.logoDataUrl} alt="" className="mb-2 max-h-[70px] w-[120px] object-contain" />
          ) : null}
          <p className="mb-0.5 text-[13px] font-bold">{entreprise.raisonSociale}</p>
          {entreprise.formeJuridique ? <p className="text-[8px] text-[#444]">{entreprise.formeJuridique}</p> : null}
          <p className="text-[8px] text-[#444]">
            {entreprise.adresseRue} — {entreprise.adresseCodePostal} {entreprise.adresseVille}
          </p>
          <p className="text-[8px] text-[#444]">SIRET : {entreprise.siret}</p>
          {entreprise.registreImmatriculation ? (
            <p className="text-[8px] text-[#444]">{entreprise.registreImmatriculation}</p>
          ) : null}
          <p className="text-[8px] text-[#444]">
            {entreprise.telephone} — {entreprise.emailContact}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="mb-1 text-[16px] font-bold">{titre}</p>
          <p className="text-[9px] text-[#444]">N° {numero}</p>
          <p className="text-[9px] text-[#444]">Émis le {formaterDate(dateEmission)}</p>
          {validite ? <p className="text-[9px] text-[#444]">Valable jusqu’au {formaterDate(validite)}</p> : null}
          {dateEcheance ? <p className="text-[9px] text-[#444]">Échéance le {formaterDate(dateEcheance)}</p> : null}
          {numeroOrigine ? <p className="text-[9px] text-[#444]">Suite au document n° {numeroOrigine}</p> : null}
          {chantier ? <p className="text-[9px] text-[#444]">{chantier}</p> : null}
        </div>
      </header>

      <div className="mb-5 ml-auto min-w-[220px] self-end rounded-[3px] bg-[#f5f5f5] p-2.5">
        <p className="mb-1 text-[8px] text-[#666] uppercase">Client</p>
        <p className="font-bold">{clientNom}</p>
        {clientAdresse ? <p className="text-[8px] text-[#444]">{clientAdresse}</p> : null}
      </div>

      <table className="mt-2 w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-[#1a1a1a] text-[8px] font-bold text-[#666] uppercase">
            <th className="w-[40%] pb-1 font-bold">Désignation</th>
            <th className="w-[12%] pb-1 text-right font-bold">Qté</th>
            <th className="w-[16%] pb-1 text-right font-bold">PU HT</th>
            <th className="w-[12%] pb-1 text-right font-bold">TVA</th>
            <th className="w-[20%] pb-1 text-right font-bold">Total HT</th>
          </tr>
        </thead>
        <tbody>
          {lignes.map((ligne, i) => (
            <tr key={`${ligne.designation}-${i}`} className="border-b border-[#ddd]">
              <td className="py-1.5 pr-2">{ligne.designation}</td>
              <td className="py-1.5 text-right">{ligne.quantite}</td>
              <td className="py-1.5 text-right">{formaterEuros(ligne.prixUnitaireHt)}</td>
              <td className="py-1.5 text-right">{ligne.tauxTva}%</td>
              <td className="py-1.5 text-right">{formaterEuros(ligne.totalHt)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 ml-auto min-w-[220px]">
        <p className="flex justify-between py-0.5">
          <span>Total HT</span>
          <span>{formaterEuros(totalHt)}</span>
        </p>
        {entreprise.regimeTva === "NORMAL" ? (
          <p className="flex justify-between py-0.5">
            <span>TVA</span>
            <span>{formaterEuros(totalTva)}</span>
          </p>
        ) : null}
        <p className="mt-1 flex justify-between border-t border-[#1a1a1a] pt-1.5 text-[12px] font-bold">
          <span>Total TTC</span>
          <span>{formaterEuros(totalTtc)}</span>
        </p>
      </div>
      {entreprise.regimeTva === "FRANCHISE_293B" ? (
        <p className="mt-4 text-[8px] text-[#444] italic">{MENTION_FRANCHISE_TVA}</p>
      ) : null}

      {assuranceRenseignee(entreprise) ? (
        <div className="mt-5 text-[8px] leading-normal text-[#444]">
          <p className="font-bold">Assurance professionnelle</p>
          <p>
            {entreprise.assuranceNom} — {entreprise.assuranceAdresse}
          </p>
          <p>Contrat n° {entreprise.assuranceNumeroContrat}</p>
          <p>Activités garanties : {entreprise.assuranceActivitesGaranties}</p>
          <p>Zone géographique : {entreprise.assuranceZoneGeographique}</p>
        </div>
      ) : null}

      <div className="mt-5 text-[8px] leading-normal text-[#444]">
        <p className="font-bold">Conditions de paiement</p>
        <p>{conditionsPaiement}</p>
      </div>
      {avecRetard ? (
        <div className="mt-5 text-[8px] leading-normal text-[#444]">
          <p className="font-bold">Retard de paiement</p>
          <p>{MENTIONS_RETARD_PAIEMENT}</p>
        </div>
      ) : null}

      {avecSignature ? (
        <div className="mt-9 flex justify-between">
          <div className="w-[220px]">
            <p>Date :</p>
            <div className="mt-10 border-t border-[#999]" />
          </div>
          <div className="w-[220px]">
            <p>Bon pour accord — Signature :</p>
            <div className="mt-10 border-t border-[#999]" />
          </div>
        </div>
      ) : null}

      <p className="mt-auto pt-8 text-center text-[7px] text-[#999]">
        {entreprise.raisonSociale} — SIRET {entreprise.siret} — {titre} {numero}
      </p>
    </>
  );
}
