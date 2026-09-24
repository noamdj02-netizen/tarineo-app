// Généré par scripts/build-design-data.mjs depuis « Studio Noam.html ».
// Ne pas modifier à la main : relancer `npm run design-data`.

export type FrameState = "ok" | "warn" | "bad" | "unk";
export type SiteAudit = {
  n: string;
  u: string;
  /** état de chacune des 12 frames */
  s: FrameState[];
  alert: string | null;
  /** corrections prioritaires */
  fx: string[];
};

/** Audit de tes sites face aux 12 frames. */
export const SITES: SiteAudit[] = [
  {
    "n": "Tarineo",
    "u": "https://www.tarineo.com",
    "s": [
      "ok",
      "ok",
      "bad",
      "warn",
      "ok",
      "ok",
      "ok",
      "bad",
      "bad",
      "ok",
      "ok",
      "ok"
    ],
    "alert": "Le site affiche « 120K+ utilisateurs », « 4,9 » et « 89+ marchés ». Ces chiffres semblent venir du template. À retirer tout de suite : un artisan qui s’en rend compte ne te fera plus confiance, et c’est une pratique commerciale trompeuse.",
    "fx": [
      "Remplacer les faux chiffres par du vrai : « 30+ distributeurs reconnus », « analyse en 10 s », nombre réel de devis analysés.",
      "Garder le titre-question (il est bon) et ajouter un sous-titre chiffré : « Tarineo surligne chaque hausse en 10 secondes. »",
      "Mettre en hero un vrai devis Point P annoté (ligne +12 % en rouge) au lieu d’un dashboard générique.",
      "Collecter 3 témoignages en bêta (prénom, métier, ville, € récupérés) avant d’acheter de la pub."
    ]
  },
  {
    "n": "Devis Instant",
    "u": "https://devisinstant.eu",
    "s": [
      "ok",
      "ok",
      "warn",
      "ok",
      "unk",
      "ok",
      "warn",
      "warn",
      "warn",
      "warn",
      "warn",
      "ok"
    ],
    "alert": null,
    "fx": [
      "Rendre le choix évident entre 12 € à vie et 9 €/mois : un tableau « Ce que vous avez en plus avec Pro » (relances auto, export CSV).",
      "Intégrer une vidéo de 30 s en boucle dans le hero : « devis créé en 2 min » filmé en vrai.",
      "Passer de 1 à 4 témoignages, un par métier (plombier, électricien, graphiste, dev).",
      "Vérifier que « 4,8/5 » et « des centaines de devis » sont sourcés, sinon les remplacer par un compteur réel."
    ]
  },
  {
    "n": "InkFlow",
    "u": "https://ink-flow.me",
    "s": [
      "unk",
      "warn",
      "bad",
      "unk",
      "unk",
      "ok",
      "unk",
      "bad",
      "bad",
      "bad",
      "unk",
      "warn"
    ],
    "alert": "Sans JavaScript, la page publique n’affiche presque rien (« Accéder au site »). Google et les aperçus de lien (WhatsApp, Insta) voient une page vide. Il faut un pré-rendu de la landing (SSR ou page statique).",
    "fx": [
      "Pré-rendre la landing en HTML statique (Next.js SSG, Astro ou pré-rendu Vite) pour le SEO et les partages.",
      "Titre orienté résultat : « Moins de no-shows, plus de temps pour tatouer » au lieu de « Logiciel de gestion ».",
      "Afficher les prix. L’essai 1 mois sans CB est un bon argument : mets-le sous le bouton.",
      "Appliquer ta référence ticket dark (Bebas Neue, grille de points, accent rouge) : thème « Encre »."
    ]
  }
];

/** [fond, couleur, icône lucide, libellé] par état. */
export const STATES: Record<FrameState, [string, string, string, string]> = {
  "ok": [
    "var(--oks)",
    "var(--ok)",
    "check",
    "Présent"
  ],
  "warn": [
    "var(--warns)",
    "var(--warn)",
    "minus",
    "À améliorer"
  ],
  "bad": [
    "var(--bads)",
    "var(--bad)",
    "x",
    "Manquant"
  ],
  "unk": [
    "var(--panel2)",
    "var(--ink2)",
    "help-circle",
    "Pas visible"
  ]
};
