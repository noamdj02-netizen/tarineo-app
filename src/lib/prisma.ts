import { Prisma, PrismaClient } from "@prisma/client";

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
  prismaSchemaFingerprint?: string;
};

/** Empreinte du schéma généré — invalide le singleton HMR après `prisma generate`. */
function empreinteSchemaPrisma(): string {
  return Prisma.dmmf.datamodel.models
    .map((m) => `${m.name}:${m.fields.map((f) => f.name).sort().join(",")}`)
    .sort()
    .join("|");
}

function creerClientPrisma(): PrismaClient {
  return new PrismaClient({
    datasources: { db: { url: urlBaseDonnees() } },
  });
}

/** Vérifie que le client exposé possède les délégués des migrations récentes. */
function clientPrismaComplet(client: PrismaClient): boolean {
  const c = client as unknown as Record<string, { findMany?: unknown; findFirst?: unknown; create?: unknown } | undefined>;
  const requis = [
    "enseignePersonnalisee",
    "distributorLogo",
    "pennylaneConnection",
    "team",
    "teamMember",
    "teamInvitation",
  ] as const;
  return requis.every((nom) => {
    const delegate = c[nom];
    return Boolean(
      delegate &&
        (typeof delegate.findMany === "function" ||
          typeof delegate.findFirst === "function" ||
          typeof delegate.create === "function"),
    );
  });
}

function initialiserPrisma(): PrismaClient {
  const datasourceUrl = urlBaseDonnees();
  const schemaFingerprint = empreinteSchemaPrisma();

  const clientPerime =
    globalForPrisma.prisma &&
    (globalForPrisma.prismaDatasourceUrl !== datasourceUrl ||
      globalForPrisma.prismaSchemaFingerprint !== schemaFingerprint ||
      !clientPrismaComplet(globalForPrisma.prisma));

  if (clientPerime && globalForPrisma.prisma) {
    void globalForPrisma.prisma.$disconnect();
    globalForPrisma.prisma = undefined;
  }

  const client = globalForPrisma.prisma ?? creerClientPrisma();

  if (!clientPrismaComplet(client) && process.env.NODE_ENV === "development") {
    console.warn(
      "[prisma] Client incomplet (migration récente ?). Exécutez `npx prisma generate` puis redémarrez `npm run dev`.",
    );
  }

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = client;
    globalForPrisma.prismaDatasourceUrl = datasourceUrl;
    globalForPrisma.prismaSchemaFingerprint = schemaFingerprint;
  }

  return client;
}

export const prisma = initialiserPrisma();
