-- Export comptable automatique vers expert-comptable
ALTER TABLE "CompanyProfile" ADD COLUMN "emailComptable" TEXT;
ALTER TABLE "CompanyProfile" ADD COLUMN "exportComptableAuto" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "CompanyProfile" ADD COLUMN "exportComptableDernierMois" TEXT;
