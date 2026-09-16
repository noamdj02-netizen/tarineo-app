// Génération du PDF de facture client — mêmes principes que devisPdf.tsx (mise en page
// fixe, jamais laissée à l'IA ; blocs partagés dans src/lib/pdfClients.tsx). Spécifique
// à la facture : date d'échéance (pas de durée de validité), pas de bloc signature, et
// les mentions de retard de paiement imposées par le code de commerce (art. L.441-9 et
// D.441-5) — voir MENTIONS_RETARD_PAIEMENT ci-dessous pour les sources.
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

export type LigneFacturePdf = LigneDocumentPdf;

export interface FacturePdfDonnees {
  numero: string;
  dateEmission: Date;
  dateEcheance: Date;
  conditionsPaiement: string;
  clientNom: string;
  clientAdresse: string | null;
  lignes: LigneFacturePdf[];
  totalHt: number;
  totalTva: number;
  totalTtc: number;
  // Numéro du devis d'origine si cette facture en est la transformation (voir
  // transformerEnFacture dans devis-clients/[id]/actions.ts) — traçabilité utile pour
  // le client comme pour l'artisan, pas une mention légalement requise.
  numeroDevisOrigine: string | null;
}

// Mentions de retard de paiement (code de commerce, art. L.441-9 et D.441-5) :
// obligatoires entre professionnels, exprimées ici en texte fixe ("3 fois le taux
// d'intérêt légal") plutôt qu'un pourcentage codé en dur — le taux légal est révisé
// périodiquement par décret, un chiffre figé deviendrait obsolète. L'indemnité
// forfaitaire de 40 € est due de plein droit en cas de retard et doit figurer sur la
// facture même si elle n'est jamais réclamée. Non requis pour un client particulier,
// mais inoffensif à afficher systématiquement (pratique standard des logiciels de
// facturation) plutôt que d'ajouter une distinction pro/particulier au modèle.
// Sources : legalplace.fr/guides/mentions-obligatoires-facture,
// mondevisfacile.fr/blog/delai-de-paiement-facture-regles-penalites-et-40eu
function BlocMentionsRetardPaiement() {
  return (
    <View style={stylesPdfCommun.sectionConditions}>
      <Text style={{ fontFamily: "Helvetica-Bold" }}>Retard de paiement</Text>
      <Text>
        Taux des pénalités de retard : 3 fois le taux d&apos;intérêt légal en vigueur, applicable dès le lendemain de
        la date d&apos;échéance. Indemnité forfaitaire pour frais de recouvrement : 40 €, due de plein droit en cas de
        retard de paiement. Pas d&apos;escompte pour paiement anticipé.
      </Text>
    </View>
  );
}

function FactureDocument({ entreprise, facture }: { entreprise: EntrepriseInfoPdf; facture: FacturePdfDonnees }) {
  return (
    <Document title={`Facture ${facture.numero}`}>
      <Page size="A4" style={stylesPdfCommun.page}>
        <View style={stylesPdfCommun.entete}>
          <EnTeteEntreprise entreprise={entreprise} />
          <View>
            <Text style={stylesPdfCommun.blocTitreDocument}>FACTURE</Text>
            <Text style={stylesPdfCommun.blocInfoDocument}>N° {facture.numero}</Text>
            <Text style={stylesPdfCommun.blocInfoDocument}>Émise le {formaterDate(facture.dateEmission)}</Text>
            <Text style={stylesPdfCommun.blocInfoDocument}>Échéance le {formaterDate(facture.dateEcheance)}</Text>
            {facture.numeroDevisOrigine && (
              <Text style={stylesPdfCommun.blocInfoDocument}>Établie suite au devis n° {facture.numeroDevisOrigine}</Text>
            )}
          </View>
        </View>

        <BlocClient nom={facture.clientNom} adresse={facture.clientAdresse} />
        <TableauLignes lignes={facture.lignes} />
        <BlocTotaux
          entreprise={entreprise}
          totalHt={facture.totalHt}
          totalTva={facture.totalTva}
          totalTtc={facture.totalTtc}
        />
        <BlocAssurance entreprise={entreprise} />
        <BlocConditionsPaiement conditionsPaiement={facture.conditionsPaiement} ibanMasque={entreprise.ibanMasque} />
        <BlocMentionsLegales mentions={entreprise.mentionsLegales} />
        <BlocMentionsRetardPaiement />

        <PiedDePage entreprise={entreprise} libelleDocument="Facture" numero={facture.numero} />
      </Page>
    </Document>
  );
}

export async function genererPdfFacture(entreprise: EntrepriseInfoPdf, facture: FacturePdfDonnees): Promise<Buffer> {
  return renderToBuffer(<FactureDocument entreprise={entreprise} facture={facture} />);
}
