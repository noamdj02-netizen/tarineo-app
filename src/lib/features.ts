// Source unique des 7 fonctionnalités de la landing page — utilisée à la fois par
// FeaturesTabs.tsx (panneau détaillé, section "Ce que vous gagnez") et par le mega-menu
// "Fonctionnalités" du header (LandingNav.tsx, aperçu condensé). Le slug relie les deux :
// cliquer une entrée du menu ouvre l'onglet correspondant dans FeaturesTabs (voir
// NOM_EVENEMENT_OUVRIR_FONCTIONNALITE et CLE_SESSION_ONGLET_FONCTIONNALITE ci-dessous).

// Événement DOM déclenché par LandingNav (clic sur une entrée du mega-menu) quand
// FeaturesTabs est déjà monté sur la page — permet un changement d'onglet instantané
// sans dépendre du montage/démontage lié à la navigation.
export const NOM_EVENEMENT_OUVRIR_FONCTIONNALITE = "tarineo:ouvrir-fonctionnalite";
// Clé sessionStorage utilisée quand le clic vient d'une AUTRE page (ex. /connexion) :
// la navigation complète vers "/" démonte tout, l'événement DOM seul ne suffit pas —
// FeaturesTabs relit cette clé une fois monté.
export const CLE_SESSION_ONGLET_FONCTIONNALITE = "tarineo:onglet-fonctionnalite";
export interface Feature {
  slug: string;
  tag: string;
  icone: string;
  titre: string;
  /** Résumé en une ligne, pour l'aperçu du mega-menu. */
  descriptionCourte: string;
  texte: string;
  highlight: string;
  bientotDisponible?: boolean;
}

export const FEATURES: Feature[] = [
  {
    slug: "analyse-ia",
    tag: "Analyse IA",
    icone: "🤖",
    titre: "Détection des hausses sur votre historique",
    descriptionCourte: "Alerte dès qu'un prix augmente par rapport à votre historique.",
    texte:
      "Chaque nouveau devis est automatiquement comparé à votre historique personnel. Une alerte s'affiche dès qu'un prix a augmenté par rapport à vos achats précédents.",
    highlight: "“J'ai économisé 340€ sur une commande la semaine dernière grâce à l'alerte.”",
  },
  {
    slug: "classement",
    tag: "Classement",
    icone: "🗂️",
    titre: "Toutes vos factures classées chronologiquement",
    descriptionCourte: "Retrouvez n'importe quelle facture en 10 secondes.",
    texte:
      "Vos factures sont automatiquement triées du 1er janvier au 31 décembre. Filtrez par mois, par distributeur ou par référence produit. Retrouvez n'importe quelle facture en 10 secondes — comme un relevé bancaire, mais pour vos achats matériaux.",
    highlight: "Fini les mails à fouiller et les PDF perdus dans vos téléchargements.",
  },
  {
    slug: "tableau-de-bord",
    tag: "Tableau de bord",
    icone: "📊",
    titre: "Vos achats annuels par distributeur",
    descriptionCourte: "Vos dépenses par distributeur, calculées automatiquement.",
    texte:
      "À chaque facture ajoutée, vos dépenses mensuelles et annuelles se calculent automatiquement. Une jauge visuelle par distributeur vous montre en un coup d'œil où va votre argent et comment vos dépenses évoluent au fil de l'année.",
    highlight:
      "Exemple — Janvier à Juin : Distributeur A 23 400 € (49%) · Distributeur B 14 800 € (31%) · Distributeur C 9 000 € (20%). Négociez un accord cadre avec vos vrais chiffres en main.",
  },
  {
    slug: "comparateur",
    tag: "Comparateur",
    icone: "⚖️",
    titre: "Comparez vos prix entre vos distributeurs",
    descriptionCourte: "La meilleure offre entre vos distributeurs habituels.",
    texte:
      "Vous achetez chez plusieurs enseignes ? Tarineo centralise vos tarifs et vous montre, référence par référence, chez lequel de vos fournisseurs habituels vous obtenez les meilleures conditions.",
    highlight: "Compatible avec les devis de 30+ enseignes : Cedeo, Point P, Rexel, Brossette, Richardson, Aubade…",
  },
  {
    slug: "devis-client",
    tag: "Devis client",
    icone: "📄",
    titre: "Devis clé en main pour votre client final",
    descriptionCourte: "Un devis professionnel généré en 2 minutes.",
    texte:
      "Ajoutez le coût de vos produits, votre taux horaire et vos frais annexes personnalisés. Tarineo génère un devis professionnel prêt à remettre à votre client — avec votre logo, votre SIRET et les mentions légales déjà inclus.",
    highlight: "Matériel 850€ + 8h à 50€/h + déplacement 60€ → Devis PDF professionnel en 2 minutes, à votre image.",
  },
  {
    slug: "alerte-intelligente",
    tag: "Alerte intelligente",
    icone: "🔔",
    titre: "Rappel accord de fin d'année",
    descriptionCourte: "Le bon moment pour négocier votre remise de fin d'année.",
    texte:
      "Quand vos achats annuels chez un distributeur atteignent un seuil significatif, Tarineo vous alerte automatiquement pour que vous pensiez à négocier votre remise de fin d'année avant qu'il soit trop tard.",
    highlight: "“Vous avez dépensé 23 400 € chez ce distributeur cette année. Avez-vous négocié votre accord de fin d'année ?”",
    bientotDisponible: true,
  },
  {
    slug: "rentabilite",
    tag: "Rentabilité",
    icone: "🧮",
    titre: "Calculateur de marge chantier",
    descriptionCourte: "Votre prix de vente conseillé, calculé pour vous.",
    texte:
      "Entrez votre matériel, votre temps et votre sous-traitance. Tarineo calcule votre marge brute, nette, et le prix de vente conseillé selon votre objectif de marge.",
    highlight: "Achat 850€ + MO 400€ → Prix conseillé à 35% de marge : 1 885€",
    bientotDisponible: true,
  },
];
