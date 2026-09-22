import { z } from "zod";
import { anthropic, isAnthropicConfigured } from "@/lib/anthropic";
import { enseigneParId, BIBLIOTHEQUE_FOURNISSEURS, type EnseigneBibliotheque } from "@/lib/bibliothequeFournisseurs";
import { logoDev, trouverFournisseurConnu } from "@/lib/fournisseursConnus";
import { normaliserDistributeur } from "@/lib/normalisation";
import { prisma } from "@/lib/prisma";
import type { EnseignePersonnalisee } from "@prisma/client";

type DelegateEnseignePersonnalisee = {
  findMany: (args: object) => Promise<EnseignePersonnalisee[]>;
  findFirst: (args: object) => Promise<EnseignePersonnalisee | null>;
  create: (args: object) => Promise<EnseignePersonnalisee>;
};

function delegateEnseignesPersonnalisees(): DelegateEnseignePersonnalisee | null {
  const delegate = (prisma as unknown as { enseignePersonnalisee?: DelegateEnseignePersonnalisee })
    .enseignePersonnalisee;
  if (!delegate || typeof delegate.findMany !== "function") {
    return null;
  }
  return delegate;
}

const MODELE = "claude-sonnet-5";
const SEUIL_CONFIANCE = 0.65;

const reponseIASchema = z.object({
  nom: z.string().min(2),
  domaine: z.string().min(3),
  metiers: z.string().min(2),
  confiance: z.number().min(0).max(1),
});

const JSON_SCHEMA = {
  type: "object",
  properties: {
    nom: { type: "string" },
    domaine: { type: "string" },
    metiers: { type: "string" },
    confiance: { type: "number" },
  },
  required: ["nom", "domaine", "metiers", "confiance"],
  additionalProperties: false,
} as const;

export type ResultatRechercheFournisseur =
  | {
      succes: true;
      nom: string;
      slug: string;
      metiers: string;
      logoUrl: string | null;
      source: "catalogue" | "bibliotheque" | "personnalise" | "ia";
      dejaPresent: boolean;
    }
  | { succes: false; erreur: string };

export function slugifierEnseigne(nom: string): string {
  return nom
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

function correspondRecherche(texte: string, requete: string): boolean {
  const t = texte
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
  const q = requete
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .trim();
  if (!q || q.length < 2) return false;
  return t.includes(q) || q.includes(t);
}

function chercherBibliotheque(requete: string): EnseigneBibliotheque | null {
  return (
    BIBLIOTHEQUE_FOURNISSEURS.find(
      (e) => correspondRecherche(e.nom, requete) || correspondRecherche(e.normHint, requete),
    ) ?? null
  );
}

async function identifierAvecIA(requete: string): Promise<z.infer<typeof reponseIASchema> | null> {
  if (!isAnthropicConfigured()) return null;

  const message = await anthropic.messages.create({
    model: MODELE,
    max_tokens: 400,
    messages: [
      {
        role: "user",
        content: `Tu aides un artisan du bâtiment français à identifier un fournisseur ou une enseigne à partir d'une recherche libre.

Recherche de l'artisan : "${requete.trim()}"

Réponds en JSON strict avec :
- nom : le nom commercial officiel en France (ex. "Conforama", "Cedeo", "Leroy Merlin")
- domaine : le domaine web principal pour récupérer le logo (ex. "conforama.fr") — sans https://
- metiers : une courte ligne (ex. "Bricolage · Ameublement" ou "Plomberie · Chauffage")
- confiance : entre 0 et 1 — mets < 0.5 si tu n'es pas sûr de l'enseigne

Si la recherche est incompréhensible ou ne correspond à aucune enseigne réelle, mets confiance à 0.`,
      },
    ],
    output_config: {
      format: {
        type: "json_schema",
        schema: JSON_SCHEMA,
      },
    },
  });

  const bloc = message.content.find((b) => b.type === "text");
  if (!bloc || bloc.type !== "text") return null;

  try {
    const parse = reponseIASchema.safeParse(JSON.parse(bloc.text));
    return parse.success ? parse.data : null;
  } catch {
    return null;
  }
}

export async function rechercherEtEnregistrerFournisseur(
  userId: string,
  requete: string,
): Promise<ResultatRechercheFournisseur> {
  const q = requete.trim();
  if (q.length < 2) {
    return { succes: false, erreur: "Saisissez au moins 2 caractères." };
  }

  const bibliotheque = chercherBibliotheque(q);
  if (bibliotheque) {
    const connu = trouverFournisseurConnu(bibliotheque.nom);
    return {
      succes: true,
      nom: bibliotheque.nom,
      slug: bibliotheque.id,
      metiers: bibliotheque.metiers,
      logoUrl: connu?.logo ?? logoDev(`${bibliotheque.id}.fr`),
      source: "bibliotheque",
      dejaPresent: true,
    };
  }

  const connu = trouverFournisseurConnu(q);
  if (connu) {
    const bib = BIBLIOTHEQUE_FOURNISSEURS.find((e) => correspondRecherche(e.nom, connu.nom));
    const slug = bib?.id ?? slugifierEnseigne(connu.nom);
    return {
      succes: true,
      nom: connu.nom,
      slug,
      metiers: connu.specialite,
      logoUrl: connu.logo ?? null,
      source: "catalogue",
      dejaPresent: Boolean(bib),
    };
  }

  const norm = normaliserDistributeur(q);
  const enseignes = delegateEnseignesPersonnalisees();
  if (!enseignes) {
    return {
      succes: false,
      erreur: "Fonction indisponible — relancez le serveur après `npx prisma generate`.",
    };
  }

  const existante = await enseignes.findFirst({
    where: {
      userId,
      OR: [
        { distributorNorm: norm },
        { nom: { equals: q, mode: "insensitive" } },
        { slug: slugifierEnseigne(q) },
      ],
    },
  });
  if (existante) {
    return {
      succes: true,
      nom: existante.nom,
      slug: existante.slug,
      metiers: existante.metiers ?? "Fournisseur",
      logoUrl: existante.domaineLogo ? logoDev(existante.domaineLogo) : null,
      source: "personnalise",
      dejaPresent: true,
    };
  }

  const ia = await identifierAvecIA(q);
  if (!ia || ia.confiance < SEUIL_CONFIANCE) {
    return {
      succes: false,
      erreur: isAnthropicConfigured()
        ? "Enseigne non reconnue. Essayez le nom complet (ex. « Conforama », « Gedimat »)."
        : "La recherche IA n'est pas disponible pour le moment.",
    };
  }

  const domaine = ia.domaine.replace(/^https?:\/\//, "").replace(/\/.*$/, "").toLowerCase();
  const distributorNorm = normaliserDistributeur(ia.nom);
  let slug = slugifierEnseigne(ia.nom);
  if (enseigneParId(slug)) {
    slug = `${slug}-perso`;
  }

  const collision = await enseignes.findFirst({
    where: { userId, slug },
  });
  if (collision) {
    return {
      succes: true,
      nom: collision.nom,
      slug: collision.slug,
      metiers: collision.metiers ?? ia.metiers,
      logoUrl: collision.domaineLogo ? logoDev(collision.domaineLogo) : logoDev(domaine),
      source: "personnalise",
      dejaPresent: true,
    };
  }

  const enregistree = await enseignes.create({
    data: {
      userId,
      slug,
      nom: ia.nom,
      distributorNorm,
      metiers: ia.metiers,
      domaineLogo: domaine,
    },
  });

  return {
    succes: true,
    nom: enregistree.nom,
    slug: enregistree.slug,
    metiers: enregistree.metiers ?? ia.metiers,
    logoUrl: logoDev(domaine),
    source: "ia",
    dejaPresent: false,
  };
}

export async function listerEnseignesPersonnalisees(userId: string) {
  const enseignes = delegateEnseignesPersonnalisees();
  if (!enseignes) return [];
  return enseignes.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function enseignePersonnaliseeParSlug(userId: string, slug: string) {
  const enseignes = delegateEnseignesPersonnalisees();
  if (!enseignes) return null;
  return enseignes.findFirst({
    where: { userId, slug },
  });
}
