export { origineEmail, urlAssetEmail, ASSETS_EMAIL } from "./assets";
export { echapperHtml } from "./escape";
export * from "./templates";

/** Identifiants des 17 modèles Figma + preview. */
export type SlugEmail =
  | "activation"
  | "notes-de-version"
  | "confirmation-abonnement"
  | "mise-a-jour-forfait"
  | "reinitialisation-mot-de-passe"
  | "texte"
  | "bienvenue"
  | "alerte-hausse-prix"
  | "invitation-equipe"
  | "essai-expire"
  | "facture-disponible"
  | "relance-inactif"
  | "resiliation-confirmee"
  | "baisse-prix"
  | "parrainage"
  | "nouveau-membre-equipe"
  | "demande-avis-nps"
  | "export-pret";

export const CATALOGUE_EMAILS: { slug: SlugEmail; sujet: string; label: string }[] = [
  { slug: "activation", sujet: "Confirmez votre adresse email Tarineo", label: "Activation compte" },
  { slug: "notes-de-version", sujet: "Notes de version Tarineo", label: "Notes de version" },
  { slug: "confirmation-abonnement", sujet: "Votre abonnement Tarineo est actif", label: "Confirmation abonnement" },
  { slug: "mise-a-jour-forfait", sujet: "Votre forfait Tarineo a été mis à jour", label: "Mise à jour forfait" },
  { slug: "reinitialisation-mot-de-passe", sujet: "Réinitialisez votre mot de passe Tarineo", label: "Réinitialisation mot de passe" },
  { slug: "texte", sujet: "Un point rapide de l'équipe Tarineo", label: "Texte simple" },
  { slug: "bienvenue", sujet: "Bienvenue sur Tarineo", label: "Bienvenue" },
  { slug: "alerte-hausse-prix", sujet: "Hausse de prix détectée", label: "Alerte hausse de prix" },
  { slug: "invitation-equipe", sujet: "Invitation à rejoindre Tarineo", label: "Invitation équipe" },
  { slug: "essai-expire", sujet: "Votre essai Tarineo se termine bientôt", label: "Fin d'essai" },
  { slug: "facture-disponible", sujet: "Votre facture Tarineo est disponible", label: "Facture disponible" },
  { slug: "relance-inactif", sujet: "Ça fait un moment qu'on ne vous a pas vu", label: "Relance inactif" },
  { slug: "resiliation-confirmee", sujet: "Confirmation : fin de votre abonnement Tarineo", label: "Résiliation confirmée" },
  { slug: "baisse-prix", sujet: "Bonne nouvelle : un prix a baissé", label: "Baisse de prix" },
  { slug: "parrainage", sujet: "Parrainez un artisan, gagnez une réduction", label: "Parrainage" },
  { slug: "nouveau-membre-equipe", sujet: "Un nouveau membre a rejoint votre équipe", label: "Nouveau membre équipe" },
  { slug: "demande-avis-nps", sujet: "Votre avis compte pour nous", label: "Demande avis NPS" },
  { slug: "export-pret", sujet: "Votre export Tarineo est prêt", label: "Export prêt" },
];

import { origineEmail } from "./assets";
import {
  renduEmailActivation,
  renduEmailAlerteHaussePrix,
  renduEmailBaissePrix,
  renduEmailBienvenue,
  renduEmailConfirmationAbonnement,
  renduEmailDemandeAvisNps,
  renduEmailEssaiExpire,
  renduEmailExportPret,
  renduEmailFactureDisponible,
  renduEmailInvitationEquipe,
  renduEmailMiseAJourForfait,
  renduEmailNotesDeVersion,
  renduEmailNouveauMembreEquipe,
  renduEmailParrainage,
  renduEmailReinitialisationMotDePasse,
  renduEmailRelanceInactif,
  renduEmailResiliationConfirmee,
  renduEmailTexteDemo,
} from "./templates";

/** Génère le HTML d'aperçu avec des données de démonstration. */
export function renduEmailPreview(slug: SlugEmail, origine?: string): string {
  const o = origine ?? origineEmail();
  const base = `${o}`;

  switch (slug) {
    case "activation":
      return renduEmailActivation({ urlConfirmation: `${base}/api/auth/callback`, origine: o });
    case "notes-de-version":
      return renduEmailNotesDeVersion({
        urlEssayer: `${base}/documents`,
        urlTableauDeBord: `${base}/accueil`,
        origine: o,
      });
    case "confirmation-abonnement":
      return renduEmailConfirmationAbonnement({
        prenom: "Jean",
        montant: "49",
        dateProchainPrelevement: "17 octobre 2026",
        urlGestion: `${base}/compte`,
        origine: o,
      });
    case "mise-a-jour-forfait":
      return renduEmailMiseAJourForfait({
        prenom: "Jean",
        montant: "49",
        dateProchainPrelevement: "17 octobre 2026",
        urlGestion: `${base}/compte`,
        origine: o,
      });
    case "reinitialisation-mot-de-passe":
      return renduEmailReinitialisationMotDePasse({
        prenom: "Jean",
        urlReinitialisation: `${base}/reinitialiser-mot-de-passe?token=demo`,
        origine: o,
      });
    case "texte":
      return renduEmailTexteDemo({ urlAction: `${base}/accueil`, origine: o });
    case "bienvenue":
      return renduEmailBienvenue({ urlTableauDeBord: `${base}/accueil`, origine: o });
    case "alerte-hausse-prix":
      return renduEmailAlerteHaussePrix({
        prenom: "Jean",
        nomFournisseur: "Cedeo",
        referenceProduit: "THERMOR-DURALIS-200L",
        ancienPrix: "595,00",
        nouveauPrix: "628,00",
        pourcentageHausse: "5,5",
        urlDetail: `${base}/documents/demo`,
        origine: o,
      });
    case "invitation-equipe":
      return renduEmailInvitationEquipe({
        nomInvitant: "Marc Dupont",
        nomEntreprise: "Dupont Plomberie",
        urlInvitation: `${base}/inscription`,
        origine: o,
      });
    case "essai-expire":
      return renduEmailEssaiExpire({ joursRestants: 3, urlForfaits: `${base}/tarifs`, origine: o });
    case "facture-disponible":
      return renduEmailFactureDisponible({
        prenom: "Jean",
        moisFacturation: "septembre 2026",
        montant: "49,00",
        urlFacture: `${base}/compte`,
        origine: o,
      });
    case "relance-inactif":
      return renduEmailRelanceInactif({
        prenom: "Jean",
        nombreJours: 21,
        urlImport: `${base}/documents`,
        origine: o,
      });
    case "resiliation-confirmee":
      return renduEmailResiliationConfirmee({
        prenom: "Jean",
        dateFinAcces: "17 octobre 2026",
        urlReactivation: `${base}/compte`,
        origine: o,
      });
    case "baisse-prix":
      return renduEmailBaissePrix({
        prenom: "Jean",
        nomFournisseur: "Point P",
        referenceProduit: "PA1951BTNE",
        ancienPrix: "42,50",
        nouveauPrix: "39,90",
        pourcentageBaisse: "6,1",
        urlDetail: `${base}/documents/demo`,
        origine: o,
      });
    case "parrainage":
      return renduEmailParrainage({ montantReduction: "10", urlParrainage: `${base}/compte`, origine: o });
    case "nouveau-membre-equipe":
      return renduEmailNouveauMembreEquipe({
        nomMembre: "Sophie Martin",
        nomEntreprise: "Dupont Plomberie",
        urlEquipe: `${base}/compte`,
        origine: o,
      });
    case "demande-avis-nps":
      return renduEmailDemandeAvisNps({ nombreMois: 3, urlAvis: `${base}/compte`, origine: o });
    case "export-pret":
      return renduEmailExportPret({
        prenom: "Jean",
        periode: "janvier – septembre 2026",
        urlTelechargement: `${base}/documents`,
        origine: o,
      });
    default:
      return renduEmailBienvenue({ urlTableauDeBord: `${base}/accueil`, origine: o });
  }
}

export function sujetEmail(slug: SlugEmail): string {
  return CATALOGUE_EMAILS.find((e) => e.slug === slug)?.sujet ?? "Tarineo";
}
