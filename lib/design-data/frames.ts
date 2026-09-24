// Généré par scripts/build-design-data.mjs depuis « Studio Noam.html ».
// Ne pas modifier à la main : relancer `npm run design-data`.

export type Zone = "A" | "I" | "D" | "X";
export type Frame = {
  z: Zone;
  ic: string;
  n: string;
  /** maquette fil de fer (HTML) */
  w: string;
  pins: string[];
  role: string;
  rule: string;
  err: string;
  ex: string;
};

/** Les 12 frames d'une landing qui convertit. */
export const FRAMES: Frame[] = [
  {
    "z": "A",
    "ic": "panel-top",
    "n": "Navbar",
    "w": "<div class=\"row\"><div class=\"b t hot\" style=\"width:46px\"></div><div style=\"flex:1\"></div><div class=\"b\" style=\"width:28px\"></div><div class=\"b\" style=\"width:28px\"></div><div class=\"b\" style=\"width:28px\"></div><div class=\"btn-w hot\" style=\"width:54px\"></div></div><span class=\"pin\" style=\"left:4px;top:30px\">1</span><span class=\"pin\" style=\"left:calc(100% - 26px);top:30px\">2</span>",
    "pins": [
      "Logo à gauche, cliquable vers le haut de page",
      "Bouton CTA à droite, même texte que le hero"
    ],
    "role": "Orienter et garder le bouton d’action toujours visible.",
    "rule": "4 liens max + 1 bouton. Barre collante (sticky) en haut.",
    "err": "8 liens dans le menu : le visiteur part explorer au lieu de s’inscrire.",
    "ex": "Fonctionnement · Tarifs · FAQ · [Vérifier un devis]"
  },
  {
    "z": "A",
    "ic": "sparkles",
    "n": "Hero",
    "w": "<div class=\"row\" style=\"align-items:stretch\"><div class=\"col\" style=\"flex:1.2\"><div class=\"b hot\" style=\"width:60%;height:10px;border-radius:99px\"></div><div class=\"b xl hot\"></div><div class=\"b xl\" style=\"width:70%\"></div><div class=\"b hot\" style=\"width:90%\"></div><div class=\"row\"><div class=\"btn-w hot\" style=\"width:60px\"></div><div class=\"btn-o\" style=\"width:46px\"></div></div><div class=\"row hot\"><div class=\"b\" style=\"width:30px;height:12px;border-radius:99px\"></div><div class=\"b\" style=\"width:50px\"></div></div></div><div class=\"img hot\" style=\"flex:1;min-height:110px\"></div></div><span class=\"pin\" style=\"left:4px;top:4px\">1</span><span class=\"pin\" style=\"left:4px;top:24px\">2</span><span class=\"pin\" style=\"left:4px;top:62px\">3</span><span class=\"pin\" style=\"left:4px;top:84px\">4</span><span class=\"pin\" style=\"left:4px;top:108px\">5</span><span class=\"pin\" style=\"left:calc(100% - 26px);top:8px\">6</span>",
    "pins": [
      "Badge annonce : une nouveauté ou une offre (« 1 mois offert »)",
      "Titre = le résultat promis, 10 mots max",
      "Sous-titre = comment ça marche + pour qui",
      "CTA principal (verbe + « mon ») et CTA secondaire « Voir la démo »",
      "Micro-preuve sous le bouton : « sans carte bancaire », avatars, note",
      "Visuel du vrai produit, pas une illustration"
    ],
    "role": "En 5 secondes, le visiteur sait : c’est quoi, pour qui, et ce qu’il y gagne.",
    "rule": "Parle du résultat, pas de la techno. Le visiteur doit se reconnaître.",
    "err": "« Plateforme IA innovante pour optimiser vos achats » : vague, personne ne se reconnaît.",
    "ex": "« Arrêtez de payer vos fournitures trop cher. » + [Vérifier mon premier devis →]"
  },
  {
    "z": "A",
    "ic": "badge-check",
    "n": "Bande de preuve",
    "w": "<div class=\"b\" style=\"width:40%;margin:0 auto\"></div><div class=\"row hot\" style=\"justify-content:space-between;padding:6px 4px\"><div class=\"b t\" style=\"width:14%\"></div><div class=\"b t\" style=\"width:14%\"></div><div class=\"b t\" style=\"width:14%\"></div><div class=\"b t\" style=\"width:14%\"></div><div class=\"b t\" style=\"width:14%\"></div></div>",
    "pins": [],
    "role": "Rassurer tout de suite après le hero.",
    "rule": "Uniquement du vrai : distributeurs compatibles, nombre réel de devis analysés, note vérifiable.",
    "err": "Des chiffres restés du template (« 120K+ utilisateurs »). Le client le sent et c’est une pratique commerciale trompeuse.",
    "ex": "« Compatible avec Cedeo, Point P, Rexel, Brossette et 26 autres »"
  },
  {
    "z": "I",
    "ic": "git-compare",
    "n": "Problème : avant / après",
    "w": "<div class=\"row\" style=\"align-items:stretch\"><div class=\"card hot\"><div class=\"b t\" style=\"width:40%;background:var(--bad)\"></div><div class=\"b\"></div><div class=\"b\" style=\"width:70%\"></div></div><div class=\"card\"><div class=\"b t\" style=\"width:40%;background:var(--ok)\"></div><div class=\"b\"></div><div class=\"b\" style=\"width:60%\"></div></div></div>",
    "pins": [],
    "role": "Montrer la douleur avec les mots du client.",
    "rule": "Une situation concrète et chiffrée, pas une généralité.",
    "err": "Parler de toi et de ta techno au lieu de sa galère.",
    "ex": "Avant : 2 h le soir à comparer des PDF. Après : 10 secondes, l’écart surligné en rouge."
  },
  {
    "z": "I",
    "ic": "list-ordered",
    "n": "Comment ça marche",
    "w": "<div class=\"b t\" style=\"width:45%;margin:0 auto\"></div><div class=\"row\" style=\"align-items:stretch\"><div class=\"card hot\"><div class=\"b\" style=\"width:16px;height:16px;border-radius:5px;background:var(--hot)\"></div><div class=\"b\"></div></div><div class=\"card\"><div class=\"b\" style=\"width:16px;height:16px;border-radius:5px\"></div><div class=\"b\"></div></div><div class=\"card\"><div class=\"b\" style=\"width:16px;height:16px;border-radius:5px\"></div><div class=\"b\"></div></div></div>",
    "pins": [],
    "role": "Prouver que c’est simple et rapide.",
    "rule": "3 étapes, chacune = un verbe + un résultat.",
    "err": "7 étapes ou du jargon (« OCR », « parsing »).",
    "ex": "1. Photographie ton devis → 2. Tarineo compare → 3. Tu négocies avec la preuve."
  },
  {
    "z": "I",
    "ic": "layout-grid",
    "n": "Fonctionnalités (bento)",
    "w": "<div style=\"display:grid;grid-template-columns:repeat(4,1fr);grid-auto-rows:34px;gap:6px\"><div class=\"card hot\" style=\"grid-column:span 2;grid-row:span 2\"></div><div class=\"card\"></div><div class=\"card\"></div><div class=\"card\" style=\"grid-column:span 2\"></div><div class=\"card\" style=\"grid-column:span 2\"></div><div class=\"card\"></div><div class=\"card\"></div></div>",
    "pins": [],
    "role": "Montrer ce qu’il gagne, en un coup d’œil.",
    "rule": "1 grande case = la fonction star. Titre de case = bénéfice, pas nom technique.",
    "err": "Une liste de 15 fonctions à puces que personne ne lit.",
    "ex": "Grande case : « Alerte dès qu’un prix monte ». Petites : historique 12 mois, multi-chantiers, export."
  },
  {
    "z": "D",
    "ic": "monitor-play",
    "n": "Démo produit",
    "w": "<div class=\"img hot\" style=\"height:110px;display:grid;place-items:center\"><div style=\"width:30px;height:30px;border-radius:50%;background:var(--hot)\"></div></div>",
    "pins": [],
    "role": "Le visiteur se voit déjà utiliser l’outil.",
    "rule": "Vraie capture ou vidéo de 30 s, sans son, sous-titrée, en boucle.",
    "err": "Un mockup 3D abstrait ou une illustration générique.",
    "ex": "Vidéo : scan d’un devis Point P → la ligne « Tube PER +12 % » s’allume en rouge."
  },
  {
    "z": "D",
    "ic": "quote",
    "n": "Témoignages",
    "w": "<div class=\"row\" style=\"align-items:stretch\"><div class=\"card hot\"><div class=\"b\"></div><div class=\"b\" style=\"width:80%\"></div><div class=\"row\"><div class=\"b\" style=\"width:16px;height:16px;border-radius:50%\"></div><div class=\"b\" style=\"width:50%\"></div></div></div><div class=\"card\"><div class=\"b\"></div><div class=\"b\" style=\"width:70%\"></div><div class=\"row\"><div class=\"b\" style=\"width:16px;height:16px;border-radius:50%\"></div><div class=\"b\" style=\"width:50%\"></div></div></div></div>",
    "pins": [],
    "role": "Créer la confiance grâce à des gens comme lui.",
    "rule": "Vrai prénom, métier, ville, photo et un résultat chiffré.",
    "err": "Inventer des témoignages. C’est interdit et ça se voit.",
    "ex": "« [Prénom], plombier à Rouen : 340 € récupérés le premier mois. » (à collecter en bêta)"
  },
  {
    "z": "D",
    "ic": "trending-up",
    "n": "Résultats chiffrés",
    "w": "<div class=\"row\" style=\"align-items:stretch\"><div class=\"card hot\"><div class=\"b xl\" style=\"width:60%;background:var(--hot)\"></div><div class=\"b\" style=\"width:80%\"></div></div><div class=\"card\"><div class=\"b xl\" style=\"width:60%\"></div><div class=\"b\" style=\"width:80%\"></div></div><div class=\"card\"><div class=\"b xl\" style=\"width:60%\"></div><div class=\"b\" style=\"width:80%\"></div></div></div>",
    "pins": [],
    "role": "Une preuve rapide à lire.",
    "rule": "Des chiffres réels, même petits. « 127 devis analysés » vaut mieux qu’un gros chiffre faux.",
    "err": "« 89+ marchés », « 4,9 » sans source.",
    "ex": "10 s par analyse · 30+ distributeurs · X € d’écarts détectés"
  },
  {
    "z": "X",
    "ic": "credit-card",
    "n": "Tarifs",
    "w": "<div class=\"row\" style=\"align-items:flex-end\"><div class=\"card\"><div class=\"b t\" style=\"width:50%\"></div><div class=\"b\"></div><div class=\"btn-o\" style=\"width:100%\"></div></div><div class=\"card hot\" style=\"padding-block:14px\"><div class=\"b t\" style=\"width:50%;background:var(--hot)\"></div><div class=\"b\"></div><div class=\"btn-w\" style=\"width:100%\"></div></div><div class=\"card\"><div class=\"b t\" style=\"width:50%\"></div><div class=\"b\"></div><div class=\"btn-o\" style=\"width:100%\"></div></div></div>",
    "pins": [],
    "role": "Rendre la décision facile.",
    "rule": "3 offres, celle du milieu mise en avant. Essai sans carte bancaire.",
    "err": "Prix cachés ou « Contactez-nous » pour une petite offre.",
    "ex": "Starter 17 € · Pro 29 € (le plus choisi) · Équipe 49 €"
  },
  {
    "z": "X",
    "ic": "circle-help",
    "n": "FAQ",
    "w": "<div class=\"col hot\" style=\"padding:4px\"><div class=\"row\"><div class=\"b\" style=\"flex:1\"></div><div class=\"b\" style=\"width:10px;height:10px\"></div></div><div class=\"row\"><div class=\"b\" style=\"flex:1\"></div><div class=\"b\" style=\"width:10px;height:10px\"></div></div><div class=\"row\"><div class=\"b\" style=\"flex:1\"></div><div class=\"b\" style=\"width:10px;height:10px\"></div></div><div class=\"row\"><div class=\"b\" style=\"flex:1\"></div><div class=\"b\" style=\"width:10px;height:10px\"></div></div></div>",
    "pins": [],
    "role": "Répondre aux peurs qui bloquent le clic.",
    "rule": "5 à 7 vraies objections : prix, données, résiliation, compatibilité, temps.",
    "err": "FAQ vide ou avec des questions que personne ne pose.",
    "ex": "« Mes devis restent-ils privés ? » · « Je peux arrêter quand je veux ? »"
  },
  {
    "z": "X",
    "ic": "rocket",
    "n": "CTA final + footer",
    "w": "<div class=\"col hot\" style=\"background:var(--hot);border-radius:8px;padding:12px;align-items:center;opacity:.9\"><div class=\"b xl\" style=\"width:70%;background:#fff;opacity:.8\"></div><div style=\"height:18px;width:70px;border-radius:6px;background:#fff\"></div></div><div class=\"row\" style=\"justify-content:space-between;padding-top:4px\"><div class=\"b\" style=\"width:20%\"></div><div class=\"b\" style=\"width:15%\"></div><div class=\"b\" style=\"width:15%\"></div><div class=\"b\" style=\"width:15%\"></div></div>",
    "pins": [],
    "role": "Dernière chance de convertir ceux qui ont tout lu.",
    "rule": "Répète la promesse et le même CTA. Ajoute une garantie.",
    "err": "Terminer sur le footer sans bouton.",
    "ex": "« Votre premier devis vérifié en 10 secondes. » [Vérifier mon devis →] · 1 mois offert"
  }
];

/** Les 4 zones du tunnel (couleurs = variables CSS de l'app d'origine). */
export const ZONES: Record<Zone, { c: string; s: string; n: string }> = {
  "A": {
    "c": "var(--zA)",
    "s": "var(--zAs)",
    "n": "Attention"
  },
  "I": {
    "c": "var(--zI)",
    "s": "var(--zIs)",
    "n": "Intérêt"
  },
  "D": {
    "c": "var(--zD)",
    "s": "var(--zDs)",
    "n": "Désir"
  },
  "X": {
    "c": "var(--zX)",
    "s": "var(--zXs)",
    "n": "Action"
  }
};

/** Checklist avant mise en ligne. */
export const CHECKLIST: string[] = [
  "Le titre dit le résultat en 10 mots max",
  "Un seul CTA principal, même texte partout",
  "« Sans carte bancaire » ou garantie sous le bouton",
  "Visuel ou vidéo du vrai produit dans le hero",
  "Aucun chiffre ni avis inventé",
  "3 étapes « comment ça marche »",
  "Au moins 2 vrais témoignages avec prénom et métier",
  "Prix visibles, offre du milieu mise en avant",
  "FAQ avec 5 vraies objections",
  "Page lisible sans JavaScript (SEO et aperçus de liens)",
  "Chargement rapide sur mobile en 4G",
  "Tracking conversion en place (GTM / Ads)"
];
