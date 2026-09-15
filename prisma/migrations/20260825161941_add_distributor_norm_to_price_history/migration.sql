/*
  Warnings:

  - Added the required column `distributorNorm` to the `PriceHistory` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "PriceHistory_userId_referenceNorm_idx";

-- AlterTable (nullable d'abord pour permettre le backfill des lignes existantes)
ALTER TABLE "PriceHistory" ADD COLUMN     "distributorNorm" TEXT;

-- Backfill : approximation SQL (trim + upper, sans suppression des accents) suffisante
-- pour les données existantes, qui n'en contiennent pas. Les nouvelles lignes sont
-- écrites avec la normalisation JS complète (voir src/lib/normalisation.ts).
UPDATE "PriceHistory" SET "distributorNorm" = upper(trim("distributor"));

-- AlterTable
ALTER TABLE "PriceHistory" ALTER COLUMN "distributorNorm" SET NOT NULL;

-- CreateIndex
CREATE INDEX "PriceHistory_userId_referenceNorm_distributorNorm_idx" ON "PriceHistory"("userId", "referenceNorm", "distributorNorm");
