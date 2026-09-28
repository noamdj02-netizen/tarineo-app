import React from "react";
import { Document, Page, View, Text, renderToBuffer } from "@react-pdf/renderer";
import { MENTIONS_RETARD_PAIEMENT } from "@/lib/metier/pdf/mentions";
import {
  BlocAssurance,
  BlocClient,
  BlocConditionsPaiement,
  BlocTotaux,
  EnTeteEntreprise,
  PiedDePage,
  TableauLignes,
  formaterDate,
  stylesPdfCommun,
  type EntrepriseInfoPdf,
  type LigneDocumentPdf,
} from "@/lib/metier/pdf/pdf-clients";

export type PiecePdfKind = "devis" | "facture" | "bon_commande" | "bon_enlevement";

export type PiecePdfDonnees = {
  kind: PiecePdfKind;
  numero: string;
  dateEmission: Date;
  dateEcheance?: Date;
  dureeValiditeJours?: number;
  conditionsPaiement: string;
  clientNom: string;
  clientAdresse: string | null;
  chantier?: string | null;
  lignes: LigneDocumentPdf[];
  totalHt: number;
  totalTva: number;
  totalTtc: number;
  numeroOrigine?: string | null;
};

const TITRES: Record<PiecePdfKind, string> = {
  devis: "DEVIS",
  facture: "FACTURE",
  bon_commande: "BON DE COMMANDE",
  bon_enlevement: "BON D’ENLÈVEMENT",
};

function PieceDocument({ entreprise, piece }: { entreprise: EntrepriseInfoPdf; piece: PiecePdfDonnees }) {
  const titre = TITRES[piece.kind];
  const validite = piece.dureeValiditeJours
    ? new Date(piece.dateEmission.getTime() + piece.dureeValiditeJours * 86400000)
    : null;
  const avecSignature = piece.kind === "devis" || piece.kind === "bon_commande";
  const avecRetard = piece.kind === "facture";

  return (
    <Document title={`${titre} ${piece.numero}`}>
      <Page size="A4" style={stylesPdfCommun.page}>
        <View style={stylesPdfCommun.entete}>
          <EnTeteEntreprise entreprise={entreprise} />
          <View>
            <Text style={stylesPdfCommun.blocTitreDocument}>{titre}</Text>
            <Text style={stylesPdfCommun.blocInfoDocument}>N° {piece.numero}</Text>
            <Text style={stylesPdfCommun.blocInfoDocument}>Émis le {formaterDate(piece.dateEmission)}</Text>
            {validite ? (
              <Text style={stylesPdfCommun.blocInfoDocument}>Valable jusqu’au {formaterDate(validite)}</Text>
            ) : null}
            {piece.dateEcheance ? (
              <Text style={stylesPdfCommun.blocInfoDocument}>Échéance le {formaterDate(piece.dateEcheance)}</Text>
            ) : null}
            {piece.numeroOrigine ? (
              <Text style={stylesPdfCommun.blocInfoDocument}>Suite au document n° {piece.numeroOrigine}</Text>
            ) : null}
            {piece.chantier ? <Text style={stylesPdfCommun.blocInfoDocument}>{piece.chantier}</Text> : null}
          </View>
        </View>

        <BlocClient nom={piece.clientNom} adresse={piece.clientAdresse} />
        <TableauLignes lignes={piece.lignes} />
        <BlocTotaux entreprise={entreprise} totalHt={piece.totalHt} totalTva={piece.totalTva} totalTtc={piece.totalTtc} />
        <BlocAssurance entreprise={entreprise} />
        <BlocConditionsPaiement conditionsPaiement={piece.conditionsPaiement} />
        {avecRetard ? (
          <View style={stylesPdfCommun.sectionConditions}>
            <Text style={{ fontFamily: "Helvetica-Bold" }}>Retard de paiement</Text>
            <Text>{MENTIONS_RETARD_PAIEMENT}</Text>
          </View>
        ) : null}

        {avecSignature ? (
          <View style={stylesPdfCommun.sectionSignature}>
            <View style={stylesPdfCommun.blocSignature}>
              <Text>Date :</Text>
              <View style={stylesPdfCommun.ligneSignature} />
            </View>
            <View style={stylesPdfCommun.blocSignature}>
              <Text>Bon pour accord — Signature :</Text>
              <View style={stylesPdfCommun.ligneSignature} />
            </View>
          </View>
        ) : null}

        <PiedDePage entreprise={entreprise} libelleDocument={titre} numero={piece.numero} />
      </Page>
    </Document>
  );
}

export async function genererPdfPiece(entreprise: EntrepriseInfoPdf, piece: PiecePdfDonnees): Promise<Buffer> {
  return renderToBuffer(<PieceDocument entreprise={entreprise} piece={piece} />);
}
