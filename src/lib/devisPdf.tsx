// Génération du PDF de devis client — mise en page fixe (jamais laissée à l'IA, voir
// la note de src/lib/genererDevisIA.ts) construite avec @react-pdf/renderer, qui
// fonctionne en pur JS côté serveur (pas de Chromium/Puppeteer, donc pas de souci de
// binaire natif en environnement serverless). Blocs partagés avec facturePdf.tsx dans
// src/lib/pdfClients.tsx — ce fichier ne garde que ce qui est spécifique au devis
// (durée de validité, bon pour accord/signature).
import { Document, Page, View, Text, renderToBuffer } from "@react-pdf/renderer";
import {
  stylesPdfCommun,
  formaterDate,
  EnTeteEntreprise,
  BlocClient,
  TableauLignes,
  BlocTotaux,
  BlocAssurance,
  BlocConditionsPaiement,
  BlocMentionsLegales,
  PiedDePage,
  type EntrepriseInfoPdf,
  type LigneDocumentPdf,
} from "@/lib/pdfClients";

export type { EntrepriseInfoPdf };
export type LigneDevisPdf = LigneDocumentPdf;

export interface DevisPdfDonnees {
  numero: string;
  dateEmission: Date;
  dureeValiditeJours: number;
  conditionsPaiement: string;
  clientNom: string;
  clientAdresse: string | null;
  lignes: LigneDevisPdf[];
  totalHt: number;
  totalTva: number;
  totalTtc: number;
}

function DevisDocument({ entreprise, devis }: { entreprise: EntrepriseInfoPdf; devis: DevisPdfDonnees }) {
  const dateValidite = new Date(devis.dateEmission);
  dateValidite.setDate(dateValidite.getDate() + devis.dureeValiditeJours);

  return (
    <Document title={`Devis ${devis.numero}`}>
      <Page size="A4" style={stylesPdfCommun.page}>
        <View style={stylesPdfCommun.entete}>
          <EnTeteEntreprise entreprise={entreprise} />
          <View>
            <Text style={stylesPdfCommun.blocTitreDocument}>DEVIS</Text>
            <Text style={stylesPdfCommun.blocInfoDocument}>N° {devis.numero}</Text>
            <Text style={stylesPdfCommun.blocInfoDocument}>Émis le {formaterDate(devis.dateEmission)}</Text>
            <Text style={stylesPdfCommun.blocInfoDocument}>Valable jusqu&apos;au {formaterDate(dateValidite)}</Text>
          </View>
        </View>

        <BlocClient nom={devis.clientNom} adresse={devis.clientAdresse} />
        <TableauLignes lignes={devis.lignes} />
        <BlocTotaux entreprise={entreprise} totalHt={devis.totalHt} totalTva={devis.totalTva} totalTtc={devis.totalTtc} />
        <BlocAssurance entreprise={entreprise} />
        <BlocConditionsPaiement conditionsPaiement={devis.conditionsPaiement} ibanMasque={entreprise.ibanMasque} />
        <BlocMentionsLegales mentions={entreprise.mentionsLegales} />

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

        <PiedDePage entreprise={entreprise} libelleDocument="Devis" numero={devis.numero} />
      </Page>
    </Document>
  );
}

export async function genererPdfDevis(entreprise: EntrepriseInfoPdf, devis: DevisPdfDonnees): Promise<Buffer> {
  return renderToBuffer(<DevisDocument entreprise={entreprise} devis={devis} />);
}
