import React from "react";
import { View, Text, Image, StyleSheet, Font } from "@react-pdf/renderer";
import { MENTION_FRANCHISE_TVA, type RegimeTva } from "@/lib/metier/pdf/mentions";

/** Empêche @react-pdf/hyphenate d’importer `./en-us` (casse Node 20+ / Vercel). */
Font.registerHyphenationCallback((mot) => [mot]);

export const stylesPdfCommun = StyleSheet.create({
  page: { padding: 40, fontSize: 9, fontFamily: "Helvetica", color: "#1a1a1a" },
  entete: { flexDirection: "row", justifyContent: "space-between", marginBottom: 24 },
  logo: { width: 120, maxHeight: 70, objectFit: "contain", marginBottom: 8 },
  raisonSociale: { fontSize: 13, fontFamily: "Helvetica-Bold", marginBottom: 2 },
  ligneEntreprise: { fontSize: 8, color: "#444", marginBottom: 1 },
  blocTitreDocument: { fontSize: 16, fontFamily: "Helvetica-Bold", textAlign: "right", marginBottom: 4 },
  blocInfoDocument: { fontSize: 9, textAlign: "right", color: "#444", marginBottom: 1 },
  sectionClient: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: "#f5f5f5",
    borderRadius: 3,
    alignSelf: "flex-end",
    minWidth: 220,
  },
  sectionClientTitre: { fontSize: 8, color: "#666", marginBottom: 3, textTransform: "uppercase" },
  table: { marginTop: 8 },
  ligneEnTete: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#1a1a1a",
    paddingBottom: 4,
    marginBottom: 4,
  },
  ligne: { flexDirection: "row", borderBottomWidth: 0.5, borderBottomColor: "#ddd", paddingVertical: 5 },
  colDesignation: { flex: 4 },
  colQuantite: { flex: 1, textAlign: "right" },
  colPrixUnitaire: { flex: 1.3, textAlign: "right" },
  colTva: { flex: 0.8, textAlign: "right" },
  colTotal: { flex: 1.3, textAlign: "right" },
  enTeteTexte: { fontSize: 8, fontFamily: "Helvetica-Bold", textTransform: "uppercase", color: "#666" },
  blocTotaux: { marginTop: 16, alignSelf: "flex-end", minWidth: 220 },
  ligneTotal: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 2 },
  ligneTotalFinal: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 6,
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: "#1a1a1a",
  },
  totalFinalTexte: { fontSize: 12, fontFamily: "Helvetica-Bold" },
  mentionFranchise: { marginTop: 16, fontSize: 8, color: "#444" },
  sectionAssurance: { marginTop: 20, fontSize: 8, color: "#444", lineHeight: 1.5 },
  sectionConditions: { marginTop: 20, fontSize: 8, color: "#444", lineHeight: 1.5 },
  sectionSignature: { marginTop: 36, flexDirection: "row", justifyContent: "space-between" },
  blocSignature: { width: 220 },
  ligneSignature: { marginTop: 40, borderTopWidth: 0.5, borderTopColor: "#999" },
  piedDePage: {
    position: "absolute",
    bottom: 24,
    left: 40,
    right: 40,
    fontSize: 7,
    color: "#999",
    textAlign: "center",
  },
});

export type EntrepriseInfoPdf = {
  raisonSociale: string;
  siret: string;
  formeJuridique: string | null;
  adresseRue: string;
  adresseCodePostal: string;
  adresseVille: string;
  telephone: string;
  emailContact: string;
  regimeTva: RegimeTva;
  registreImmatriculation: string | null;
  assuranceNom: string | null;
  assuranceAdresse: string | null;
  assuranceNumeroContrat: string | null;
  assuranceActivitesGaranties: string | null;
  assuranceZoneGeographique: string | null;
  logoDataUrl: string | null;
};

export type LigneDocumentPdf = {
  designation: string;
  quantite: number;
  prixUnitaireHt: number;
  tauxTva: number;
  totalHt: number;
};

export const formaterEuros = (v: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(v);
export const formaterDate = (d: Date) =>
  d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

export function assuranceComplete(e: EntrepriseInfoPdf): boolean {
  return Boolean(
    e.assuranceNom && e.assuranceAdresse && e.assuranceNumeroContrat && e.assuranceActivitesGaranties && e.assuranceZoneGeographique,
  );
}

export function EnTeteEntreprise({ entreprise }: { entreprise: EntrepriseInfoPdf }) {
  return (
    <View>
      {entreprise.logoDataUrl?.startsWith("data:") ? (
        <Image src={entreprise.logoDataUrl} style={stylesPdfCommun.logo} />
      ) : null}
      <Text style={stylesPdfCommun.raisonSociale}>{entreprise.raisonSociale}</Text>
      {entreprise.formeJuridique ? <Text style={stylesPdfCommun.ligneEntreprise}>{entreprise.formeJuridique}</Text> : null}
      <Text style={stylesPdfCommun.ligneEntreprise}>
        {entreprise.adresseRue} — {entreprise.adresseCodePostal} {entreprise.adresseVille}
      </Text>
      <Text style={stylesPdfCommun.ligneEntreprise}>SIRET : {entreprise.siret}</Text>
      {entreprise.registreImmatriculation ? (
        <Text style={stylesPdfCommun.ligneEntreprise}>{entreprise.registreImmatriculation}</Text>
      ) : null}
      <Text style={stylesPdfCommun.ligneEntreprise}>
        {entreprise.telephone} — {entreprise.emailContact}
      </Text>
    </View>
  );
}

export function BlocClient({ nom, adresse }: { nom: string; adresse: string | null }) {
  return (
    <View style={stylesPdfCommun.sectionClient}>
      <Text style={stylesPdfCommun.sectionClientTitre}>Client</Text>
      <Text style={{ fontFamily: "Helvetica-Bold" }}>{nom}</Text>
      {adresse ? <Text style={stylesPdfCommun.ligneEntreprise}>{adresse}</Text> : null}
    </View>
  );
}

export function TableauLignes({ lignes }: { lignes: LigneDocumentPdf[] }) {
  return (
    <View style={stylesPdfCommun.table}>
      <View style={stylesPdfCommun.ligneEnTete}>
        <Text style={[stylesPdfCommun.colDesignation, stylesPdfCommun.enTeteTexte]}>Désignation</Text>
        <Text style={[stylesPdfCommun.colQuantite, stylesPdfCommun.enTeteTexte]}>Qté</Text>
        <Text style={[stylesPdfCommun.colPrixUnitaire, stylesPdfCommun.enTeteTexte]}>PU HT</Text>
        <Text style={[stylesPdfCommun.colTva, stylesPdfCommun.enTeteTexte]}>TVA</Text>
        <Text style={[stylesPdfCommun.colTotal, stylesPdfCommun.enTeteTexte]}>Total HT</Text>
      </View>
      {lignes.map((ligne, i) => (
        <View key={i} style={stylesPdfCommun.ligne}>
          <Text style={stylesPdfCommun.colDesignation}>{ligne.designation}</Text>
          <Text style={stylesPdfCommun.colQuantite}>{ligne.quantite}</Text>
          <Text style={stylesPdfCommun.colPrixUnitaire}>{formaterEuros(ligne.prixUnitaireHt)}</Text>
          <Text style={stylesPdfCommun.colTva}>{ligne.tauxTva}%</Text>
          <Text style={stylesPdfCommun.colTotal}>{formaterEuros(ligne.totalHt)}</Text>
        </View>
      ))}
    </View>
  );
}

export function BlocTotaux({
  entreprise,
  totalHt,
  totalTva,
  totalTtc,
}: {
  entreprise: EntrepriseInfoPdf;
  totalHt: number;
  totalTva: number;
  totalTtc: number;
}) {
  return (
    <>
      <View style={stylesPdfCommun.blocTotaux}>
        <View style={stylesPdfCommun.ligneTotal}>
          <Text>Total HT</Text>
          <Text>{formaterEuros(totalHt)}</Text>
        </View>
        {entreprise.regimeTva === "NORMAL" ? (
          <View style={stylesPdfCommun.ligneTotal}>
            <Text>TVA</Text>
            <Text>{formaterEuros(totalTva)}</Text>
          </View>
        ) : null}
        <View style={stylesPdfCommun.ligneTotalFinal}>
          <Text style={stylesPdfCommun.totalFinalTexte}>Total TTC</Text>
          <Text style={stylesPdfCommun.totalFinalTexte}>{formaterEuros(totalTtc)}</Text>
        </View>
      </View>
      {entreprise.regimeTva === "FRANCHISE_293B" ? (
        <Text style={stylesPdfCommun.mentionFranchise}>{MENTION_FRANCHISE_TVA}</Text>
      ) : null}
    </>
  );
}

export function BlocAssurance({ entreprise }: { entreprise: EntrepriseInfoPdf }) {
  if (!assuranceComplete(entreprise)) return null;
  return (
    <View style={stylesPdfCommun.sectionAssurance}>
      <Text style={{ fontFamily: "Helvetica-Bold" }}>Assurance professionnelle</Text>
      <Text>
        {entreprise.assuranceNom} — {entreprise.assuranceAdresse}
      </Text>
      <Text>Contrat n° {entreprise.assuranceNumeroContrat}</Text>
      <Text>Activités garanties : {entreprise.assuranceActivitesGaranties}</Text>
      <Text>Zone géographique : {entreprise.assuranceZoneGeographique}</Text>
    </View>
  );
}

export function BlocConditionsPaiement({ conditionsPaiement }: { conditionsPaiement: string }) {
  return (
    <View style={stylesPdfCommun.sectionConditions}>
      <Text style={{ fontFamily: "Helvetica-Bold" }}>Conditions de paiement</Text>
      <Text>{conditionsPaiement}</Text>
    </View>
  );
}

export function PiedDePage({
  entreprise,
  libelleDocument,
  numero,
}: {
  entreprise: EntrepriseInfoPdf;
  libelleDocument: string;
  numero: string;
}) {
  return (
    <Text style={stylesPdfCommun.piedDePage} fixed>
      {entreprise.raisonSociale} — SIRET {entreprise.siret} — {libelleDocument} {numero}
    </Text>
  );
}
