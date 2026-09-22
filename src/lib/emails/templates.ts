import { echapperHtml } from "./escape";
import { ASSETS_EMAIL } from "./assets";
import {
  layoutActivation,
  layoutBienvenue,
  layoutCarte,
  layoutNotesDeVersion,
  layoutTexte,
} from "./layout";

type OptionsBase = { origine?: string; urlDesinscription?: string };

// ─── 1. Activation compte (178:28332) ───────────────────────────────────────

export function renduEmailActivation(params: { urlConfirmation: string } & OptionsBase): string {
  return layoutActivation({
    illustration: "mascotte",
    titre: "On y est presque !",
    paragraphes: [
      "Merci de votre inscription sur Tarineo.",
      "Pour activer votre compte, il ne reste qu'à confirmer votre adresse email.",
    ],
    bouton: { href: params.urlConfirmation, label: "Confirmer mon email", variante: "orange" },
    note: [
      "Si vous n'êtes pas à l'origine de cette inscription,",
      "ignorez simplement cet email.",
    ],
    origine: params.origine,
    urlDesinscription: params.urlDesinscription,
  });
}

// ─── 2. Notes de version (Figma Tarineo 217:3811) ─────────────────────────

export function renduEmailNotesDeVersion(
  params: { urlEssayer: string; urlTableauDeBord: string } & OptionsBase,
): string {
  return layoutNotesDeVersion(params);
}

// ─── 3. Confirmation abonnement (178:28483) ───────────────────────────────

export function renduEmailConfirmationAbonnement(
  params: {
    prenom: string;
    montant: string;
    dateProchainPrelevement: string;
    urlGestion: string;
  } & OptionsBase,
): string {
  const p = echapperHtml(params.prenom);
  return layoutCarte({
    titre: "Votre abonnement est actif",
    paragraphes: [
      `Bonjour ${p},`,
      "Merci de votre confiance : votre abonnement Tarineo Pro est actif. Vous avez désormais accès à toutes les fonctionnalités de votre forfait — scan illimité de devis, alertes de hausse de prix et historique fournisseur complet.",
      `Vous êtes facturé ${echapperHtml(params.montant)} € / mois. Votre prochain prélèvement aura lieu le ${echapperHtml(params.dateProchainPrelevement)}. Vous pouvez modifier votre moyen de paiement ou résilier à tout moment depuis votre compte.`,
    ],
    bouton: { href: params.urlGestion, label: "Gérer mon abonnement", variante: "orange" },
    note: [
      "Une question sur votre facturation ou votre forfait ?",
      "Répondez à cet email, on est là pour ça.",
    ],
    origine: params.origine,
    urlDesinscription: params.urlDesinscription,
  });
}

// ─── 4. Mise à jour forfait (178:28501) ───────────────────────────────────

export function renduEmailMiseAJourForfait(
  params: {
    prenom: string;
    montant: string;
    dateProchainPrelevement: string;
    urlGestion: string;
  } & OptionsBase,
): string {
  const p = echapperHtml(params.prenom);
  return layoutCarte({
    titre: "Votre forfait a été mis à jour",
    paragraphes: [
      `Bonjour ${p},`,
      "Votre abonnement Tarineo a bien été mis à jour. Voici un récapitulatif de votre forfait et de votre facturation.",
      `Vous êtes sur le forfait Tarineo Pro à ${echapperHtml(params.montant)} € / mois. Votre prochain prélèvement aura lieu le ${echapperHtml(params.dateProchainPrelevement)}. Vous pouvez consulter vos factures, modifier votre moyen de paiement ou changer de forfait depuis les réglages de votre compte.`,
    ],
    bouton: { href: params.urlGestion, label: "Gérer mon abonnement", variante: "orange" },
    note: [
      "Une question sur votre facturation ?",
      "Répondez directement à cet email, on vous aide.",
    ],
    origine: params.origine,
    urlDesinscription: params.urlDesinscription,
  });
}

// ─── 5. Réinitialisation mot de passe (178:28587) ─────────────────────────

export function renduEmailReinitialisationMotDePasse(
  params: { prenom: string; urlReinitialisation: string } & OptionsBase,
): string {
  const p = echapperHtml(params.prenom);
  return layoutCarte({
    titre: "Réinitialisez votre mot de passe",
    paragraphes: [
      `Bonjour ${p}, une demande de réinitialisation de mot de passe a été faite pour votre compte Tarineo. Cliquez sur le bouton ci-dessous pour en créer un nouveau.`,
    ],
    bouton: { href: params.urlReinitialisation, label: "Changer mon mot de passe", variante: "orange" },
    note: [
      "Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.",
      "Votre mot de passe ne changera pas tant que vous n'aurez pas cliqué sur le lien ci-dessus.",
    ],
    origine: params.origine,
    urlDesinscription: params.urlDesinscription,
  });
}

// ─── 6. Texte simple (178:28519) ──────────────────────────────────────────

export function renduEmailTexte(
  params: {
    titre: string;
    paragraphes: string[];
    urlAction?: string;
    labelBouton?: string;
    signature?: string[];
  } & OptionsBase,
): string {
  return layoutTexte({
    titre: params.titre,
    paragraphes: params.paragraphes.map(echapperHtml),
    bouton: params.urlAction
      ? { href: params.urlAction, label: params.labelBouton ?? "En savoir plus", variante: "orange" }
      : undefined,
    signature: params.signature,
    origine: params.origine,
    urlDesinscription: params.urlDesinscription,
  });
}

/** Modèle texte Figma par défaut (démo). */
export function renduEmailTexteDemo(params: { urlAction: string } & OptionsBase): string {
  return renduEmailTexte({
    titre: "Un point rapide de l'équipe Tarineo",
    paragraphes: [
      "Ce modèle texte seul sert aux notifications simples : confirmation d'import de devis, récap mensuel des hausses détectées, ou mise à jour de compte — sans visuel ni bouton d'action principal.",
      "Gardez les paragraphes courts pour rester lisible sur mobile, où la majorité de vos artisans consultent leurs emails entre deux chantiers.",
      "Remplacez ce texte de démonstration directement dans ce fichier avant envoi.",
    ],
    urlAction: params.urlAction,
    labelBouton: "En savoir plus",
    signature: ["Merci de votre confiance,", "Alan & Noam — Fondateurs, Tarineo"],
    origine: params.origine,
    urlDesinscription: params.urlDesinscription,
  });
}

// ─── 7. Bienvenue (178:28534) ─────────────────────────────────────────────

export function renduEmailBienvenue(params: { urlTableauDeBord: string } & OptionsBase): string {
  return layoutBienvenue(params);
}

// ─── 8. Alerte hausse de prix (179:28793) ─────────────────────────────────

export function renduEmailAlerteHaussePrix(
  params: {
    prenom: string;
    nomFournisseur: string;
    referenceProduit: string;
    ancienPrix: string;
    nouveauPrix: string;
    pourcentageHausse: string;
    urlDetail: string;
  } & OptionsBase,
): string {
  const p = echapperHtml(params.prenom);
  return layoutCarte({
    titre: "Hausse de prix détectée",
    paragraphes: [
      `Bonjour ${p},`,
      `Tarineo a détecté une hausse de prix sur un article de votre fournisseur ${echapperHtml(params.nomFournisseur)}.`,
      `Référence : ${echapperHtml(params.referenceProduit)}`,
      `Ancien prix : ${echapperHtml(params.ancienPrix)} €`,
      `Nouveau prix : ${echapperHtml(params.nouveauPrix)} € (${echapperHtml(params.pourcentageHausse)} %)`,
      "Utilisez ce chiffre pour renégocier avant votre prochaine commande.",
    ],
    bouton: { href: params.urlDetail, label: "Voir le détail", variante: "dark" },
    note: [
      "Cette alerte est basée sur votre historique d'achat.",
      "Répondez à cet email si le prix vous semble incorrect.",
    ],
    origine: params.origine,
    urlDesinscription: params.urlDesinscription,
  });
}

// ─── 9. Invitation équipe (179:28865) ─────────────────────────────────────

export function renduEmailInvitationEquipe(
  params: {
    nomInvitant: string;
    nomEntreprise: string;
    urlInvitation: string;
  } & OptionsBase,
): string {
  return layoutActivation({
    mascotte: { chemin: ASSETS_EMAIL.invitationEquipeMascot, width: 210, height: 175 },
    titre: "Vous êtes invité(e) sur Tarineo",
    paragraphes: [
      `${echapperHtml(params.nomInvitant)} vous invite à rejoindre l'espace Tarineo de ${echapperHtml(params.nomEntreprise)} pour suivre ensemble les prix de vos fournisseurs BTP.`,
    ],
    bouton: { href: params.urlInvitation, label: "Rejoindre l'équipe", variante: "dark" },
    note: [
      `Si vous ne connaissez pas ${echapperHtml(params.nomInvitant)},`,
      "vous pouvez ignorer cet email.",
    ],
    origine: params.origine,
    urlDesinscription: params.urlDesinscription,
  });
}

// ─── 10. Essai expire (179:28899) ─────────────────────────────────────────

export function renduEmailEssaiExpire(
  params: { joursRestants: number; urlForfaits: string } & OptionsBase,
): string {
  return layoutActivation({
    mascotte: { chemin: ASSETS_EMAIL.essaiExpireMascot, width: 210, height: 221 },
    titre: "Votre essai gratuit se termine bientôt",
    paragraphes: [
      `Il vous reste ${params.joursRestants} jours d'essai Tarineo. Passez à un forfait payant pour continuer à recevoir vos alertes de hausse de prix sans interruption.`,
    ],
    bouton: { href: params.urlForfaits, label: "Choisir mon forfait", variante: "dark" },
    note: [
      "Une question sur nos forfaits ?",
      "Répondez à cet email, on vous aide.",
    ],
    origine: params.origine,
    urlDesinscription: params.urlDesinscription,
  });
}

// ─── 11. Facture disponible (179:28933) ───────────────────────────────────

export function renduEmailFactureDisponible(
  params: {
    prenom: string;
    moisFacturation: string;
    montant: string;
    urlFacture: string;
  } & OptionsBase,
): string {
  const p = echapperHtml(params.prenom);
  return layoutCarte({
    mascotte: { chemin: ASSETS_EMAIL.factureMascot, width: 141, height: 159 },
    titre: "Votre facture est disponible",
    paragraphes: [
      `Bonjour ${p},`,
      `Votre facture Tarineo du mois de ${echapperHtml(params.moisFacturation)} est prête. Montant réglé : ${echapperHtml(params.montant)} €.`,
      "Vous pouvez la télécharger et consulter votre historique de facturation directement depuis votre compte.",
    ],
    bouton: { href: params.urlFacture, label: "Télécharger ma facture", variante: "dark" },
    note: [
      "Une question sur cette facture ?",
      "Répondez à cet email, on vous répond rapidement.",
    ],
    origine: params.origine,
    urlDesinscription: params.urlDesinscription,
  });
}

// ─── 12. Relance inactif (179:28951) ──────────────────────────────────────

export function renduEmailRelanceInactif(
  params: {
    prenom: string;
    nombreJours: number;
    urlImport: string;
  } & OptionsBase,
): string {
  const p = echapperHtml(params.prenom);
  return layoutTexte({
    titre: "Ça fait un moment qu'on ne vous a pas vu",
    paragraphes: [
      `Bonjour ${p},`,
      `Vous n'avez importé aucun devis depuis ${params.nombreJours} jours. Pendant ce temps, vos fournisseurs BTP continuent d'ajuster leurs prix — et sans import régulier, Tarineo ne peut plus détecter les hausses pour vous.`,
      "Prenez deux minutes pour scanner votre dernier devis et reprendre le fil.",
    ],
    bouton: { href: params.urlImport, label: "Importer un devis", variante: "dark" },
    signature: ["À bientôt,", "L'équipe Tarineo"],
    origine: params.origine,
    urlDesinscription: params.urlDesinscription,
  });
}

// ─── 13. Résiliation confirmée (179:28966) ────────────────────────────────

export function renduEmailResiliationConfirmee(
  params: {
    prenom: string;
    dateFinAcces: string;
    urlReactivation: string;
  } & OptionsBase,
): string {
  const p = echapperHtml(params.prenom);
  return layoutCarte({
    titre: "Votre abonnement a été résilié",
    paragraphes: [
      `Bonjour ${p},`,
      `Votre abonnement Tarineo Pro a bien été résilié. Il restera actif jusqu'au ${echapperHtml(params.dateFinAcces)}, puis vous perdrez l'accès à vos alertes de hausse de prix et à votre historique fournisseur.`,
      "Vous pouvez réactiver votre abonnement à tout moment avant cette date sans perdre vos données.",
    ],
    bouton: { href: params.urlReactivation, label: "Réactiver mon abonnement", variante: "dark" },
    note: [
      "Un mot à nous dire avant de partir ?",
      "Répondez à cet email, on lit tout.",
    ],
    origine: params.origine,
    urlDesinscription: params.urlDesinscription,
  });
}

// ─── 14. Baisse de prix (179:28984) ───────────────────────────────────────

export function renduEmailBaissePrix(
  params: {
    prenom: string;
    nomFournisseur: string;
    referenceProduit: string;
    ancienPrix: string;
    nouveauPrix: string;
    pourcentageBaisse: string;
    urlDetail: string;
  } & OptionsBase,
): string {
  const p = echapperHtml(params.prenom);
  return layoutCarte({
    titre: "Bonne nouvelle : un prix a baissé",
    paragraphes: [
      `Bonjour ${p},`,
      `Tarineo a détecté une baisse de prix chez votre fournisseur ${echapperHtml(params.nomFournisseur)}.`,
      `Référence : ${echapperHtml(params.referenceProduit)}`,
      `Ancien prix : ${echapperHtml(params.ancienPrix)} €`,
      `Nouveau prix : ${echapperHtml(params.nouveauPrix)} € (${echapperHtml(params.pourcentageBaisse)} %)`,
      "C'est peut-être le bon moment pour passer votre prochaine commande.",
    ],
    bouton: { href: params.urlDetail, label: "Voir le détail", variante: "dark" },
    note: [
      "Cette alerte est basée sur votre historique d'achat.",
      "Répondez à cet email si le prix vous semble incorrect.",
    ],
    origine: params.origine,
    urlDesinscription: params.urlDesinscription,
  });
}

// ─── 15. Parrainage (179:29002) ───────────────────────────────────────────

export function renduEmailParrainage(
  params: { montantReduction: string; urlParrainage: string } & OptionsBase,
): string {
  return layoutActivation({
    titre: "Parrainez un artisan, gagnez une réduction",
    paragraphes: [
      `Invitez un confrère à essayer Tarineo. Dès qu'il crée son compte, vous recevez tous les deux ${echapperHtml(params.montantReduction)} € sur votre prochain mois d'abonnement.`,
    ],
    bouton: { href: params.urlParrainage, label: "Envoyer mon lien de parrainage", variante: "dark" },
    note: [
      "Offre valable une fois par filleul,",
      "sans limite de parrainages.",
    ],
    origine: params.origine,
    urlDesinscription: params.urlDesinscription,
  });
}

// ─── 16. Nouveau membre équipe (179:29090) ────────────────────────────────

export function renduEmailNouveauMembreEquipe(
  params: {
    nomMembre: string;
    nomEntreprise: string;
    urlEquipe: string;
  } & OptionsBase,
): string {
  return layoutActivation({
    titre: `${echapperHtml(params.nomMembre)} a rejoint votre équipe`,
    paragraphes: [
      `${echapperHtml(params.nomMembre)} vient d'accepter votre invitation et a maintenant accès à l'espace Tarineo de ${echapperHtml(params.nomEntreprise)}.`,
    ],
    bouton: { href: params.urlEquipe, label: "Gérer mon équipe", variante: "dark" },
    note: [
      "Vous pouvez ajuster ses accès",
      "depuis les réglages de votre compte.",
    ],
    origine: params.origine,
    urlDesinscription: params.urlDesinscription,
  });
}

// ─── 17. Demande avis NPS (179:29124) ─────────────────────────────────────

export function renduEmailDemandeAvisNps(
  params: { nombreMois: number; urlAvis: string } & OptionsBase,
): string {
  return layoutActivation({
    titre: "Votre avis compte pour nous",
    paragraphes: [
      `Ça fait ${params.nombreMois} mois que vous utilisez Tarineo. Sur une échelle de 0 à 10, recommanderiez-vous Tarineo à un autre artisan ?`,
    ],
    bouton: { href: params.urlAvis, label: "Donner mon avis", variante: "dark" },
    note: [
      "Ça prend 30 secondes,",
      "et ça nous aide énormément.",
    ],
    origine: params.origine,
    urlDesinscription: params.urlDesinscription,
  });
}

// ─── 18. Export prêt (179:29158) ──────────────────────────────────────────

export function renduEmailExportPret(
  params: {
    prenom: string;
    periode: string;
    urlTelechargement: string;
  } & OptionsBase,
): string {
  const p = echapperHtml(params.prenom);
  return layoutCarte({
    titre: "Votre export est prêt",
    paragraphes: [
      `Bonjour ${p},`,
      `Le récapitulatif des hausses de prix détectées sur la période ${echapperHtml(params.periode)} est prêt à être téléchargé. Vous pouvez le présenter directement à votre commercial fournisseur.`,
    ],
    bouton: { href: params.urlTelechargement, label: "Télécharger l'export", variante: "dark" },
    note: [
      "Ce lien reste valable 7 jours.",
      "Après, générez un nouvel export depuis votre tableau de bord.",
    ],
    origine: params.origine,
    urlDesinscription: params.urlDesinscription,
  });
}
