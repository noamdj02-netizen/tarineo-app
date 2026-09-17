import { PrismaClient } from "@prisma/client";

/** Paramètres obligatoires pour le pooler Supabase (port 6543, pgbouncer). */
function normaliserUrlPooler(raw: string): string {
  const url = new URL(raw);
  // En dev, 3 connexions évitent les timeouts quand plusieurs pages chargent en parallèle
  // (navigation client + prefetch). En prod serverless : 1 instance = 1 connexion.
  const limit = process.env.NODE_ENV === "development" ? "3" : "1";
  url.searchParams.set("connection_limit", limit);
  url.searchParams.set("pool_timeout", "90");
  if (!url.searchParams.has("connect_timeout")) {
    url.searchParams.set("connect_timeout", "30");
  }
  return url.toString();
}

function urlBaseDonnees(): string {
  const raw = process.env.DATABASE_URL;
  if (!raw) {
    throw new Error("DATABASE_URL est manquant dans l'environnement.");
  }
  return normaliserUrlPooler(raw);
}

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  prismaDatasourceUrl?: string;
};

function creerClientPrisma(): PrismaClient {
  return new PrismaClient({
    datasources: { db: { url: urlBaseDonnees() } },
  });
}

/** Après `prisma migrate` + `generate`, le singleton HMR peut garder un client sans les nouveaux modèles. */
function clientPrismaAJour(client: PrismaClient): boolean {
  const delegate = (client as PrismaClient & { promoFetchLog?: { findFirst?: unknown } }).promoFetchLog;
  return Boolean(delegate && typeof delegate.findFirst === "function");
}

const datasourceUrl = urlBaseDonnees();

// En dev, Next recharge .env sans recréer le singleton : on reconnecte si l'URL change
// ou si le client Prisma a été généré avant une migration récente.
if (
  globalForPrisma.prisma &&
  ((globalForPrisma.prismaDatasourceUrl && globalForPrisma.prismaDatasourceUrl !== datasourceUrl) ||
    !clientPrismaAJour(globalForPrisma.prisma))
) {
  void globalForPrisma.prisma.$disconnect();
  globalForPrisma.prisma = undefined;
}

export const prisma = globalForPrisma.prisma ?? creerClientPrisma();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
  globalForPrisma.prismaDatasourceUrl = datasourceUrl;
}
