import { PrismaClient } from "@prisma/client";

/** Paramètres obligatoires pour le pooler Supabase (port 6543, pgbouncer). */
function normaliserUrlPooler(raw: string): string {
  const url = new URL(raw);
  url.searchParams.set("connection_limit", "1");
  url.searchParams.set("pool_timeout", "60");
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

const datasourceUrl = urlBaseDonnees();

// En dev, Next recharge .env sans recréer le singleton : on reconnecte si l'URL change.
if (
  globalForPrisma.prisma &&
  globalForPrisma.prismaDatasourceUrl &&
  globalForPrisma.prismaDatasourceUrl !== datasourceUrl
) {
  void globalForPrisma.prisma.$disconnect();
  globalForPrisma.prisma = undefined;
}

export const prisma = globalForPrisma.prisma ?? creerClientPrisma();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
  globalForPrisma.prismaDatasourceUrl = datasourceUrl;
}
