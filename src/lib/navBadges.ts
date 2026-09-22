import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

export type NavBadges = {
  aVerifier: number;
  hausses: number;
};

async function chargerBadgesNavBrut(userId: string): Promise<NavBadges> {
  const [aVerifier, hausses] = await Promise.all([
    prisma.document.count({ where: { userId, status: "NEEDS_REVIEW" } }),
    prisma.alert.count({ where: { userId, type: "PRICE_INCREASE", seenAt: null } }),
  ]);
  return { aVerifier, hausses };
}

export function chargerBadgesNav(userId: string): Promise<NavBadges> {
  return unstable_cache(() => chargerBadgesNavBrut(userId), [`nav-badges-${userId}`], {
    revalidate: 45,
  })();
}
