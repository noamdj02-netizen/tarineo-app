import type { Prisma } from "@prisma/client";

/** Documents conservés (hors brouillons doublon temporaires). */
export const filtreDocumentHorsBrouillon: Prisma.DocumentWhereInput = {
  brouillonExpireAt: null,
};

export function whereDocumentHorsBrouillon(extra?: Prisma.DocumentWhereInput): Prisma.DocumentWhereInput {
  return {
    ...filtreDocumentHorsBrouillon,
    ...extra,
  };
}
