import type { FournisseurConnu } from "@/lib/fournisseursConnus";
import { slugFournisseurConnu } from "@/lib/fournisseursConnus";

export interface FicheFournisseur {
  siteWeb: string;
  avantages: string[];
  livraison: string;
  bfa: string;
}

/** Infos publiques de référence — pas des promos live (agent fournisseur V2). */
const FICHES: Record<string, FicheFournisseur> = {
  cedeo: {
    siteWeb: "https://www.cedeo.fr",
    avantages: ["Réseau sanitaire-chauffage", "Click & Collect", "Conseil technique en agence", "Devis chantier"],
    livraison: "Livraison chantier ou retrait agence — délai selon stock et agence",
    bfa: "Remise de fin d'année sur volume HT négocié avec votre commercial",
  },
  pointp: {
    siteWeb: "https://www.pointp.fr",
    avantages: ["Matériaux gros œuvre et second œuvre", "Drive agence", "Devis travaux"],
    livraison: "Livraison camion-grue ou retrait — créneaux à confirmer en agence",
    bfa: "Objectif annuel groupe Saint-Gobain cumulable avec Cedeo, PUM, Dispano…",
  },
  rexel: {
    siteWeb: "https://www.rexel.fr",
    avantages: ["Électricité et éclairage pro", "Stock national", "E-commerce B2B"],
    livraison: "Livraison J+1 à J+3 selon référence et agence",
    bfa: "Conditions annuelles sur volume électricité",
  },
  sonepar: {
    siteWeb: "https://www.sonepar.fr",
    avantages: ["Câbles, tableaux, domotique", "Logistique chantier", "Application mobile pro"],
    livraison: "Livraison express possible sur les agences équipées",
    bfa: "Remise annuelle selon paliers HT",
  },
  tereva: {
    siteWeb: "https://www.tereva.fr",
    avantages: ["Sanitaire, chauffage, climatisation", "Réseau régional fort", "SAV pièces détachées"],
    livraison: "Livraison ou enlèvement agence — délais variables",
    bfa: "BFA annuelle négociée par agence",
  },
  gedimat: {
    siteWeb: "https://www.gedimat.fr",
    avantages: ["Matériaux construction", "Réseau coopératif", "Proximité chantier"],
    livraison: "Livraison palette ou vrac selon dépôt",
    bfa: "Objectif annuel coopérative",
  },
  bigmat: {
    siteWeb: "https://www.bigmat.fr",
    avantages: ["Couverture, maçonnerie, bois", "Centrales d'achat", "Conseil métier"],
    livraison: "Livraison chantier sur rendez-vous",
    bfa: "Remise fin d'année sur CA HT",
  },
  leroymerlin: {
    siteWeb: "https://www.leroymerlin.fr",
    avantages: ["Grand public et pro", "Carte pro", "Large choix outillage"],
    livraison: "Drive, livraison à domicile ou chantier (selon offre pro)",
    bfa: "Programme pro avec avantages volume",
  },
  bricodepot: {
    siteWeb: "https://www.bricodepot.fr",
    avantages: ["Prix bas volume", "Carte pro", "Stock palette"],
    livraison: "Retrait entrepôt ou livraison palette",
    bfa: "Conditions pro à demander en magasin",
  },
  castorama: {
    siteWeb: "https://www.castorama.fr",
    avantages: ["Bricolage et chantier léger", "Carte Casto Pro", "Click & Collect"],
    livraison: "Livraison ou retrait magasin",
    bfa: "Offres pro périodiques — pas de BFA classique néseau",
  },
  brossette: {
    siteWeb: "https://www.brossette.fr",
    avantages: ["Sanitaire chauffage", "Réseau Sud-Ouest", "Devis rapides"],
    livraison: "Livraison agence ou retrait",
    bfa: "Objectif annuel HT",
  },
  richardson: {
    siteWeb: "https://www.richardson.fr",
    avantages: ["Sanitaire, chauffage, clim", "Réseau national", "Formation produits"],
    livraison: "Livraison standard agence",
    bfa: "Remise annuelle sur volume",
  },
};

function ficheParDefaut(connu: FournisseurConnu): FicheFournisseur {
  const type = connu.specialite.toLowerCase();
  const livraison =
    type.includes("électric") || type.includes("electri")
      ? "Livraison agence ou chantier — délai selon stock"
      : type.includes("matériaux") || type.includes("bois")
        ? "Livraison palette / camion sur rendez-vous"
        : "Livraison ou retrait en agence — délai à confirmer";

  return {
    siteWeb: `https://www.${connu.alias[0] ?? "tarineo"}.fr`,
    avantages: [
      connu.specialite,
      ...(connu.groupe ? [`Réseau ${connu.groupe}`] : []),
      "Devis et factures importables dans Tarineo",
    ],
    livraison,
    bfa: "Remise de fin d'année — seuil à négocier avec votre commercial",
  };
}

export function ficheFournisseur(connu: FournisseurConnu): FicheFournisseur {
  const slug = slugFournisseurConnu(connu);
  return FICHES[slug] ?? ficheParDefaut(connu);
}
