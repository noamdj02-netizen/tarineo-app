import type { DepenseDistributeur } from "@/lib/depenses";
import type { FicheFournisseur } from "@/lib/fichesFournisseurs";
import type { PayloadAlerteHausse } from "@/lib/comparaisonPrix";

export type OpportuniteFournisseur = {
  id: string;
  titre: string;
  description: string;
  badge?: string;
};

const formaterEuros = (valeur: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(valeur);

/** Opportunités calculées sur l'historique de l'artisan + fiche de référence — sans fetch externe. */
export function construireOpportunitesFournisseur({
  nomEnseigne,
  fiche,
  depense,
  hausses,
  nbDocuments,
}: {
  nomEnseigne: string;
  fiche: FicheFournisseur;
  depense: DepenseDistributeur | null;
  hausses: PayloadAlerteHausse[];
  nbDocuments: number;
}): OpportuniteFournisseur[] {
  const items: OpportuniteFournisseur[] = [];

  if (nbDocuments === 0) {
    items.push({
      id: "import",
      titre: "Démarrez le suivi chez cet enseigne",
      description: `Importez un devis ou une facture ${nomEnseigne} pour que Tarinéo compare les prix à votre historique et affine ce tableau.`,
      badge: "Action",
    });
  }

  if (depense?.objectif != null && depense.encoursRestant != null) {
    const pct = depense.pourcentageAtteinte ?? 0;
    if (depense.encoursRestant <= 0) {
      items.push({
        id: "bfa-atteint",
        titre: "Objectif BFA atteint sur la période",
        description: `Vous avez dépassé ${formaterEuros(depense.objectif)} HT chez ${nomEnseigne}. Confirmez la remise avec votre commercial.`,
        badge: "BFA",
      });
    } else if (pct >= 75) {
      items.push({
        id: "bfa-proche",
        titre: "Proche de votre remise annuelle",
        description: `Encore ${formaterEuros(depense.encoursRestant)} HT à passer pour atteindre votre objectif (${Math.round(pct)} %).`,
        badge: "BFA",
      });
    } else if (pct > 0 && pct < 40) {
      items.push({
        id: "bfa-loin",
        titre: "Objectif BFA encore loin",
        description: `${formaterEuros(depense.depenses)} HT cumulés sur ${formaterEuros(depense.objectif)} — concentrez vos achats ici seulement si les prix restent compétitifs.`,
        badge: "BFA",
      });
    }
  }

  if (hausses.length > 0) {
    const hausseMoy = hausses.reduce((s, h) => s + (h.ecartPourcent ?? 0), 0) / hausses.length;
    items.push({
      id: "hausses",
      titre: `${hausses.length} référence${hausses.length > 1 ? "s" : ""} en hausse`,
      description: `Hausse moyenne ${hausseMoy > 0 ? "+" : ""}${hausseMoy.toFixed(1).replace(".", ",")} % sur votre historique — comparez avant le prochain achat chez ${nomEnseigne}.`,
      badge: "Alerte prix",
    });
  }

  items.push({
    id: "bfa-ref",
    titre: "Remise de fin d'année (référence)",
    description: fiche.bfa,
    badge: "Enseigne",
  });

  for (const [i, avantage] of fiche.avantages.slice(0, 3).entries()) {
    items.push({
      id: `avantage-${i}`,
      titre: avantage,
      description: `Avantage habituel chez ${nomEnseigne} — à confirmer avec votre agence.`,
      badge: "Référence",
    });
  }

  return items;
}
