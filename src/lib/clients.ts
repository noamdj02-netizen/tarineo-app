import { prisma } from "@/lib/prisma";

export type ClientAgrege = {
  cle: string;
  nom: string;
  siret: string | null;
  email: string | null;
  adresse: string | null;
  devis: number;
  factures: number;
  totalDevisHt: number;
  totalFactureHt: number;
  derniereActivite: Date | null;
};

export function cleClient(nom: string): string {
  return nom.trim().toLowerCase();
}

export function hrefClient(nom: string): string {
  return `/clients/${encodeURIComponent(cleClient(nom))}`;
}

const formaterSiret = (siret: string) => {
  const chiffres = siret.replace(/\s/g, "");
  if (chiffres.length !== 14) return siret;
  return `${chiffres.slice(0, 3)} ${chiffres.slice(3, 6)} ${chiffres.slice(6, 9)} ${chiffres.slice(9)}`;
};

export async function agregerClientsUtilisateur(userId: string): Promise<ClientAgrege[]> {
  const [quotes, invoices] = await Promise.all([
    prisma.clientQuote.findMany({
      where: { userId },
      select: {
        clientNom: true,
        clientAdresse: true,
        clientSiret: true,
        clientEmail: true,
        totalHt: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.clientInvoice.findMany({
      where: { userId },
      select: {
        clientNom: true,
        clientAdresse: true,
        clientSiret: true,
        clientEmail: true,
        totalHt: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const parCle = new Map<string, ClientAgrege>();

  const toucher = (
    nom: string,
    patch: Partial<Pick<ClientAgrege, "adresse" | "siret" | "email">> & { date: Date; devisHt?: number; factureHt?: number }
  ) => {
    const cle = cleClient(nom);
    if (!cle) return;
    const existant = parCle.get(cle);
    if (existant) {
      if (patch.devisHt) existant.devis += 1;
      if (patch.factureHt) existant.factures += 1;
      if (patch.devisHt) existant.totalDevisHt += patch.devisHt;
      if (patch.factureHt) existant.totalFactureHt += patch.factureHt;
      if (!existant.adresse && patch.adresse) existant.adresse = patch.adresse;
      if (!existant.siret && patch.siret) existant.siret = patch.siret;
      if (!existant.email && patch.email) existant.email = patch.email;
      if (!existant.derniereActivite || patch.date > existant.derniereActivite) {
        existant.derniereActivite = patch.date;
      }
      return;
    }
    parCle.set(cle, {
      cle,
      nom: nom.trim(),
      adresse: patch.adresse ?? null,
      siret: patch.siret ?? null,
      email: patch.email ?? null,
      devis: patch.devisHt ? 1 : 0,
      factures: patch.factureHt ? 1 : 0,
      totalDevisHt: patch.devisHt ?? 0,
      totalFactureHt: patch.factureHt ?? 0,
      derniereActivite: patch.date,
    });
  };

  for (const q of quotes) {
    toucher(q.clientNom, {
      adresse: q.clientAdresse,
      siret: q.clientSiret,
      email: q.clientEmail,
      date: q.createdAt,
      devisHt: Number(q.totalHt),
    });
  }

  for (const inv of invoices) {
    toucher(inv.clientNom, {
      adresse: inv.clientAdresse,
      siret: inv.clientSiret,
      email: inv.clientEmail,
      date: inv.createdAt,
      factureHt: Number(inv.totalHt),
    });
  }

  return [...parCle.values()]
    .map((client) => ({
      ...client,
      siret: client.siret ? formaterSiret(client.siret) : null,
    }))
    .sort((a, b) => {
      const dateA = a.derniereActivite?.getTime() ?? 0;
      const dateB = b.derniereActivite?.getTime() ?? 0;
      if (dateB !== dateA) return dateB - dateA;
      return a.nom.localeCompare(b.nom, "fr");
    });
}

export function filtrerClients(clients: ClientAgrege[], query: string): ClientAgrege[] {
  const q = query.trim().toLowerCase();
  if (!q) return clients;
  return clients.filter(
    (c) =>
      c.nom.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.siret?.replace(/\s/g, "").includes(q.replace(/\s/g, ""))
  );
}
