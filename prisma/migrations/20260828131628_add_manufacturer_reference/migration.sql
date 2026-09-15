-- AlterTable
ALTER TABLE "LineItem" ADD COLUMN     "manufacturerRef" TEXT,
ADD COLUMN     "manufacturerRefNorm" TEXT;

-- AlterTable
ALTER TABLE "PriceHistory" ADD COLUMN     "manufacturerRefNorm" TEXT;

-- CreateIndex
CREATE INDEX "PriceHistory_userId_manufacturerRefNorm_idx" ON "PriceHistory"("userId", "manufacturerRefNorm");
