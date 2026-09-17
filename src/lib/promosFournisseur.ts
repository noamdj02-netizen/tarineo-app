import { z } from "zod";
import { anthropic, isAnthropicConfigured } from "@/lib/anthropic";
import { prisma } from "@/lib/prisma";
import { normaliserDistributeur } from "@/lib/normalisation";
import { enseigneParId } from "@/lib/bibliothequeFournisseurs";

const USER_AGENT = "TarineoBot/1.0 (+https://tarineo.fr/bot)";
const INTERVALLE_MIN_FETCH_MS = 24 * 60 * 60 * 1000;
const SEUIL_CONFIANCE = 0.65;
const MODELE = "claude-sonnet-5";

export interface FluxPublicFournisseur {
  bibliothequeId: string;
  nom: string;
  distributorNorm: string;
  url: string;
  /** Trace S4 : CGU relues avant activation (SPEC-AGENT-FOURNISSEUR.md). */
  cguValidees: boolean;
}

/** Pages publiques « promotions / offres » — 1 fetch/jour max par enseigne. */
export const FLUX_PUBLICS_FOURNISSEURS: FluxPublicFournisseur[] = [
  {
    bibliothequeId: "cedeo",
    nom: "Cedeo",
    distributorNorm: "CEDEO",
    url: "https://www.cedeo.fr/",
    cguValidees: true,
  },
  {
    bibliothequeId: "point-p",
    nom: "Point P",
    distributorNorm: "POINT P",
    url: "https://www.pointp.fr/",
    cguValidees: true,
  },
  {
    bibliothequeId: "rexel",
    nom: "Rexel",
    distributorNorm: "REXEL",
    url: "https://www.rexel.fr/frx",
    cguValidees: true,
  },
  {
    bibliothequeId: "brossette",
    nom: "Brossette",
    distributorNorm: "BROSSETTE",
    url: "https://www.brossette.fr/",
    cguValidees: true,
  },
  {
    bibliothequeId: "richardson",
    nom: "Richardson",
    distributorNorm: "RICHARDSON",
    url: "https://www.richardson.fr/",
    cguValidees: true,
  },
  {
    bibliothequeId: "sonepar",
    nom: "Sonepar",
    distributorNorm: "SONEPAR",
    url: "https://www.sonepar.fr/",
    cguValidees: true,
  },
];

const promoExtraiteSchema = z.object({
  titre: z.string().min(3),
  description: z.string().min(5),
  remise_pct: z.number().nullable(),
  valable_jusqua: z.string().nullable(),
  confiance: z.number().min(0).max(1),
});

const reponsePromosSchema = z.object({
  promos: z.array(promoExtraiteSchema),
});

export type PromoPersonnalisee = {
  id: string;
  titre: string;
  description: string;
  remisePct: number | null;
  valableJusquA: Date | null;
  sourceUrl: string;
  confiance: number;
  fetchedAt: Date;
  pertinentePourVous: boolean;
  raisonPertinence: string | null;
};

function fluxParBibliothequeId(id: string): FluxPublicFournisseur | undefined {
  return FLUX_PUBLICS_FOURNISSEURS.find((f) => f.bibliothequeId === id && f.cguValidees);
}

export function resolveBibliothequeId(idPage: string, norm: string): string | null {
  const parId = enseigneParId(idPage);
  if (parId) return parId.id;
  const normCle = normaliserDistributeur(norm);
  const flux = FLUX_PUBLICS_FOURNISSEURS.find(
    (f) => f.distributorNorm === normCle || normCle.includes(f.distributorNorm) || f.distributorNorm.includes(normCle)
  );
  return flux?.bibliothequeId ?? null;
}

function htmlVersTexte(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 45_000);
}

function promosPrismaDisponible(): boolean {
  const delegate = (prisma as { promoFetchLog?: { findFirst?: unknown } }).promoFetchLog;
  return Boolean(delegate && typeof delegate.findFirst === "function");
}

async function peutRafraichir(bibliothequeId: string): Promise<{ ok: boolean; message?: string }> {
  if (!promosPrismaDisponible()) {
    return { ok: false, message: "Module promos indisponible — rechargez la page après redémarrage du serveur." };
  }
  const dernier = await prisma.promoFetchLog.findFirst({
    where: { bibliothequeId, succes: true },
    orderBy: { fetchedAt: "desc" },
  });
  if (!dernier) return { ok: true };
  const ecoule = Date.now() - dernier.fetchedAt.getTime();
  if (ecoule < INTERVALLE_MIN_FETCH_MS) {
    const heures = Math.ceil((INTERVALLE_MIN_FETCH_MS - ecoule) / (60 * 60 * 1000));
    return { ok: false, message: `Prochaine mise à jour possible dans environ ${heures} h (1 requête/jour/enseigne).` };
  }
  return { ok: true };
}

async function extrairePromosDepuisPage(flux: FluxPublicFournisseur, textePage: string) {
  const reponse = await anthropic.messages.create({
    model: MODELE,
    max_tokens: 2048,
    messages: [
      {
        role: "user",
        content: `Tu es un assistant pour artisans du bâtiment. Analyse le texte public ci-dessous (page web ${flux.nom}) et extrais UNIQUEMENT les promotions, offres commerciales ou remises actuellement annoncées.

Règles :
- Ne invente rien : si aucune promo claire n'est visible, renvoie "promos": [].
- Chaque promo : titre court, description factuelle, remise_pct si un pourcentage est explicite sinon null, valable_jusqua (ISO date YYYY-MM-DD) si une date de fin est mentionnée sinon null, confiance entre 0 et 1.
- Ignore les menus, pieds de page, mentions légales.

Réponds en JSON strict :
{"promos":[{"titre":"...","description":"...","remise_pct":null,"valable_jusqua":null,"confiance":0.8}]}

Texte de la page :
${textePage}`,
      },
    ],
  });

  const bloc = reponse.content.find((c) => c.type === "text");
  if (!bloc || bloc.type !== "text") return [];

  const jsonBrut = bloc.text.match(/\{[\s\S]*\}/)?.[0];
  if (!jsonBrut) return [];

  const parse = reponsePromosSchema.safeParse(JSON.parse(jsonBrut));
  if (!parse.success) return [];
  return parse.data.promos.filter((p) => p.confiance >= SEUIL_CONFIANCE);
}

export async function rafraichirPromosFournisseur(
  bibliothequeId: string,
  userId?: string
): Promise<{ succes: boolean; nbPromos: number; message: string }> {
  const flux = fluxParBibliothequeId(bibliothequeId);
  if (!flux) {
    return { succes: false, nbPromos: 0, message: "Cette enseigne n'a pas encore de flux public activé." };
  }

  if (!isAnthropicConfigured()) {
    return { succes: false, nbPromos: 0, message: "Service IA indisponible (clé Anthropic manquante)." };
  }

  const autorise = await peutRafraichir(bibliothequeId);
  if (!autorise.ok) {
    return { succes: false, nbPromos: 0, message: autorise.message ?? "Rafraîchissement trop fréquent." };
  }

  let textePage = "";
  try {
    const reponse = await fetch(flux.url, {
      headers: { "User-Agent": USER_AGENT, Accept: "text/html" },
      signal: AbortSignal.timeout(15_000),
      redirect: "follow",
    });
    if (!reponse.ok) {
      if (reponse.status === 403) {
        throw new Error(
          `SITE_BLOQUE: ${flux.nom} refuse la lecture automatique (protection anti-robot). Les opportunités au-dessus restent basées sur votre historique Tarinéo.`
        );
      }
      throw new Error(`HTTP ${reponse.status}`);
    }
    textePage = htmlVersTexte(await reponse.text());
  } catch (erreur) {
    const brut = erreur instanceof Error ? erreur.message : "fetch impossible";
    const message = brut.startsWith("SITE_BLOQUE: ")
      ? brut.slice("SITE_BLOQUE: ".length)
      : `Impossible de lire la page publique : ${brut}`;
    await prisma.promoFetchLog.create({
      data: { bibliothequeId, userId, succes: false, nbPromos: 0, message },
    });
    return { succes: false, nbPromos: 0, message };
  }

  let promos: z.infer<typeof promoExtraiteSchema>[] = [];
  try {
    promos = await extrairePromosDepuisPage(flux, textePage);
  } catch (erreur) {
    const message = erreur instanceof Error ? erreur.message : "extraction IA échouée";
    await prisma.promoFetchLog.create({
      data: { bibliothequeId, userId, succes: false, nbPromos: 0, message },
    });
    return { succes: false, nbPromos: 0, message };
  }

  const fetchedAt = new Date();
  await prisma.$transaction([
    prisma.promoFournisseur.updateMany({
      where: { bibliothequeId },
      data: { actif: false },
    }),
    ...promos.map((p) =>
      prisma.promoFournisseur.create({
        data: {
          bibliothequeId,
          distributorNorm: flux.distributorNorm,
          titre: p.titre.slice(0, 200),
          description: p.description.slice(0, 2000),
          remisePct: p.remise_pct,
          valableJusquA: p.valable_jusqua ? new Date(p.valable_jusqua) : null,
          sourceUrl: flux.url,
          confiance: p.confiance,
          fetchedAt,
          actif: true,
        },
      })
    ),
    prisma.promoFetchLog.create({
      data: {
        bibliothequeId,
        userId,
        succes: true,
        nbPromos: promos.length,
        message: promos.length === 0 ? "Aucune promo explicite sur la page publique." : null,
      },
    }),
  ]);

  return {
    succes: true,
    nbPromos: promos.length,
    message:
      promos.length === 0
        ? "Page consultée — aucune promotion clairement annoncée pour le moment."
        : `${promos.length} promotion${promos.length > 1 ? "s" : ""} mise${promos.length > 1 ? "s" : ""} à jour.`,
  };
}

function tokensPertinence(texte: string): string[] {
  return texte
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length >= 5);
}

export async function promosPersonnaliseesPourArtisan(
  userId: string,
  bibliothequeId: string,
  distributorNorm: string
): Promise<{ promos: PromoPersonnalisee[]; derniereMiseAJour: Date | null; fluxActif: boolean }> {
  const flux = fluxParBibliothequeId(bibliothequeId);
  if (!promosPrismaDisponible()) {
    return { promos: [], derniereMiseAJour: null, fluxActif: Boolean(flux) };
  }
  const promos = await prisma.promoFournisseur.findMany({
    where: { bibliothequeId, actif: true },
    orderBy: [{ fetchedAt: "desc" }, { confiance: "desc" }],
    take: 12,
  });

  const norm = normaliserDistributeur(distributorNorm);
  const historique = await prisma.priceHistory.findMany({
    where: {
      userId,
      OR: [
        { distributorNorm: norm },
        ...(flux ? [{ distributorNorm: flux.distributorNorm }] : []),
      ],
    },
    select: { referenceNorm: true, manufacturerRefNorm: true },
    take: 80,
  });

  const motsAchats = new Set<string>();
  for (const ligne of historique) {
    if (ligne.referenceNorm) motsAchats.add(ligne.referenceNorm.toLowerCase());
    if (ligne.manufacturerRefNorm) motsAchats.add(ligne.manufacturerRefNorm.toLowerCase());
  }

  const promosPerso: PromoPersonnalisee[] = promos.map((p) => {
    const corpus = `${p.titre} ${p.description}`.toLowerCase();
    const match = [...motsAchats].find((mot) => corpus.includes(mot));
    return {
      id: p.id,
      titre: p.titre,
      description: p.description,
      remisePct: p.remisePct != null ? Number(p.remisePct) : null,
      valableJusquA: p.valableJusquA,
      sourceUrl: p.sourceUrl,
      confiance: p.confiance,
      fetchedAt: p.fetchedAt,
      pertinentePourVous: Boolean(match),
      raisonPertinence: match ? `Recoupe une référence de votre historique (${match})` : null,
    };
  });

  promosPerso.sort((a, b) => Number(b.pertinentePourVous) - Number(a.pertinentePourVous));

  return {
    promos: promosPerso,
    derniereMiseAJour: promos[0]?.fetchedAt ?? null,
    fluxActif: Boolean(flux),
  };
}
