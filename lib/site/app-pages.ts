/** Copy des pages app. Données chiffrées des cartes = démo (DEMO_MARK). */

export const APP_PAGES = {
  analyse: {
    label: "Analyse",
    title: "Photo ou PDF,",
    tail: "on lit le devis.",
    text: "Déposez le devis Cedeo sur le chantier. Tarinéo extrait les lignes, compare aux prix déjà payés, puis vous créez le devis client.",
  },
  documents: {
    label: "Distributeur",
    title: "Ce que vous achetez,",
    tail: "rangé par chantier.",
    text: "Devis, BC, bon d’enlèvement, facture. Déposez, reliez au chantier, transformez pour le client.",
  },
  alertes: {
    label: "Hausses",
    title: "Le même article,",
    tail: "plus cher.",
    text: "Écarts relevés sur les pièces d’achat. Filtrez par chantier avant de relancer le distributeur.",
  },
  classement: {
    label: "Achats",
    title: "Ce qui pèse",
    tail: "sur vos affaires.",
    text: "Volumes et montants sur les pièces client. Pour voir où la marge se joue.",
  },
  chantiers: {
    label: "Chantiers",
    title: "Un chantier ouvert,",
    tail: "les autres en pause.",
    text: "Chaque affaire a ses achats, son client, ses devis à renvoyer. Le Focus est celui du jour.",
  },
  devis: {
    label: "Entreprise",
    title: "À renvoyer",
    tail: "au client.",
    text: "Devis, bon de commande, facture. Téléchargez le PDF ou envoyez-le par e-mail.",
  },
  fournisseurs: {
    label: "Fournisseurs",
    title: "Vos enseignes,",
    tail: "et ce qu’elles coûtent.",
    text: "Encours par distributeur. Ouvrez les pièces pour transformer ou comparer.",
  },
  comparateur: {
    label: "Comparateur",
    title: "Le même article,",
    tail: "deux prix.",
    text: "Période, prix d’achat, top hausses. Comparez avant de relancer.",
  },
  tarifs: {
    label: "Tarifs",
    title: "Votre formule",
    tail: "Tarinéo.",
    text: "1er mois offert, sans carte. Puis Starter, Pro ou Équipe, sans engagement.",
  },
} as const;

export const PAGE_FEATURE_IDS = {
  documents: ["depot", "factures", "apercu", "format"],
  alertes: ["hausses", "top-hausses", "evo-prix", "actions"],
  classement: ["top-vendus", "famille", "encours", "ventes", "ca"],
  chantiers: ["objectifs", "projection"],
  devis: ["devis", "ajouter", "devis-dist", "statut", "fiche", "carte"],
  fournisseurs: ["distributeurs", "brico", "projection", "produits"],
  comparateur: ["periode", "evo-achat", "top-hausses", "evo-prix"],
} as const;
