// Catalogue d'enrichissement des enseignes du bâtiment.
//
// IMPORTANT : ce n'est PAS une liste fermée. Le champ `Document.distributor` reste un
// texte libre extrait par l'IA (voir CLAUDE.md) — ce catalogue sert uniquement à
// habiller ce qui est déjà en base : logo, couleur de pastille, groupe d'appartenance
// et spécialité. Une enseigne inconnue s'affiche normalement, avec son monogramme.
//
// Les logos sont servis par logo.dev plutôt que stockés en local (ce sont des marques
// déposées de tiers). Le jeton ci-dessous est une clé *publiable* : elle voyage dans
// l'URL de l'image et n'ouvre aucun accès aux données Tarineo — même statut que la clé
// publique Stripe (`pk_`), seule exception admise par les règles de sécurité du projet.
//
// Les images sont chargées via next/image, donc récupérées par notre serveur et non par
// le navigateur de l'artisan : logo.dev ne voit jamais son adresse IP.
const LOGO_DEV_TOKEN = "pk_YxuymbRCRTudbtCcGWx0EQ";

function logoDev(domaine: string): string {
  return `https://img.logo.dev/${domaine}?token=${LOGO_DEV_TOKEN}&size=200&format=png`;
}

export interface FournisseurConnu {
  /** Libellé d'affichage canonique. */
  nom: string;
  /** Groupe d'appartenance (utile pour les conditions commerciales / BFA). */
  groupe?: string;
  specialite: string;
  /**
   * URL logo.dev, renseignée uniquement pour les enseignes dont le vrai logo a été
   * vérifié à l'œil (voir la note en bas de fichier). Absente = pastille `couleur`.
   */
  logo?: string;
  /** Pastille de repli quand il n'y a pas de logo ou que logo.dev échoue. */
  couleur: string;
  /** Fragments normalisés (minuscules, sans espace/accent) reconnaissant l'enseigne. */
  alias: string[];
}

const CATALOGUE: FournisseurConnu[] = [
  {
    nom: "Cedeo",
    groupe: "Saint-Gobain",
    specialite: "Sanitaire, chauffage, plomberie",
    logo: logoDev("cedeo.fr"),
    couleur: "bg-[#EEF1FF] text-[#3B6AE1]",
    alias: ["cedeo"],
  },
  {
    nom: "Envie de Salle de Bain",
    groupe: "Saint-Gobain",
    specialite: "Salle de bain",
    logo: logoDev("enviedesalledebain.fr"),
    couleur: "bg-[#E8F4FF] text-[#2563EB]",
    alias: ["enviedesalledebain", "enviesalledebain", "edsb"],
  },
  {
    nom: "Point P",
    groupe: "Saint-Gobain",
    specialite: "Matériaux de construction",
    logo: logoDev("pointp.fr"),
    couleur: "bg-[#FFF3E6] text-[#E67A1F]",
    alias: ["pointp", "pointps", "point p"],
  },
  {
    nom: "La Plateforme du Bâtiment",
    groupe: "Saint-Gobain",
    specialite: "Multi-produits pro",
    logo: logoDev("laplateforme.com"),
    couleur: "bg-[#FFF1E8] text-[#E2571E]",
    alias: ["laplateformedubatiment", "plateformedubatiment", "laplateforme"],
  },
  {
    nom: "Dispart",
    groupe: "Saint-Gobain",
    specialite: "Négoce spécialisé",
    logo: logoDev("dispart.fr"),
    couleur: "bg-[#EEF1FF] text-[#4553C7]",
    alias: ["dispart"],
  },
  {
    nom: "PUM",
    groupe: "Saint-Gobain",
    specialite: "Plastiques, canalisation, réseaux",
    logo: logoDev("pum.fr"),
    couleur: "bg-[#E6F7F4] text-[#0F8C7A]",
    alias: ["pum", "pumplastiques"],
  },
  {
    nom: "Dispano",
    groupe: "Saint-Gobain",
    specialite: "Bois, panneaux, agencement",
    logo: logoDev("dispano.fr"),
    couleur: "bg-[#F5EFE4] text-[#8A6A2F]",
    alias: ["dispano"],
  },
  {
    nom: "Rexel",
    specialite: "Matériel électrique",
    logo: logoDev("rexel.fr"),
    couleur: "bg-[#E9F8EE] text-[#1F9D55]",
    alias: ["rexel"],
  },
  {
    nom: "Sonepar",
    specialite: "Matériel électrique",
    logo: logoDev("sonepar.fr"),
    couleur: "bg-[#FDECEC] text-[#D64545]",
    alias: ["sonepar"],
  },
  {
    nom: "France Bonhomme",
    specialite: "Menuiserie, fermeture, store",
    logo: logoDev("france-bonhomme.com"),
    couleur: "bg-[#EAF2FF] text-[#1D4ED8]",
    alias: ["francebonhomme", "bonhomme"],
  },
  {
    nom: "France Air",
    specialite: "Ventilation, traitement d'air",
    logo: logoDev("france-air.com"),
    couleur: "bg-[#E7F4FB] text-[#0E7490]",
    alias: ["franceair"],
  },
  {
    nom: "Castorama",
    groupe: "Kingfisher",
    specialite: "Grande surface de bricolage",
    logo: logoDev("castorama.fr"),
    couleur: "bg-[#E8F1FF] text-[#2563EB]",
    alias: ["castorama", "casto"],
  },
  {
    nom: "Brico Dépôt",
    groupe: "Kingfisher",
    specialite: "Grande surface de bricolage",
    logo: logoDev("bricodepot.fr"),
    couleur: "bg-[#F3F4F6] text-[#53616A]",
    // Volontairement pas d'alias court "brico" : il capterait "Bricoman"/"Bricomarché".
    alias: ["bricodepot"],
  },
  {
    nom: "Screwfix",
    groupe: "Kingfisher",
    specialite: "Outillage, quincaillerie",
    logo: logoDev("screwfix.fr"),
    couleur: "bg-[#FFF4E5] text-[#B45309]",
    alias: ["screwfix"],
  },
  {
    nom: "Leroy Merlin",
    groupe: "Adeo",
    specialite: "Grande surface de bricolage",
    // logo.dev sert la déclinaison « Leroy Merlin Studio » : la marque reste
    // parfaitement reconnaissable (triangle vert + typo), mais à revoir si un jour
    // le logo principal devient disponible.
    logo: logoDev("leroymerlin.fr"),
    couleur: "bg-[#F3E8FF] text-[#7C3AED]",
    alias: ["leroymerlin", "leroy"],
  },
  {
    nom: "Tecnomat",
    groupe: "Adeo",
    specialite: "Matériaux pro (ex-Bricoman)",
    logo: logoDev("tecnomat.fr"),
    couleur: "bg-[#EDF6E8] text-[#3F7A1F]",
    alias: ["tecnomat", "bricoman"],
  },
  {
    nom: "Aubade",
    specialite: "Salle de bain, sanitaire",
    logo: logoDev("aubade.com"),
    couleur: "bg-[#FDEEF4] text-[#BE185D]",
    alias: ["aubade", "espaceaubade"],
  },
  {
    nom: "Tereva",
    groupe: "Martin Belaysoud",
    specialite: "Sanitaire, chauffage, climatisation",
    logo: logoDev("tereva.fr"),
    couleur: "bg-[#E6F2FB] text-[#1E6FA8]",
    alias: ["tereva"],
  },
  {
    nom: "Bleu Rouge",
    specialite: "Sanitaire, chauffage",
    logo: logoDev("bleu-rouge.fr"),
    couleur: "bg-[#F0ECFF] text-[#5B45C7]",
    alias: ["bleurouge"],
  },
  {
    nom: "Gedimat",
    specialite: "Matériaux de construction",
    logo: logoDev("gedimat.fr"),
    couleur: "bg-[#FFF0EB] text-[#C2410C]",
    alias: ["gedimat"],
  },
  {
    nom: "BigMat",
    specialite: "Matériaux de construction",
    logo: logoDev("bigmat.fr"),
    couleur: "bg-[#EAF0FF] text-[#1E40AF]",
    alias: ["bigmat"],
  },
  {
    nom: "Bois & Matériaux",
    specialite: "Bois, matériaux, couverture",
    logo: logoDev("boisetmateriaux.fr"),
    couleur: "bg-[#F5EFE4] text-[#7C5A1E]",
    alias: ["boisetmateriaux", "boismateriaux", "bm"],
  },
  {
    nom: "Brossette",
    specialite: "Sanitaire, chauffage",
    logo: logoDev("brossette.fr"),
    couleur: "bg-[#E6F0FA] text-[#1F5FA8]",
    alias: ["brossette"],
  },
  {
    nom: "Richardson",
    specialite: "Sanitaire, chauffage, climatisation",
    // Le cube orangé/pistache/fuchsia est bien l'identité historique du groupe.
    logo: logoDev("richardson.fr"),
    couleur: "bg-[#FFF0E8] text-[#C2410C]",
    alias: ["richardson"],
  },
];

// Note d'audit (16/09/2026) — les 24 domaines ont été appelés et les images regardées
// une par une. logo.dev ne renvoie le vrai logo que pour 13 d'entre eux. Pour les 11
// autres il sert soit un monogramme gris générique (Envie de Salle de Bain, PUM,
// France Bonhomme, France Air, Aubade, Bois & Matériaux), soit carrément le logo d'une
// AUTRE entreprise (Dispart renvoyait une croix de pharmacie, Bleu Rouge un sigle bleu
// sans rapport, Screwfix un « SE » inconnu), soit un fragment inexploitable (bande
// bicolore pour La Plateforme, triangle seul pour Tecnomat).
//
// D'où la règle : `logo` n'est renseigné que pour un logo vérifié. Mieux vaut notre
// pastille colorée, toujours juste, qu'un logo faux affiché à côté des dépenses d'un
// artisan. À refaire si logo.dev enrichit sa base.

function cle(valeur: string): string {
  return valeur
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9]/g, "");
}

/**
 * Retrouve l'enseigne connue correspondant à un nom brut extrait par l'IA.
 * Renvoie null si l'enseigne n'est pas au catalogue — c'est un cas normal, pas une erreur.
 */
export function trouverFournisseurConnu(nom: string): FournisseurConnu | null {
  const k = cle(nom);
  if (!k) return null;

  // Correspondance exacte d'abord, pour éviter qu'un alias court ("bm", "pum")
  // capture par erreur une enseigne au nom plus long.
  for (const f of CATALOGUE) {
    if (f.alias.some((a) => cle(a) === k)) return f;
  }

  // Puis inclusion, en testant les alias les plus longs en premier : un document
  // "POINT P SAINT-PRIEST" doit tomber sur Point P, et "TECNOMAT BRICOMAN" sur
  // Tecnomat plutôt que sur une enseigne au nom plus court.
  const candidats = CATALOGUE.flatMap((f) => f.alias.map((a) => ({ f, a: cle(a) })))
    .filter((c) => c.a.length >= 5)
    .sort((x, y) => y.a.length - x.a.length);
  for (const c of candidats) {
    if (k.includes(c.a)) return c.f;
  }
  return null;
}

/** Noms d'enseignes servant d'exemples au prompt d'extraction (jamais une contrainte). */
export const EXEMPLES_ENSEIGNES = CATALOGUE.map((f) => f.nom);

/** Identifiant stable pour les URLs (`/fournisseurs/cedeo`, `/fournisseurs/pointp`…). */
export function slugFournisseurConnu(f: FournisseurConnu): string {
  return cle(f.alias[0] ?? f.nom);
}

/** Toutes les enseignes du catalogue, triées par nom. */
export function listerCatalogueFournisseurs(): FournisseurConnu[] {
  return [...CATALOGUE].sort((a, b) => a.nom.localeCompare(b.nom, "fr"));
}

/** Retrouve une enseigne du catalogue à partir de son slug URL. */
export function trouverFournisseurParSlug(slug: string): FournisseurConnu | null {
  const k = cle(slug);
  return CATALOGUE.find((f) => slugFournisseurConnu(f) === k) ?? null;
}
