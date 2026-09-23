/**
 * Vitest : fournit un DATABASE_URL factice pour que l'import de `prisma`
 * (effet de bord au chargement des modules) ne fasse pas échouer les tests unitaires
 * qui n'ont pas besoin de la base.
 */
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL =
    "postgresql://vitest:vitest@127.0.0.1:5432/vitest?schema=public";
}
