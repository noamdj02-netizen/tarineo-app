import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

const COMPTE_FONDATEUR = {
  email: "noamdj02@gmail.com",
  name: "Noam DJ02",
  password: process.env.SEED_PASSWORD ?? "Tarineo2026!",
};

async function main() {
  const passwordHash = await hash(COMPTE_FONDATEUR.password, 12);

  await prisma.user.upsert({
    where: { email: COMPTE_FONDATEUR.email },
    create: {
      email: COMPTE_FONDATEUR.email,
      name: COMPTE_FONDATEUR.name,
      passwordHash,
      consentAt: new Date(),
      subscriptionStatus: "trialing",
    },
    update: {
      name: COMPTE_FONDATEUR.name,
      passwordHash,
    },
  });

  console.log(`Compte prêt : ${COMPTE_FONDATEUR.email} (${COMPTE_FONDATEUR.name})`);
}

main()
  .catch((erreur) => {
    console.error(erreur);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
