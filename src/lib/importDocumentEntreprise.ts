import type { PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  calculerTotauxDevis,
  genererEtStockerPdfDevis,
  genererNumeroDevis,
} from "@/lib/devisClients";
import {
  CONDITIONS_PAIEMENT_PAR_DEFAUT,
  DUREE_VALIDITE_PAR_DEFAUT,
} from "@/lib/devisClientsConstants";
import { genererEtStockerPdfFacture, genererNumeroFacture } from "@/lib/facturesClients";

export type LigneImportEntreprise = {
  designation: string;
  quantite: number;
  prix_unitaire_ht: number;
  taux_tva: number;
  total_ligne_ht: number;
};

export type DonneesImportEntreprise = {
  typeEntreprise: "devis_client" | "facture_client" | "commande_client";
  clientNom: string;
  clientAdresse?: string | null;
  dateDocument: string | null;
  numero: string | null;
  lignes: LigneImportEntreprise[];
  totalHt: number;
  totalTva: number;
  totalTtc: number;
  confiance: number;
};

export type ResultatImportEntreprise =
  | { ok: true; cible: { type: "devis_client" | "facture_client"; id: string } }
  | { ok: false; raison: "profil_manquant" | "lignes_vides" };

function lignesPourDevis(donnees: DonneesImportEntreprise) {
  return donnees.lignes
    .filter((l) => l.designation.trim())
    .map((l) => ({
      designation: l.designation.trim(),
      quantite: l.quantite > 0 ? l.quantite : 1,
      prixUnitaireHt: l.prix_unitaire_ht,
      tauxTva: l.taux_tva,
    }));
}

export async function importerDocumentEntreprise(
  userId: string,
  donnees: DonneesImportEntreprise,
  client: PrismaClient = prisma,
): Promise<ResultatImportEntreprise> {
  const profil = await client.companyProfile.findUnique({ where: { userId }, select: { id: true } });
  if (!profil) {
    return { ok: false, raison: "profil_manquant" };
  }

  const lignes = lignesPourDevis(donnees);
  if (lignes.length === 0) {
    return { ok: false, raison: "lignes_vides" };
  }

  const totaux = calculerTotauxDevis(lignes);
  const clientNom = donnees.clientNom.trim() || "Client à compléter";
  const dateEmission = donnees.dateDocument ? new Date(donnees.dateDocument) : new Date();
  const typeEffectif =
    donnees.typeEntreprise === "facture_client" ? "facture_client" : "devis_client";

  if (typeEffectif === "devis_client") {
    const quote = await client.$transaction(async (tx) => {
      const numero = await genererNumeroDevis(tx, userId);
      return tx.clientQuote.create({
        data: {
          userId,
          numero,
          clientNom,
          clientAdresse: donnees.clientAdresse?.trim() || null,
          dateEmission,
          dureeValiditeJours: DUREE_VALIDITE_PAR_DEFAUT,
          conditionsPaiement: CONDITIONS_PAIEMENT_PAR_DEFAUT,
          promptOriginal: donnees.numero ? `Import scan — réf. ${donnees.numero}` : "Import scan document entreprise",
          totalHt: totaux.totalHt,
          totalTva: totaux.totalTva,
          totalTtc: totaux.totalTtc,
          lines: {
            create: lignes.map((l, i) => ({
              ordre: i,
              designation: l.designation,
              quantite: l.quantite,
              prixUnitaireHt: l.prixUnitaireHt,
              tauxTva: l.tauxTva,
              totalHt: Math.round(l.quantite * l.prixUnitaireHt * 100) / 100,
            })),
          },
        },
        include: { lines: true },
      });
    });

    await genererEtStockerPdfDevis(userId, quote, quote.lines);
    return { ok: true, cible: { type: "devis_client", id: quote.id } };
  }

  const dateEcheance = new Date(dateEmission);
  dateEcheance.setDate(dateEcheance.getDate() + 30);

  const facture = await client.$transaction(async (tx) => {
    const numero = await genererNumeroFacture(tx, userId);
    return tx.clientInvoice.create({
      data: {
        userId,
        numero,
        clientNom,
        clientAdresse: donnees.clientAdresse?.trim() || null,
        dateEmission,
        dateEcheance,
        conditionsPaiement: CONDITIONS_PAIEMENT_PAR_DEFAUT,
        totalHt: totaux.totalHt,
        totalTva: totaux.totalTva,
        totalTtc: totaux.totalTtc,
        lines: {
          create: lignes.map((l, i) => ({
            ordre: i,
            designation: l.designation,
            quantite: l.quantite,
            prixUnitaireHt: l.prixUnitaireHt,
            tauxTva: l.tauxTva,
            totalHt: Math.round(l.quantite * l.prixUnitaireHt * 100) / 100,
          })),
        },
      },
      include: { lines: true },
    });
  });

  await genererEtStockerPdfFacture(userId, facture, facture.lines, null);
  return { ok: true, cible: { type: "facture_client", id: facture.id } };
}
