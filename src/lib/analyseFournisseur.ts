import type { DepenseDistributeur } from "@/lib/depenses";
import type { PayloadAlerteHausse } from "@/lib/comparaisonPrix";

export type TonVerdictFournisseur = "favorable" | "attention" | "neutre" | "decouvrir";

export interface VerdictFournisseur {
  ton: TonVerdictFournisseur;
  titre: string;
  resume: string;
  conseils: string[];
}

const formaterEuros = (valeur: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(valeur);

export function analyserFournisseurPourArtisan({
  nbDocuments,
  depense,
  hausses,
  rangDepenses,
  totalDepensesTous,
}: {
  nbDocuments: number;
  depense: DepenseDistributeur | null;
  hausses: PayloadAlerteHausse[];
  rangDepenses: number | null;
  totalDepensesTous: number;
}): VerdictFournisseur {
  const conseils: string[] = [];
  const hausseMoy =
    hausses.length > 0 ? hausses.reduce((s, h) => s + (h.ecartPourcent ?? 0), 0) / hausses.length : null;
  const pctDepenses =
    depense && totalDepensesTous > 0 ? Math.round((depense.depenses / totalDepensesTous) * 100) : null;

  if (nbDocuments === 0 && (depense?.depenses ?? 0) === 0) {
    return {
      ton: "decouvrir",
      titre: "Pas encore d'historique chez cet enseigne",
      resume: "Importez un premier devis ou une facture pour que Tarinéo calcule si les prix vous conviennent, par rapport à vos autres achats.",
      conseils: [
        "Un seul document suffit pour démarrer le suivi.",
        "Deux documents du même fournisseur activent la détection de hausse.",
      ],
    };
  }

  if (depense?.objectif != null && depense.encoursRestant != null) {
    if (depense.encoursRestant <= 0) {
      conseils.push("Objectif BFA atteint sur la période — vérifiez les conditions avec votre commercial.");
    } else if ((depense.pourcentageAtteinte ?? 0) >= 75) {
      conseils.push(
        `Plus que ${formaterEuros(depense.encoursRestant)} pour atteindre votre objectif BFA (${Math.round(depense.pourcentageAtteinte ?? 0)} %).`
      );
    } else if ((depense.pourcentageAtteinte ?? 0) < 30 && depense.objectif > 0) {
      conseils.push("Objectif BFA encore loin — concentrez vos achats ici seulement si les prix restent compétitifs.");
    }
  } else {
    conseils.push("Fixez un objectif annuel HT pour suivre votre remise de fin d'année chez cet enseigne.");
  }

  if (hausseMoy !== null && hausseMoy > 3) {
    conseils.push(
      `Hausse moyenne de ${hausseMoy.toFixed(1).replace(".", ",")} % sur ${hausses.length} référence${hausses.length > 1 ? "s" : ""} — comparez avant le prochain achat.`
    );
  }

  if (pctDepenses !== null && pctDepenses >= 40) {
    conseils.push(`${pctDepenses} % de vos achats suivis passent par cet enseigne.`);
  }

  if (rangDepenses === 1 && (hausseMoy === null || hausseMoy <= 3)) {
    return {
      ton: "favorable",
      titre: "Votre enseigne principale, prix stables",
      resume: "Vous y achetez le plus et Tarinéo ne détecte pas de dérive majeure sur votre historique récent.",
      conseils,
    };
  }

  if (hausseMoy !== null && hausseMoy > 5) {
    return {
      ton: "attention",
      titre: "Hausse de prix à surveiller",
      resume: "Les derniers documents montrent une tendance à la hausse par rapport à ce que vous payiez habituellement chez cet enseigne.",
      conseils,
    };
  }

  if (hausses.length >= 3) {
    return {
      ton: "attention",
      titre: "Plusieurs références en hausse",
      resume: `${hausses.length} alertes sur votre historique — un autre distributeur peut parfois être moins cher pour la même référence fabricant.`,
      conseils,
    };
  }

  if ((depense?.pourcentageAtteinte ?? 0) >= 80) {
    return {
      ton: "favorable",
      titre: "Proche de votre remise annuelle",
      resume: "Vous êtes sur une bonne trajectoire pour votre objectif BFA sur la période en cours.",
      conseils,
    };
  }

  return {
    ton: "neutre",
    titre: "Historique correct, à confirmer au prochain devis",
    resume: "Continuez à importer vos documents : Tarinéo affine le verdict à chaque achat validé.",
    conseils,
  };
}
