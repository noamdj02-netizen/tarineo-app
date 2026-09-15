import type { ArticleBlog } from "./types";

export const ARTICLES_BLOG: ArticleBlog[] = [
  {
    slug: "negocier-prix-fournisseur-artisan",
    titre: "Comment négocier ses prix chez un distributeur quand on est artisan",
    description:
      "Préparez une négociation fournisseur avec vos propres chiffres : dernier prix payé, évolution sur 12 mois et volume annuel chez Cedeo, Point P ou Rexel.",
    datePublication: "2026-01-08",
    categorie: "Négociation",
    tempsLectureMin: 6,
    motsCles: ["négociation fournisseur", "artisan bâtiment", "Cedeo", "Point P", "Rexel", "marge chantier"],
    contenu: [
      {
        type: "p",
        texte:
          "Votre commercial connaît votre volume. Vous, vous connaissez vos prix. Le problème, c'est que ces deux informations ne se croisent presque jamais au bon moment. Quand un devis arrive, vous comparez au feeling, pas à vos achats réels des six derniers mois.",
      },
      { type: "h2", texte: "Arrivez avec un prix de référence, pas avec une intuition" },
      {
        type: "p",
        texte:
          "Avant d'appeler votre représentant, notez pour chaque référence concernée : le dernier prix payé, la date, le distributeur et le prix moyen sur 12 mois. Un écart de 5 à 15 % sur du matériel récurrent, multiplié par la quantité du chantier, représente souvent plusieurs centaines d'euros.",
      },
      {
        type: "ul",
        items: [
          "Demandez une remise sur les lignes où vous avez déjà payé moins récemment.",
          "Citez une date et un montant précis, pas « c'était moins cher avant ».",
          "Regroupez vos demandes par chantier pour montrer le volume en jeu.",
        ],
      },
      { type: "h2", texte: "Le bon moment pour négocier" },
      {
        type: "p",
        texte:
          "La fenêtre la plus efficace reste la validation du devis, avant bon de commande. Une fois la commande passée, le levier disparaît. Centraliser vos devis et factures vous permet de repérer une hausse dès réception, pas à la fin du mois.",
      },
      {
        type: "p",
        texte:
          "Tarineo est conçu pour ça : chaque devis importé est comparé à votre historique personnel. Vous savez en quelques secondes si la ligne est cohérente avec ce que vous avez déjà payé, chez ce distributeur ou ailleurs.",
      },
    ],
  },
  {
    slug: "hausse-prix-materiaux-batiment-2025",
    titre: "Hausse des prix matériaux en 2025 : ce que voient les artisans sur le terrain",
    description:
      "Cuivre, sanitaire, électricité : pourquoi les prix bougent encore et comment repérer une hausse anormale sur vos devis fournisseurs avant de signer.",
    datePublication: "2026-01-22",
    categorie: "Marché",
    tempsLectureMin: 5,
    motsCles: ["hausse prix matériaux", "inflation BTP", "devis fournisseur", "plombier chauffagiste", "électricien"],
    contenu: [
      {
        type: "p",
        texte:
          "Les indices matières ont ralenti par rapport à 2022-2023, mais sur le terrain les artisans constatent encore des reprises sur le cuivre, certains équipements sanitaires et l'électricité de chantier. Ce n'est plus une vague unique : ce sont des ajustements par famille de produits, parfois silencieux ligne par ligne.",
      },
      { type: "h2", texte: "Pourquoi le même produit change de prix sans alerte" },
      {
        type: "p",
        texte:
          "Les distributeurs mettent à jour leurs tarifs par référence interne. Votre devis affiche un libellé familier, mais le code article et le prix unitaire ont changé depuis votre dernier achat. Sans historique centralisé, la hausse passe dans le lot.",
      },
      {
        type: "ul",
        items: [
          "Comparez le prix unitaire HT, pas seulement le total du devis.",
          "Surveillez les références achetées plus de trois fois par an.",
          "Gardez les factures : ce sont vos preuves en cas de litige ou de renégociation.",
        ],
      },
      { type: "h2", texte: "Agir avant la commande" },
      {
        type: "p",
        texte:
          "Une hausse de 8 % sur une pompe à chaleur ou un chauffe-eau peut absorber la marge d'un petit chantier. L'enjeu n'est pas de tout comparer au marché mondial, mais de savoir si vous payez plus que vos propres achats passés.",
      },
    ],
  },
  {
    slug: "suivre-historique-achats-distributeur",
    titre: "Suivre son historique d'achats par distributeur sans tableur",
    description:
      "Factures éparpillées, devis par mail, bons de commande au comptoir : comment reconstruire un historique fiable pour comparer vos prix Cedeo, Point P, Rexel et autres enseignes.",
    datePublication: "2026-02-05",
    categorie: "Organisation",
    tempsLectureMin: 5,
    motsCles: ["historique achats", "gestion achats artisan", "factures fournisseurs", "tableau de bord BTP"],
    contenu: [
      {
        type: "p",
        texte:
          "La plupart des artisans gèrent leurs achats à la mémoire et au classeur papier. Ça suffit tant que les volumes restent modestes. Dès que vous alternez plusieurs enseignes et plusieurs chantiers par mois, retrouver « combien j'ai payé ce disjoncteur en mars » devient une chasse au trésor.",
      },
      { type: "h2", texte: "Ce qu'un historique utile doit contenir" },
      {
        type: "ul",
        items: [
          "Référence produit normalisée (même libellé ≠ même produit selon l'enseigne).",
          "Prix unitaire HT, remise appliquée et date du document.",
          "Type de document : devis, facture, bon de commande.",
          "Distributeur, pour comparer vos conditions habituelles.",
        ],
      },
      { type: "h2", texte: "Devis et factures : deux rôles différents" },
      {
        type: "p",
        texte:
          "Un devis sert à anticiper une hausse avant achat. Une facture ou un bon de commande confirme le prix réellement engagé. Mélanger les deux fausse les moyennes. Tarineo distingue ces types pour que vos alertes et vos statistiques restent fiables.",
      },
    ],
  },
  {
    slug: "bfa-remise-fin-annee-distributeurs",
    titre: "BFA et remises de fin d'année : suivre son volume chez chaque distributeur",
    description:
      "Objectif annuel Cedeo, Point P ou Rexel : comment suivre votre chiffre d'affaires HT par enseigne et ne pas rater une remise négociée avec votre commercial.",
    datePublication: "2026-02-18",
    categorie: "Négociation",
    tempsLectureMin: 4,
    motsCles: ["BFA distributeur", "remise fin d'année", "volume achats", "Cedeo", "artisan"],
    contenu: [
      {
        type: "p",
        texte:
          "La remise de fin d'année (BFA) dépend souvent d'un seuil de chiffre d'affaires HT cumulé chez un distributeur. Le commercial vous l'a annoncé en janvier ; en septembre, personne ne sait plus où vous en êtes.",
      },
      { type: "h2", texte: "Pourquoi le suivi manuel dérape" },
      {
        type: "p",
        texte:
          "Les factures arrivent sur plusieurs mois, parfois avec des avoirs ou des retours. Additionner à la main dans un tableur fonctionne deux mois, puis une facture manque et l'objectif devient approximatif.",
      },
      {
        type: "ul",
        items: [
          "Fixez un objectif HT par enseigne et une période (souvent l'année civile, parfois glissante).",
          "Ne comptez que les achats réellement engagés (factures, bons de commande).",
          "Vérifiez chaque trimestre pour ajuster vos achats si vous êtes proche du seuil.",
        ],
      },
    ],
  },
  {
    slug: "facturation-electronique-artisan-2026",
    titre: "Facturation électronique 2026-2027 : ce que ça change pour les artisans",
    description:
      "Réforme de la facturation électronique B2B : calendrier, Plateforme Agréée, et comment garder la maîtrise de vos achats matériaux en parallèle.",
    datePublication: "2026-03-01",
    categorie: "Réglementation",
    tempsLectureMin: 6,
    motsCles: ["facturation électronique", "artisan 2026", "Plateforme Agréée", "BTP", "e-facture"],
    contenu: [
      {
        type: "p",
        texte:
          "La facturation électronique entre entreprises devient progressivement obligatoire en France. Pour les artisans, l'enjeu immédiat concerne surtout la facturation clients et la réception des factures fournisseurs via une Plateforme Agréée (PA).",
      },
      { type: "h2", texte: "Ce qui est attendu des TPE et PME" },
      {
        type: "p",
        texte:
          "Le calendrier est échelonné selon la taille de l'entreprise. L'objectif réglementaire est la traçabilité et la standardisation des flux, pas la négociation de vos prix matériaux. Ce sont deux sujets distincts à ne pas confondre.",
      },
      { type: "h2", texte: "Tarineo n'est pas une Plateforme Agréée" },
      {
        type: "p",
        texte:
          "Tarineo analyse vos devis et factures fournisseurs pour protéger votre marge sur les achats. Il complète votre PA ou votre logiciel de facturation clients, sans le remplacer. Vous gardez un outil dédié à la comparaison de prix et au suivi de vos dépenses par distributeur.",
      },
    ],
  },
  {
    slug: "comparer-devis-facture-fournisseur",
    titre: "Devis vs facture fournisseur : les écarts à repérer avant de payer",
    description:
      "Prix unitaire, remise, quantité : les contrôles simples pour éviter qu'un devis validé à l'oral se transforme en facture plus chère que prévu.",
    datePublication: "2026-03-12",
    categorie: "Contrôle",
    tempsLectureMin: 5,
    motsCles: ["devis fournisseur", "facture fournisseur", "contrôle prix", "artisan", "marge"],
    contenu: [
      {
        type: "p",
        texte:
          "Sur le chantier, on valide vite. Le bon de commande part, la livraison arrive, la facture suit. Si personne ne recoupe la facture avec le devis initial, une remise oubliée ou un prix unitaire modifié passe facilement.",
      },
      { type: "h2", texte: "Les trois lignes à vérifier en priorité" },
      {
        type: "ul",
        items: [
          "Prix unitaire HT ligne par ligne, pas seulement le total TTC.",
          "Remise en pourcentage ou en montant : identique au devis ?",
          "Références : même code article que celui commandé ?",
        ],
      },
      { type: "h2", texte: "Automatiser le contrôle sans y passer une heure" },
      {
        type: "p",
        texte:
          "Photographier ou importer le devis puis la facture dans un outil qui extrait les lignes permet de comparer en quelques secondes. L'objectif n'est pas la comptabilité, c'est de confirmer que vous payez ce qui avait été négocié.",
      },
    ],
  },
];
