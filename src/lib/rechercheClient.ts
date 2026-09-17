import { prisma } from "@/lib/prisma";

export type SourceClient = "insee" | "gmail" | "tarineo";

export interface ClientRecherche {
  id: string;
  source: SourceClient;
  nom: string;
  siret?: string | null;
  adresse?: string | null;
  email?: string | null;
  detail?: string;
}

export interface ResultatsRechercheClient {
  insee: ClientRecherche[];
  tarineo: ClientRecherche[];
  gmail: ClientRecherche[];
  gmailDisponible: boolean;
}

const LONGUEUR_MIN = 2;
const LIMITE_INSEE = 5;
const LIMITE_TARINEO = 8;

function formaterSiret(siret: string): string {
  const chiffres = siret.replace(/\s/g, "");
  if (chiffres.length !== 14) return siret;
  return `${chiffres.slice(0, 3)} ${chiffres.slice(3, 6)} ${chiffres.slice(6, 9)} ${chiffres.slice(9)}`;
}

function adresseDepuisSiegeInsee(siege: {
  adresse?: string | null;
  code_postal?: string | null;
  libelle_commune?: string | null;
}): string | null {
  if (siege.adresse?.trim()) return siege.adresse.trim();
  const morceaux = [siege.code_postal, siege.libelle_commune].filter(Boolean);
  return morceaux.length > 0 ? morceaux.join(" ") : null;
}

export async function rechercherClientsInsee(query: string): Promise<ClientRecherche[]> {
  const q = query.trim();
  if (q.length < LONGUEUR_MIN) return [];

  const params = new URLSearchParams({ q, limit: String(LIMITE_INSEE), page: "1" });
  const reponse = await fetch(`https://recherche-entreprises.api.gouv.fr/search?${params}`, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  if (!reponse.ok) {
    console.error("Recherche INSEE échouée :", reponse.status, reponse.statusText);
    return [];
  }

  const donnees = (await reponse.json()) as {
    results?: Array<{
      nom_complet?: string;
      siege?: {
        siret?: string;
        adresse?: string;
        code_postal?: string;
        libelle_commune?: string;
      };
    }>;
  };

  const resultats: ClientRecherche[] = [];
  for (const [index, entreprise] of (donnees.results ?? []).entries()) {
    const nom = entreprise.nom_complet?.trim();
    const siret = entreprise.siege?.siret?.trim();
    if (!nom) continue;
    const adresse = entreprise.siege ? adresseDepuisSiegeInsee(entreprise.siege) : null;
    resultats.push({
      id: `insee-${siret ?? index}`,
      source: "insee",
      nom,
      siret: siret ? formaterSiret(siret) : null,
      adresse,
      email: null,
      detail: siret ? `SIRET ${formaterSiret(siret)}` : "Registre des entreprises",
    });
  }
  return resultats;
}

export async function rechercherClientsTarineo(userId: string, query: string): Promise<ClientRecherche[]> {
  const q = query.trim();
  if (q.length < LONGUEUR_MIN) return [];

  const filtre = { contains: q, mode: "insensitive" as const };

  const [quotes, invoices] = await Promise.all([
    prisma.clientQuote.findMany({
      where: { userId, clientNom: filtre },
      select: { clientNom: true, clientAdresse: true, clientSiret: true, clientEmail: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      take: 40,
    }),
    prisma.clientInvoice.findMany({
      where: { userId, clientNom: filtre },
      select: { clientNom: true, clientAdresse: true, clientSiret: true, clientEmail: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      take: 40,
    }),
  ]);

  const parCle = new Map<
    string,
    { nom: string; adresse: string | null; siret: string | null; email: string | null; devis: number; factures: number }
  >();

  for (const doc of quotes) {
    const cle = doc.clientNom.trim().toLowerCase();
    if (!cle) continue;
    const existant = parCle.get(cle);
    if (existant) {
      existant.devis += 1;
      if (!existant.adresse && doc.clientAdresse) existant.adresse = doc.clientAdresse;
      if (!existant.siret && doc.clientSiret) existant.siret = doc.clientSiret;
      if (!existant.email && doc.clientEmail) existant.email = doc.clientEmail;
    } else {
      parCle.set(cle, {
        nom: doc.clientNom.trim(),
        adresse: doc.clientAdresse,
        siret: doc.clientSiret,
        email: doc.clientEmail,
        devis: 1,
        factures: 0,
      });
    }
  }

  for (const doc of invoices) {
    const cle = doc.clientNom.trim().toLowerCase();
    if (!cle) continue;
    const existant = parCle.get(cle);
    if (existant) {
      existant.factures += 1;
      if (!existant.adresse && doc.clientAdresse) existant.adresse = doc.clientAdresse;
      if (!existant.siret && doc.clientSiret) existant.siret = doc.clientSiret;
      if (!existant.email && doc.clientEmail) existant.email = doc.clientEmail;
    } else {
      parCle.set(cle, {
        nom: doc.clientNom.trim(),
        adresse: doc.clientAdresse,
        siret: doc.clientSiret,
        email: doc.clientEmail,
        devis: 0,
        factures: 1,
      });
    }
  }

  return [...parCle.values()]
    .sort((a, b) => a.nom.localeCompare(b.nom, "fr"))
    .slice(0, LIMITE_TARINEO)
    .map((client) => {
      const morceaux: string[] = [];
      if (client.devis > 0) morceaux.push(`${client.devis} devis`);
      if (client.factures > 0) morceaux.push(`${client.factures} facture${client.factures > 1 ? "s" : ""}`);
      return {
        id: `tarineo-${client.nom.toLowerCase()}`,
        source: "tarineo" as const,
        nom: client.nom,
        siret: client.siret,
        adresse: client.adresse,
        email: client.email,
        detail: morceaux.join(" · ") || "Client Tarinéo",
      };
    });
}

export async function rechercherClients(
  userId: string,
  query: string,
  source?: SourceClient
): Promise<ResultatsRechercheClient> {
  const rechercherInsee = !source || source === "insee";
  const rechercherTarineo = !source || source === "tarineo";

  const [insee, tarineo] = await Promise.all([
    rechercherInsee ? rechercherClientsInsee(query) : Promise.resolve([]),
    rechercherTarineo ? rechercherClientsTarineo(userId, query) : Promise.resolve([]),
  ]);

  return {
    insee,
    tarineo,
    gmail: [],
    gmailDisponible: false,
  };
}
