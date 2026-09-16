/**
 * Bibliothèque d'enseignes courantes chez les artisans du bâtiment.
 * Ce n'est pas un catalogue de prix publics : chaque carte sert de point d'entrée
 * pour importer un devis/facture de cette enseigne, puis comparer à l'historique
 * personnel de l'artisan.
 */
export type EnseigneBibliotheque = {
  /** Identifiant stable utilisé dans l'URL /fournisseurs/[id] pour une enseigne non encore suivie. */
  id: string;
  nom: string;
  /** Clé de normalisation proche de normaliserDistributeur (sans accents, minuscules). */
  normHint: string;
  metiers: string;
  description: string;
};

export const BIBLIOTHEQUE_FOURNISSEURS: EnseigneBibliotheque[] = [
  {
    id: "cedeo",
    nom: "Cedeo",
    normHint: "CEDEO",
    metiers: "Plomberie · Chauffage · Sanitaire",
    description: "Importez un devis Cedeo pour détecter les hausses sur votre historique.",
  },
  {
    id: "point-p",
    nom: "Point P",
    normHint: "POINT P",
    metiers: "Gros œuvre · Matériaux · Carrelage",
    description: "Comparez vos conditions Point P à vos achats précédents.",
  },
  {
    id: "rexel",
    nom: "Rexel",
    normHint: "REXEL",
    metiers: "Électricité · Éclairage · Domotique",
    description: "Suivez les tarifs matériel électrique que vous avez déjà payés.",
  },
  {
    id: "brossette",
    nom: "Brossette",
    normHint: "BROSSETTE",
    metiers: "Plomberie · Chauffage",
    description: "Ajoutez Brossette à votre suivi dès le premier document importé.",
  },
  {
    id: "richardson",
    nom: "Richardson",
    normHint: "RICHARDSON",
    metiers: "Plomberie · Sanitaire · Chauffage",
    description: "Repérez si Richardson a augmenté par rapport à vos derniers achats.",
  },
  {
    id: "aubade",
    nom: "Aubade",
    normHint: "AUBADE",
    metiers: "Sanitaire · Salle de bains",
    description: "Importez une facture Aubade pour alimenter votre historique perso.",
  },
  {
    id: "sonepar",
    nom: "Sonepar",
    normHint: "SONEPAR",
    metiers: "Électricité · Industrie",
    description: "Comparez Sonepar aux autres enseignes déjà dans votre historique.",
  },
  {
    id: "leroy-merlin",
    nom: "Leroy Merlin",
    normHint: "LEROY MERLIN",
    metiers: "Multi-corps · Pro",
    description: "Utile pour les petits chantiers — toujours comparé à vos prix payés.",
  },
];

export function enseigneParId(id: string): EnseigneBibliotheque | undefined {
  return BIBLIOTHEQUE_FOURNISSEURS.find((e) => e.id === id);
}

export function enseigneParNorm(norm: string): EnseigneBibliotheque | undefined {
  const cle = norm
    .toUpperCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^A-Z0-9 ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return BIBLIOTHEQUE_FOURNISSEURS.find((e) => {
    const hint = e.normHint;
    return cle === hint || cle.includes(hint) || hint.includes(cle) || cle.replace(/ /g, "") === hint.replace(/ /g, "");
  });
}
