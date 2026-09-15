-- DropIndex
DROP INDEX "Document_userId_distributor_idx";

-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "distributorNorm" TEXT;

-- Backfill : approximation SQL (trim + upper, sans suppression des accents) suffisante
-- pour les données existantes, qui n'en contiennent pas. Les nouvelles lignes sont
-- écrites avec la normalisation JS complète (voir src/lib/normalisation.ts).
UPDATE "Document" SET "distributorNorm" = upper(trim("distributor")) WHERE "distributor" IS NOT NULL;

-- CreateTable
CREATE TABLE "DistributorGoal" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "distributor" TEXT NOT NULL,
    "distributorNorm" TEXT NOT NULL,
    "targetHt" DECIMAL(10,2) NOT NULL,
    "periodStartMonth" INTEGER NOT NULL DEFAULT 1,
    "periodStartDay" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DistributorGoal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DistributorGoal_userId_distributorNorm_key" ON "DistributorGoal"("userId", "distributorNorm");

-- CreateIndex
CREATE INDEX "Document_userId_distributorNorm_idx" ON "Document"("userId", "distributorNorm");

-- AddForeignKey
ALTER TABLE "DistributorGoal" ADD CONSTRAINT "DistributorGoal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
