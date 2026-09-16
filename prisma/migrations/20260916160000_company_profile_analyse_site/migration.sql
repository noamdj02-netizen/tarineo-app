-- Enrichissement CompanyProfile pour l'analyse automatique du site de l'artisan
-- (champs optionnels — l'IA ne remplit que ce qui est public et validé).
ALTER TABLE "CompanyProfile" ADD COLUMN IF NOT EXISTS "website" TEXT;
ALTER TABLE "CompanyProfile" ADD COLUMN IF NOT EXISTS "nomCommercial" TEXT;
ALTER TABLE "CompanyProfile" ADD COLUMN IF NOT EXISTS "siren" TEXT;
ALTER TABLE "CompanyProfile" ADD COLUMN IF NOT EXISTS "numeroTva" TEXT;
ALTER TABLE "CompanyProfile" ADD COLUMN IF NOT EXISTS "iban" TEXT;
ALTER TABLE "CompanyProfile" ADD COLUMN IF NOT EXISTS "capitalSocial" TEXT;
ALTER TABLE "CompanyProfile" ADD COLUMN IF NOT EXISTS "activite" TEXT;
ALTER TABLE "CompanyProfile" ADD COLUMN IF NOT EXISTS "activiteDescription" TEXT;
ALTER TABLE "CompanyProfile" ADD COLUMN IF NOT EXISTS "couleurPrimaire" TEXT;
ALTER TABLE "CompanyProfile" ADD COLUMN IF NOT EXISTS "couleurSecondaire" TEXT;
ALTER TABLE "CompanyProfile" ADD COLUMN IF NOT EXISTS "conditionsPaiementDefaut" TEXT;
ALTER TABLE "CompanyProfile" ADD COLUMN IF NOT EXISTS "mentionsLegales" TEXT;
