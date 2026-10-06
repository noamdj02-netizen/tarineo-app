import type { BlogMetierSlug, BlogPost } from "@/lib/site/blog/types";

const UPDATED = "2026-10-06"; // dont facturation électronique (voir docs/claude-blog/seo-audit.md)

function post(
  partial: Omit<BlogPost, "publishedAt" | "updatedAt"> & { publishedAt?: string },
): BlogPost {
  return {
    ...partial,
    publishedAt: partial.publishedAt ?? UPDATED,
    updatedAt: UPDATED,
  };
}

/** Articles par métier — contenus éditoriaux, dates mises à jour pour le SEO. */
export const BLOG_POSTS: BlogPost[] = [
  post({
    slug: "plombier-devis-fournisseur-marge-chantier",
    title: "Plombier : lire un devis fournisseur et protéger sa marge sur chantier",
    metaDescription:
      "Devis négoce, Point.P, Rexel : hausses sur le cuivre et les sanitaires. Comment un plombier compare ses prix, suit ses chantiers et évite de sous-facturer le client.",
    metier: "Plombier",
    metierSlug: "plombier",
    readingMinutes: 9,
    keywords: [
      "plombier devis fournisseur",
      "marge plomberie",
      "logiciel devis artisan",
      "analyse devis plombier",
      "devis salle de bain artisan",
    ],
    problems: [
      "Plusieurs devis fournisseurs pour un même chantier (SDB, chauffage, rénovation).",
      "Prix qui bougent entre le devis client et la commande réelle.",
      "Temps perdu à ressaisir les lignes dans Excel ou le logiciel de devis.",
      "Difficile de savoir si le tuyau ou le radiateur a déjà augmenté ce trimestre.",
    ],
    sections: [
      {
        heading: "Le quotidien : beaucoup de PDF, peu de visibilité",
        paragraphs: [
          "Sur une rénovation de salle de bain, vous cumulez souvent un devis sanitaire, un devis chauffage et parfois une commande urgente chez un second négoce. Chaque PDF a un format différent : références, remises, frais de port.",
          "Sans historique centralisé, vous comparez « à la tête » et vous acceptez parfois une hausse de 8 à 12 % sans vous en rendre compte avant la facture.",
        ],
      },
      {
        heading: "Ce qui aide vraiment (sans promesse magique)",
        paragraphs: [
          "Conserver chaque devis fournisseur au même endroit, lié au chantier.",
          "Extraire les lignes utiles (référence, quantité, prix HT) pour les retrouver au moment du devis client.",
          "Comparer une nouvelle offre avec la dernière fois que vous avez acheté la même famille de produit.",
          "Appliquer une marge cohérente sur toutes les lignes avant d’envoyer le devis au particulier ou au syndic.",
        ],
      },
      {
        heading: "Checklist avant d’envoyer le devis client",
        paragraphs: [
          "Vérifiez que chaque gros poste (sanitaire, évacuation, per) est aligné avec le dernier devis négoce validé.",
          "Indiquez dans le dossier la date du devis fournisseur de référence : utile en cas de litige ou de hausse entre signature et commande.",
          "Si une ligne a bougé de plus de quelques points, mettez à jour le devis client avant les travaux, pas après la facture.",
        ],
      },
      {
        heading: "Où Tarinéo intervient",
        paragraphs: [
          "Tarinéo lit vos devis et factures fournisseurs (PDF ou photo), repère les lignes et signale les écarts par rapport à vos achats passés. Vous gardez la main sur le prix client et sur le choix du fournisseur.",
          "Sur la landing, vous pouvez aussi tester la transformation devis fournisseur → devis client PDF sans compte.",
        ],
      },
    ],
  }),
  post({
    slug: "electricien-suivi-prix-materiel-devis",
    title: "Électricien : suivre les prix du matériel et sécuriser vos devis",
    metaDescription:
      "Tableaux, gaines, câbles : pourquoi les électriciens perdent de la marge sur les devis et comment structurer l’analyse fournisseur par chantier.",
    metier: "Électricien",
    metierSlug: "electricien",
    readingMinutes: 8,
    keywords: [
      "électricien devis",
      "prix matériel électricité",
      "marge électricien",
      "devis chantier",
      "grossiste électricité devis",
    ],
    problems: [
      "Catalogues fournisseurs volumineux et mises à jour fréquentes.",
      "Devis client fixé alors que le grossiste a revu ses tarifs.",
      "Chantiers neufs et rénovation mélangés dans la même boîte mail.",
      "Peu de temps pour contrôler ligne par ligne avant la commande.",
    ],
    sections: [
      {
        heading: "Hausse des composants : un sujet récurrent",
        paragraphs: [
          "Les références changent, les équivalents arrivent, les promos expirent. Un devis signé il y a trois semaines peut déjà être en retrait par rapport au prix d’achat du jour.",
          "L’enjeu n’est pas de tout automatiser, mais d’avoir une alerte quand une ligne sort de votre fourchette habituelle.",
        ],
      },
      {
        heading: "Organisation par chantier",
        paragraphs: [
          "Un dossier par logement, par lot ou par appel d’offres limite les erreurs de marge. Vous retrouvez le devis fournisseur, la commande et la facture au même endroit.",
          "C’est aussi plus simple pour expliquer un écart au client ou à l’entreprise générale.",
        ],
      },
      {
        heading: "Tableaux, promos et références équivalentes",
        paragraphs: [
          "Les grossistes remplacent souvent une référence par une autre sans changer le libellé affiché sur le devis client. Notez la référence fabricant sur votre devis interne.",
          "Les promos « lot » peuvent masquer une hausse sur le prix unitaire hors promo : comparez le PU HT, pas seulement le total ligne.",
        ],
      },
      {
        heading: "Piste concrète",
        paragraphs: [
          "Importez le PDF du grossiste, vérifiez les totaux HT et les quantités, puis ajustez votre devis client avec une marge que vous maîtrisez. Tarinéo est pensé pour ce flux, pas pour remplacer votre logiciel de conformité ou de plans.",
        ],
      },
    ],
  }),
  post({
    slug: "electricien-irve-borne-recharge-devis",
    title: "Électricien : borne IRVE, devis matériel et devis pose",
    metaDescription:
      "Installation de borne de recharge : séparer le devis grossiste (IRVE, câble, protection) du devis client pose et éviter les oublis de lignes.",
    metier: "Électricien",
    metierSlug: "electricien",
    readingMinutes: 8,
    keywords: [
      "borne recharge devis",
      "IRVE électricien",
      "devis installation borne",
      "marge électricien IRVE",
    ],
    problems: [
      "Devis fournisseur avec wallbox, disjoncteur, câble et accessoires sur des pages différentes.",
      "Devis client envoyé avant validation du prix matériel chez le grossiste.",
      "Oubli de la ligne « mise en service » ou du test de continuité dans le chiffrage client.",
      "Hausse de prix entre commande et livraison de la borne.",
    ],
    sections: [
      {
        heading: "Deux devis, deux logiques",
        paragraphs: [
          "Le devis négoce liste le matériel certifié et les protections. Votre devis client doit ajouter étude, tranchée ou goulotte, pose, paramétrage et parfois renfort du tableau.",
          "Ne mélangez pas les deux dans un seul PDF fournisseur : vous perdez la visibilité sur la marge pose.",
        ],
      },
      {
        heading: "Lignes souvent oubliées",
        paragraphs: [
          "Chemin de câble, percements, reprise tableau, étiquetage, attestation de conformité selon votre process.",
          "Comparez le devis grossiste ligne par ligne avant d’envoyer le devis client : une option « connectée » peut ajouter plusieurs centaines d’euros HT.",
        ],
      },
      {
        heading: "Suivi après commande",
        paragraphs: [
          "Rattachez commande, bon de livraison et facture au dossier client. Si le PU a bougé, avenant client avant la pose.",
          "Tarinéo aide à extraire les montants des PDF fournisseur pour recaler le devis client sans ressaisie manuelle.",
        ],
      },
    ],
  }),
  post({
    slug: "peintre-factures-fournisseur-marge",
    title: "Peintre en bâtiment : maîtriser peinture, consommables et marge",
    metaDescription:
      "Devis peinture, consommables et reprises : comment les peintres structurent leurs achats et leurs devis clients sans se faire grignoter la marge.",
    metier: "Peintre",
    metierSlug: "peintre",
    readingMinutes: 8,
    keywords: [
      "peintre bâtiment devis",
      "marge peinture",
      "facture fournisseur peintre",
      "devis peinture m2",
    ],
    problems: [
      "Estimation des quantités (m², couches) vs réalité chantier.",
      "Multiples petits achats chez le dépôt qui ne sont pas rattachés au bon dossier.",
      "Devis client envoyé avant validation du prix peinture pro.",
      "Reprises et retouches non refacturées.",
    ],
    sections: [
      {
        heading: "Petits montants, gros impact",
        paragraphs: [
          "Une remise en litres mal convertie ou un primaire oublié dans le devis client peut représenter plusieurs points de marge sur un appartement.",
          "Centraliser les factures fournisseur par chantier donne une photo claire avant de signer le devis.",
        ],
      },
      {
        heading: "Bonnes pratiques",
        paragraphs: [
          "Nommer chaque chantier de façon unique dans vos mails et vos PDF.",
          "Comparer le devis fournisseur au devis client ligne à ligne pour les gros postes (peinture, enduit, protection).",
          "Mettre à jour le devis client si le fournisseur revoit ses prix après accord verbal.",
        ],
      },
      {
        heading: "Consommables oubliés dans le devis client",
        paragraphs: [
          "Rubans, bâches, abrasifs et diluants représentent souvent 3 à 8 % du coût matière sur un chantier intérieur.",
          "Les regrouper dans une ligne « fournitures » alimentée par vos factures dépôt évite de sous-estimer le poste.",
        ],
      },
      {
        heading: "Lien avec Tarinéo",
        paragraphs: [
          "Classer les factures par chantier et extraire les montants HT aide à recaler un devis client avant signature, surtout sur les rénovations longues.",
        ],
      },
    ],
  }),
  post({
    slug: "macon-devis-gros-oeuvre-entreprise",
    title: "Maçon : devis gros œuvre, volume et marge entreprise",
    metaDescription:
      "Béton, parpaings, location matériel : guide pour les maçons et petites entreprises de gros œuvre qui veulent suivre leurs achats et leurs chantiers.",
    metier: "Maçon",
    metierSlug: "macon",
    readingMinutes: 9,
    keywords: ["maçon devis", "gros œuvre marge", "suivi chantier maçonnerie", "devis béton parpaing"],
    problems: [
      "Devis volumineux avec des dizaines de lignes.",
      "Coordination avec d’autres corps d’état et délais qui glissent.",
      "Achats en urgence sur chantier (béton, fer) mal tracés.",
      "Marge globale difficile à lire sur plusieurs mois.",
    ],
    sections: [
      {
        heading: "Volume et lisibilité",
        paragraphs: [
          "Un devis maçonnerie peut dépasser plusieurs pages. L’extraction automatique des lignes évite la ressaisie et les oublis de lignes mineures qui s’additionnent.",
        ],
      },
      {
        heading: "Entreprise et chantier",
        paragraphs: [
          "Pour une structure de plusieurs équipes, le suivi par chantier permet de voir quel dossier consomme trop de matériel par rapport au devis initial.",
        ],
      },
      {
        heading: "Locations et sous-traitance",
        paragraphs: [
          "Nacelle, benne, pompe à béton : ces lignes sont parfois sur un devis séparé. Rattachez-les au même dossier chantier pour ne pas perdre la marge globale.",
          "Les avenants client doivent refléter les achats réels, pas seulement les heures équipe.",
        ],
      },
      {
        heading: "Lecture des PDF fournisseurs",
        paragraphs: [
          "Sur les devis longs, l’extraction des lignes (qté, PU, remise) limite les erreurs de ressaisie et les oublis de petites lignes qui s’accumulent.",
        ],
      },
    ],
  }),
  post({
    slug: "carreleur-devis-client-fournisseur",
    title: "Carreleur : du devis fournisseur au devis client sans erreur de marge",
    metaDescription:
      "Carrelage, colle, chutes : comment les carreleurs transforment un devis fournisseur en devis client rentable.",
    metier: "Carreleur",
    metierSlug: "carreleur",
    readingMinutes: 8,
    keywords: [
      "carreleur devis",
      "transformer devis fournisseur",
      "marge carrelage",
      "devis showroom carrelage",
    ],
    problems: [
      "Chutes et surcommande mal intégrées dans le prix client.",
      "Plusieurs formats de devis selon les showrooms.",
      "Retard sur la pose si le devis fournisseur était sous-estimé.",
    ],
    sections: [
      {
        heading: "Transformer, pas recopier",
        paragraphs: [
          "Repartir des lignes du showroom, appliquer votre coefficient de pose et de marge, puis produire un PDF client clair. C’est le même principe que sur la démo Tarinéo « devis fournisseur → devis client ».",
        ],
      },
      {
        heading: "Chutes, joints et colles",
        paragraphs: [
          "Prévoir un taux de casse et de coupe dans le devis client, pas seulement la surface vendue au showroom.",
          "Les colles et joints à fort écart de prix méritent une ligne dédiée sur le devis fournisseur pour les retrouver à la commande.",
        ],
      },
      {
        heading: "Délais showroom vs planning pose",
        paragraphs: [
          "Un devis showroom validé tardivement peut bloquer la pose : datez chaque version PDF dans le dossier chantier.",
        ],
      },
    ],
  }),
  post({
    slug: "menuisier-fenetres-devis-fournisseur",
    title: "Menuisier : fenêtres, mesures et devis fournisseur",
    metaDescription:
      "Menuiserie aluminium et bois : suivre les devis ateliers, éviter les écarts entre commande et pose.",
    metier: "Menuisier",
    metierSlug: "menuisier",
    readingMinutes: 8,
    keywords: [
      "menuisier devis",
      "fenêtre devis fournisseur",
      "marge menuiserie",
      "devis menuiserie aluminium",
    ],
    problems: [
      "Devis atelier complexe (options, coloris, vitrage).",
      "Écart entre le devis menuiserie et le devis pose chez le client final.",
      "Relances fournisseur et client sur le même dossier.",
    ],
    sections: [
      {
        heading: "Un seul fil par dossier",
        paragraphs: [
          "Rattacher le devis fabricant, votre devis pose et les échanges mail au même chantier limite les versions contradictoires.",
        ],
      },
      {
        heading: "Options, coloris et avenants",
        paragraphs: [
          "Chaque option (vitrage, poignée, volet) doit apparaître sur le devis client et sur la commande atelier avec la même référence.",
          "Un avenant client sans mise à jour du devis fournisseur crée souvent une marge négative sur la pose.",
        ],
      },
      {
        heading: "Suivi des hausses atelier",
        paragraphs: [
          "Les fabricants révisent les grilles une à deux fois par an : comparez le nouveau devis à la commande précédente sur un modèle équivalent.",
        ],
      },
    ],
  }),
  post({
    slug: "couvreur-toiture-devis-marge",
    title: "Couvreur : devis toiture, intempéries et marge",
    metaDescription:
      "Tuiles, zinguerie, étanchéité : bonnes pratiques pour les couvreurs qui veulent sécuriser leurs devis après les devis fournisseur.",
    metier: "Couvreur",
    metierSlug: "couvreur",
    readingMinutes: 8,
    keywords: [
      "couvreur devis",
      "toiture marge",
      "devis zinguerie",
      "devis toiture sinistre",
    ],
    problems: [
      "Devis urgent après sinistre ou fuite.",
      "Matériaux sensibles aux délais (tuiles, liteaux).",
      "Sous-estimation de la zinguerie dans le devis client.",
    ],
    sections: [
      {
        heading: "Urgence et rigueur",
        paragraphs: [
          "Même en urgence, garder une trace du devis fournisseur du jour permet de justifier le prix client et de comparer si une seconde offre arrive.",
        ],
      },
      {
        heading: "Zinguerie et petites fournitures",
        paragraphs: [
          "Gouttières, solins et vis de fixation sont souvent sous-chiffrés dans le devis client alors qu’ils pèsent sur la marge.",
          "Demandez un devis négoce détaillé sur la zinguerie plutôt qu’une ligne globale « accessoires ».",
        ],
      },
      {
        heading: "Sinistre et assurance",
        paragraphs: [
          "Conservez le devis fournisseur daté et le devis client : les assureurs et les syndics demandent souvent la traçabilité des montants matière.",
        ],
      },
    ],
  }),
  post({
    slug: "couvreur-refection-toiture-devis",
    title: "Couvreur : réfection de toiture complète et lecture d’un long devis tuiles",
    metaDescription:
      "Réfection toiture : liteaux, tuiles, écran sous-toiture et zinguerie. Comment lire un devis fournisseur long et sécuriser le devis client.",
    metier: "Couvreur",
    metierSlug: "couvreur",
    readingMinutes: 9,
    keywords: [
      "réfection toiture devis",
      "devis tuiles couvreur",
      "toiture complète marge",
      "devis zinguerie toiture",
    ],
    problems: [
      "Devis négoce sur plusieurs pages (tuiles, accessoires, vis, écran).",
      "Difficile de voir si la zinguerie est incluse ou en option.",
      "Écart entre quantités théoriques et pertes sur le chantier.",
      "Client qui compare uniquement le total TTC sans détail des postes.",
    ],
    sections: [
      {
        heading: "Structurer un devis matière volumineux",
        paragraphs: [
          "Regroupez mentalement par lots : couverture, zinguerie, écran, ventilation, petites pièces. Vérifiez que chaque lot a un total HT cohérent avec votre métré.",
          "L’extraction des lignes depuis le PDF évite d’oublier une page accessoires en bas de document.",
        ],
      },
      {
        heading: "Pertes et aléas chantier",
        paragraphs: [
          "Prévoir un coefficient sur tuiles et liteaux selon votre historique (pente, découpes, chemins de cheminée).",
          "Les lignes « fournitures diverses » du négoce doivent être détaillées ou intégrées dans votre marge risque.",
        ],
      },
      {
        heading: "Devis client lisible",
        paragraphs: [
          "Le particulier comprend mieux un devis par lots (dépose, couverture, zinguerie) qu’une copie du devis fournisseur.",
          "Conservez le devis négoce daté dans le dossier : utile en cas de sinistre ou de discussion avec l’assurance.",
        ],
      },
    ],
  }),
  post({
    slug: "chauffagiste-pac-devis-hausses",
    title: "Chauffagiste : PAC, chaudières et hausses sur les devis",
    metaDescription:
      "Pompes à chaleur et chaudières : comment les chauffagistes analysent les devis fournisseurs et protègent leur marge.",
    metier: "Chauffagiste",
    metierSlug: "chauffagiste",
    readingMinutes: 9,
    keywords: [
      "chauffagiste devis",
      "pompe à chaleur devis",
      "marge chauffage",
      "devis chaudière fournisseur",
    ],
    problems: [
      "Évolution rapide des gammes PAC et des aides.",
      "Devis longs avec accessoires (ballon, régulation, fluide).",
      "Écart entre devis et facture après pose.",
    ],
    sections: [
      {
        heading: "Lots techniques",
        paragraphs: [
          "Séparer matériel, main d’œuvre et petites fournitures dans votre suivi. Tarinéo aide sur la lecture des documents fournisseur ; les aides MaPrimeRénov’ et le dimensionnement restent votre expertise.",
        ],
      },
      {
        heading: "Accessoires et régulation",
        paragraphs: [
          "Vannes, sondes, régulation et fluide peuvent représenter une part importante du devis fournisseur : vérifiez qu’ils sont repris dans votre devis client.",
        ],
      },
      {
        heading: "Écart devis / facture après pose",
        paragraphs: [
          "Comparez la facture négoce à la commande initiale avant de clôturer le chantier : les substitutions de référence sont fréquentes sur les PAC.",
        ],
      },
    ],
  }),
  post({
    slug: "serrurier-devis-securite-marge-intervention",
    title: "Serrurier : chiffrer une intervention, lire le devis fournisseur et garder sa marge",
    metaDescription:
      "Ouverture de porte, blindage, serrures multipoints : comment les serruriers structurent leurs devis fournisseurs et leurs devis clients sur les urgences et les poses.",
    metier: "Serrurier",
    metierSlug: "serrurier",
    readingMinutes: 8,
    keywords: [
      "serrurier devis",
      "marge serrurerie",
      "devis blindage porte",
      "dépannage serrurier devis",
    ],
    problems: [
      "Interventions urgentes avec peu de temps pour comparer les prix des cylindres et des serrures.",
      "Plusieurs marques (Vachette, Bricard, etc.) avec des grilles de prix différentes selon le négoce.",
      "Devis client oral ou rapide, puis facture fournisseur plus élevée que prévu.",
      "Blindage et quincaillerie : lignes techniques difficiles à ressaisir dans le logiciel de devis.",
    ],
    sections: [
      {
        heading: "Urgence ≠ devis au hasard",
        paragraphs: [
          "Même sur un dépannage, notez la référence du cylindre commandé et le PU HT. Cela évite de répéter la même erreur de marge sur le prochain client du quartier.",
          "Gardez un modèle de devis client pour dépannage (main d’œuvre + pièce + majoration) et un autre pour pose complète.",
        ],
      },
      {
        heading: "Blindage et multipoints",
        paragraphs: [
          "Les devis fournisseurs sur blindage mélangent souvent porte, paumelles, serrure et travaux atelier. Demandez le détail des lignes ou importez le PDF pour extraire les postes.",
          "Votre marge doit couvrir la pose, les réglages et un retour éventuel si la porte a du jeu.",
        ],
      },
      {
        heading: "Dossier client et preuve",
        paragraphs: [
          "Photos avant/après, devis signé et facture négoce dans le même dossier : utile pour les assurances, les syndics et les litiges.",
        ],
      },
      {
        heading: "Où Tarinéo aide",
        paragraphs: [
          "Lecture des devis quincaillerie et transformation en devis client PDF, comme pour les autres corps d’état du bâtiment. Vous restez maître des prix d’intervention et des majorations d’urgence.",
        ],
      },
    ],
  }),
  post({
    slug: "entreprise-marge-par-chantier-tableau",
    title: "Entreprise artisanale : tableau de marge par chantier sans ERP",
    metaDescription:
      "TPE du bâtiment : suivre achats, devis client et marge par dossier chantier avec des outils simples, sans logiciel ERP lourd.",
    metier: "Entreprise & chantier",
    metierSlug: "entreprise",
    readingMinutes: 9,
    keywords: [
      "marge par chantier",
      "suivi chantier TPE",
      "tableau de bord artisan",
      "marge BTP entreprise",
      "facturation électronique TPE",
    ],
    problems: [
      "Chiffre d’affaires global correct mais chantiers perdants non visibles.",
      "Achats saisis en compta trop tard pour corriger un devis en cours.",
      "Plusieurs équipes sur des dossiers sans indicateur commun.",
      "Dirigeant qui pilote au feeling fin de mois.",
    ],
    sections: [
      {
        heading: "Le minimum viable",
        paragraphs: [
          "Une ligne par chantier actif : devis client HT, achats cumulés HT (factures fournisseur), marge estimée. Mise à jour hebdomadaire suffit pour une TPE.",
          "Pas besoin de 50 colonnes : client, adresse, statut, montant vendu, achats à date, écart.",
        ],
      },
      {
        heading: "D’où viennent les achats",
        paragraphs: [
          "Chaque PDF fournisseur rattaché au bon dossier. Sans ça, le tableau ment.",
          "Les petits achats comptoir doivent être imputés au chantier ou à une ligne « frais généraux » explicite.",
        ],
      },
      {
        heading: "Relier au devis client",
        paragraphs: [
          "Si les achats dépassent le devis fournisseur de référence, déclenchez une revue : avenant, erreur de commande ou marge trop faible au départ.",
          "Tarinéo accélère la lecture des devis et factures achat pour alimenter ce suivi sans double saisie.",
        ],
      },
      {
        heading: "Rythme de pilotage",
        paragraphs: [
          "Revue courte le lundi : chantiers en alerte (marge sous seuil, achats non ventilés).",
          "Clôture chantier : comparer devis client, achats réels et temps passé avant d’archiver le dossier.",
        ],
      },
      {
        heading: "Marge et facturation électronique",
        paragraphs: [
          "Avant d’émettre une facture électronique B2B, les montants doivent être stables : le tableau de marge par chantier est le bon endroit pour détecter un écart HT ou une facture fournisseur non imputée.",
          "Une facture rejetée par le client pro ou par la plateforme coûte du temps ; un dossier aligné (devis → achats → facture client) réduit ce risque.",
        ],
      },
    ],
  }),
  post({
    slug: "entreprise-artisanale-chantiers-administratif",
    title: "Entreprise artisanale : chantiers, administratif et visibilité sur la marge",
    metaDescription:
      "Gérer plusieurs chantiers, équipes et fournisseurs : les problèmes d’administratif que rencontrent les TPE du bâtiment et comment les structurer.",
    metier: "Entreprise & chantier",
    metierSlug: "entreprise",
    readingMinutes: 10,
    keywords: [
      "gestion chantier artisan",
      "TPE bâtiment administratif",
      "marge entreprise BTP",
      "logiciel artisan",
    ],
    problems: [
      "Dirigeant qui fait devis, achats et relances le soir.",
      "Pas de vue unique sur la marge par chantier.",
      "Documents éparpillés (mail, WhatsApp, papier).",
      "Difficulté à former un apprenti ou un chef d’équipe sur « où est le bon devis ».",
    ],
    sections: [
      {
        heading: "Chantier = dossier numérique",
        paragraphs: [
          "Chaque chantier devrait avoir : devis client, devis(s) fournisseur, commandes, factures achat et factures vente. Pas besoin d’un ERP lourd pour commencer : un classement simple et un outil de lecture des PDF déjà fait une grande différence.",
        ],
      },
      {
        heading: "SEO et confiance pour vos clients",
        paragraphs: [
          "Une entreprise qui publie des contenus clairs sur son métier (blog, fiches chantier) rassure les particuliers et les donneurs d’ordre. Ce n’est pas du vent : c’est montrer que vous maîtrisez vos chiffres.",
        ],
      },
      {
        heading: "Rôle de Tarinéo",
        paragraphs: [
          "Tarinéo automatise la lecture des documents fournisseurs, la comparaison de prix et une partie des relances. Vous restez décisionnaire sur les prix client, les fournisseurs et le planning.",
        ],
      },
      {
        heading: "Former l’équipe sur le « bon devis »",
        paragraphs: [
          "Un apprenti ou un chef d’équipe doit savoir où est le devis fournisseur validé, pas seulement le devis client envoyé.",
          "Une convention de nommage (client + adresse + lot) sur les PDF évite les erreurs de commande le samedi matin.",
        ],
      },
      {
        heading: "Facturation électronique : anticiper sans paniquer",
        paragraphs: [
          "La réforme impose progressivement réception et émission de factures électroniques entre professionnels. Même une TPE du bâtiment doit savoir où arriveront les factures fournisseurs et comment elle enverra les siennes.",
          "Commencez par inventorier : logiciel actuel, expert-comptable, plateforme agréée (PDP) ou portail public. Un dossier chantier propre (devis, factures PDF, lignes lisibles) facilite la suite.",
          "Voir le guide détaillé : facturation électronique pour artisans BTP dans ce blog.",
        ],
      },
    ],
  }),
  post({
    slug: "facturation-electronique-artisan-btp-2026",
    title: "Facturation électronique pour artisans et TPE du BTP : ce qui change en pratique",
    metaDescription:
      "Réforme 2026 : réception et émission des factures électroniques, Factur-X, plateformes agréées. Guide pour artisans du bâtiment sans jargon inutile.",
    metier: "Entreprise & chantier",
    metierSlug: "entreprise",
    readingMinutes: 12,
    keywords: [
      "facturation électronique artisan",
      "facture électronique BTP",
      "Factur-X TPE",
      "plateforme agréée facture",
      "réforme facturation 2026",
    ],
    problems: [
      "Obligation légale perçue comme un « gros logiciel » alors que l’entreprise envoie encore des PDF par mail.",
      "Confusion entre facture PDF simple et facture électronique au format réglementaire.",
      "Fournisseurs et clients qui ne sont pas au même niveau de maturité.",
      "Peur de bloquer un chantier si la première e-facture est rejetée.",
      "Comptable et dirigeant qui ne parlent pas le même langage technique.",
    ],
    sections: [
      {
        heading: "De quoi parle-t-on exactement ?",
        paragraphs: [
          "La facturation électronique, ce n’est pas « envoyer un PDF par e-mail ». C’est un flux structuré : une facture dans un format normalisé (souvent Factur-X, qui combine PDF lisible et données XML), transmise via une plateforme agréée (PDP) ou le portail public de l’État, avec un cycle de vie (dépôt, réception, éventuel rejet ou litige).",
          "Pour vous, artisan ou TPE du bâtiment, l’enjeu est double : recevoir correctement les factures de vos fournisseurs (négoce, location, sous-traitants) et émettre les vôtres vers clients professionnels (entreprises générales, syndics, promoteurs, autres artisans en B2B).",
        ],
      },
      {
        heading: "Calendrier : ce qu’il faut retenir",
        paragraphs: [
          "La réforme est déployée par étapes. Toutes les entreprises assujetties à la TVA doivent pouvoir recevoir des factures électroniques à partir de septembre 2026.",
          "L’obligation d’émettre en électronique est échelonnée selon la taille de l’entreprise : les structures les plus importantes sont concernées en premier ; les micro-entreprises et très petites TPE disposent en général de délais plus longs (souvent 2027 ou 2028 selon les cas).",
          "Vérifiez votre situation avec votre expert-comptable : statut juridique, chiffre d’affaires et calendrier personnel valent mieux que les rumeurs du comptoir.",
        ],
      },
      {
        heading: "Factur-X, PDP, PPF : vocabulaire utile",
        paragraphs: [
          "Factur-X : format fréquent en France, pratique car vous gardez un PDF pour le chantier tout en transmettant des données exploitables pour la compta.",
          "PDP (plateforme de dématérialisation partenaire) : opérateur privé agréé qui échange les factures entre vous, vos clients et vos fournisseurs.",
          "PPF (portail public de facturation) : voie publique ; l’annuaire permet de savoir où router une facture selon le SIREN du destinataire.",
          "Vous n’avez pas à tout maîtriser : choisissez un interlocuteur (PDP, logiciel métier, cabinet comptable) qui prend en charge le flux technique.",
        ],
      },
      {
        heading: "Impact concret sur le chantier",
        paragraphs: [
          "Les devis et factures doivent rester alignés : mêmes lignes, mêmes quantités, mêmes libellés métier. Si vous partez d’un devis fournisseur mal recopié, l’erreur se propagera dans la facture client puis dans l’e-facture.",
          "Un dossier par chantier (devis client, devis achat, factures, avoirs) devient indispensable pour répondre à un contrôle ou à une réclamation.",
          "Les particuliers (B2C) ne sont pas dans le même cadre que le B2B : une grande partie de votre activité résidentielle peut rester sur vos process actuels jusqu’à ce que vous harmonisiez tout.",
        ],
      },
      {
        heading: "Fournisseurs du bâtiment",
        paragraphs: [
          "Rexel, Point.P, grossistes et centrales d’achat vont vous adresser des factures électroniques. Prévoyez où elles seront reçues (PDP, logiciel) et qui les rapproche du bon chantier.",
          "Continuez à comparer les prix et les lignes : une facture électronique se lit toujours ligne par ligne pour la marge, que ce soit à l’écran ou en PDF exporté.",
        ],
      },
      {
        heading: "Checklist TPE bâtiment (démarrage)",
        paragraphs: [
          "1. Confirmer la date d’obligation d’émission avec le comptable.",
          "2. Choisir PDP ou solution couplée (facturation + envoi réglementaire).",
          "3. Tester une facture test B2B vers un client qui accepte le pilote.",
          "4. Vérifier la réception d’une facture fournisseur test.",
          "5. Former une personne (souvent le dirigeant au début) sur rejet, avoir et archivage.",
          "6. Garder des PDF lisibles par chantier en parallèle pour le terrain.",
        ],
      },
      {
        heading: "Où Tarinéo se situe",
        paragraphs: [
          "Tarinéo n’est pas une plateforme agréée : il vous aide en amont sur la qualité des documents (lecture des devis et factures fournisseurs, comparaison de prix, transformation devis fournisseur → devis client, génération de PDF facture client structurés).",
          "Des données propres et des lignes cohérentes facilitent le travail de votre PDP ou de votre logiciel de facturation au moment de l’émission électronique.",
          "Objectif : ne pas découvrir une erreur de montant ou de libellé au moment du premier envoi réglementaire.",
        ],
      },
    ],
  }),
  post({
    slug: "facturation-electronique-devis-facture-meme-dossier",
    title: "Facturation électronique : enchaîner devis, facture client et pièces fournisseur dans le même dossier",
    metaDescription:
      "Pour la réforme e-facture, un même dossier chantier avec devis validé, facture client et factures achat limite les rejets et les écarts de TVA.",
    metier: "Entreprise & chantier",
    metierSlug: "entreprise",
    readingMinutes: 8,
    keywords: [
      "devis facture électronique",
      "dossier chantier facture",
      "e-facture artisan",
      "cohérence devis facture",
    ],
    problems: [
      "Devis client signé en PDF, facture ressaisie à la main avec une ligne en moins.",
      "TVA ou montant HT différent entre devis et facture électronique envoyée au syndic.",
      "Factures fournisseurs rangées dans la messagerie, pas dans le dossier chantier.",
      "Avoir ou acompte non relié au devis initial.",
    ],
    sections: [
      {
        heading: "Un seul fil documentaire",
        paragraphs: [
          "La réforme renforce une bonne pratique que les artisans performants faisaient déjà : un chantier = un fil. Devis client validé, avenants, factures d’acompte, facture finale, factures achat et avoirs fournisseurs.",
          "L’émission électronique fige des champs structurés : si le devis client disait 10 400 € HT et la facture part à 10 150 € HT sans avenant, le client pro ou l’outil peut bloquer ou questionner.",
        ],
      },
      {
        heading: "Du devis fournisseur au devis client",
        paragraphs: [
          "Partir des lignes du négoce pour bâtir le devis client réduit les écarts. Une extraction fiable des PDF fournisseur évite la ressaisie et les fautes de frappe sur les quantités.",
          "La démo Tarinéo « devis fournisseur → devis client » illustre cette logique ; la facture client peut ensuite reprendre les mêmes libellés.",
        ],
      },
      {
        heading: "B2B chantier : syndic, entreprise générale, sous-traitance",
        paragraphs: [
          "C’est souvent sur ces clients que l’e-facture arrive en premier. Anticipez les champs obligatoires (SIREN, adresse, TVA, numéro de bon de commande) dès le devis.",
          "Demandez tôt le mode de réception préféré du donneur d’ordre (PDP, mail structuré, portail).",
        ],
      },
      {
        heading: "Archivage et preuve",
        paragraphs: [
          "Même avec l’électronique, gardez une copie lisible (PDF) pour le chef de chantier et pour vous. L’obligation d’archivage et les durées légales restent à respecter ; votre PDP ou comptable vous indique la politique de conservation.",
        ],
      },
    ],
  }),
  post({
    slug: "plombier-facturation-electronique-chantier",
    title: "Plombier et facturation électronique : SDB, syndic et sous-traitance",
    metaDescription:
      "Plombiers en B2B : préparer factures électroniques vers syndics et entreprises, tout en gérant devis négoce et chantiers rénovation.",
    metier: "Plombier",
    metierSlug: "plombier",
    readingMinutes: 7,
    keywords: [
      "plombier facture électronique",
      "facturation électronique syndic",
      "devis plomberie facture",
    ],
    problems: [
      "Gros volume de factures particuliers, peu de B2B structuré : on croit que la réforme ne concerne pas le métier.",
      "Sous-traitance sur chantier neuf : la facture doit coller au devis validé par l’entreprise générale.",
      "Achats sanitaire en urgence non rattachés au dossier avant facturation client.",
    ],
    sections: [
      {
        heading: "Qui est concerné sur vos chantiers",
        paragraphs: [
          "Rénovation chez le particulier : souvent hors flux B2B strict, mais vos achats chez le négoce peuvent déjà arriver en électronique.",
          "Syndic, bailleur, promoteur : facturation électronique fréquente ; préparez SIREN et bons de commande sur le devis.",
        ],
      },
      {
        heading: "Enchaîner devis négoce et facture",
        paragraphs: [
          "Les lignes sanitaire et chauffage doivent correspondre entre devis client, facture et pièces fournisseur. Une extraction propre du devis Point.P ou Rexel limite les écarts.",
        ],
      },
      {
        heading: "Ressource complémentaire",
        paragraphs: [
          "Le guide général « facturation électronique artisan BTP 2026 » sur ce blog détaille calendrier, Factur-X et choix de plateforme.",
        ],
      },
    ],
  }),
];

export const BLOG_METIERS: { slug: BlogMetierSlug; label: string }[] = [
  { slug: "plombier", label: "Plombier" },
  { slug: "electricien", label: "Électricien" },
  { slug: "peintre", label: "Peintre" },
  { slug: "macon", label: "Maçon" },
  { slug: "carreleur", label: "Carreleur" },
  { slug: "menuisier", label: "Menuisier" },
  { slug: "couvreur", label: "Couvreur" },
  { slug: "chauffagiste", label: "Chauffagiste" },
  { slug: "serrurier", label: "Serrurier" },
  { slug: "entreprise", label: "Entreprise & chantier" },
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}

export function getBlogPostsByMetier(metierSlug: BlogMetierSlug | "all"): BlogPost[] {
  if (metierSlug === "all") return BLOG_POSTS;
  return BLOG_POSTS.filter((p) => p.metierSlug === metierSlug);
}
