import { LABELS_TYPE } from "@/lib/documentLabels";
import { normaliserDistributeur } from "@/lib/normalisation";
import { prisma } from "@/lib/prisma";
import { filtreRechercheDocument } from "@/lib/rechercheDocuments";
import {
  suggestionsCategoriesEtFiltres,
  type SuggestionRecherche,
} from "@/lib/suggestionsRechercheTypes";

export type { SuggestionRecherche } from "@/lib/suggestionsRechercheTypes";

function formaterDate(date: Date | null): string {
  if (!date) return "Date inconnue";
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
}

export async function suggererRechercheDocuments(
  userId: string,
  requete: string,
): Promise<SuggestionRecherche[]> {
  const brut = requete.trim();
  if (brut.length < 2) return [];

  const statiques = suggestionsCategoriesEtFiltres(brut);
  const filtre = filtreRechercheDocument(brut);
  const distNorm = normaliserDistributeur(brut);

  const [documents, distributeurs] = await Promise.all([
    prisma.document.findMany({
      where: { userId, ...filtre },
      select: {
        id: true,
        type: true,
        distributor: true,
        documentDate: true,
        status: true,
      },
      orderBy: [{ documentDate: { sort: "desc", nulls: "last" } }, { createdAt: "desc" }],
      take: 5,
    }),
    prisma.document.findMany({
      where: {
        userId,
        distributorNorm: { not: null },
        OR: [
          { distributor: { contains: brut, mode: "insensitive" } },
          { distributorNorm: { contains: distNorm } },
          ...(distNorm.replace(/\s/g, "") !== distNorm
            ? [{ distributorNorm: { contains: distNorm.replace(/\s/g, "") } }]
            : []),
        ],
      },
      select: { distributor: true, distributorNorm: true },
      distinct: ["distributorNorm"],
      take: 4,
    }),
  ]);

  const suggestions: SuggestionRecherche[] = [
    {
      id: "tout",
      type: "tout",
      titre: `Tous les documents — « ${brut} »`,
      sousTitre: "Recherche globale",
      href: `/documents?q=${encodeURIComponent(brut)}`,
    },
    ...statiques,
  ];

  for (const dist of distributeurs) {
    if (!dist.distributorNorm) continue;
    suggestions.push({
      id: `dist-${dist.distributorNorm}`,
      type: "fournisseur",
      titre: dist.distributor ?? dist.distributorNorm,
      sousTitre: `Fournisseur · « ${brut} »`,
      href: `/documents?q=${encodeURIComponent(brut)}&distributeur=${encodeURIComponent(dist.distributorNorm)}`,
    });
  }

  for (const doc of documents) {
    const libelleType = LABELS_TYPE[doc.type] ?? "Document";
    suggestions.push({
      id: `doc-${doc.id}`,
      type: "document",
      titre: doc.distributor ? `${libelleType} — ${doc.distributor}` : libelleType,
      sousTitre: formaterDate(doc.documentDate),
      href: `/documents/${doc.id}`,
    });
  }

  const vus = new Set<string>();
  return suggestions
    .filter((s) => {
      if (vus.has(s.href)) return false;
      vus.add(s.href);
      return true;
    })
    .slice(0, 8);
}
