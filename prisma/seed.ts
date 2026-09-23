import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

/** Compte fondateur / test — accès complet (plan Équipe, abonnement actif). */
const COMPTE_FONDATEUR = {
  email: "noamdj02@gmail.com",
  name: "Noam DJ02",
  password: process.env.SEED_PASSWORD ?? "Tarineo2026!",
  plan: "equipe" as const,
  subscriptionStatus: "active" as const,
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
      plan: COMPTE_FONDATEUR.plan,
      subscriptionStatus: COMPTE_FONDATEUR.subscriptionStatus,
    },
    update: {
      name: COMPTE_FONDATEUR.name,
      passwordHash,
      plan: COMPTE_FONDATEUR.plan,
      subscriptionStatus: COMPTE_FONDATEUR.subscriptionStatus,
    },
  });

  console.log(
    `Compte test prêt : ${COMPTE_FONDATEUR.email} (plan ${COMPTE_FONDATEUR.plan}, ${COMPTE_FONDATEUR.subscriptionStatus})`,
  );
}

main()
  .catch((erreur) => {
    console.error(erreur);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
