-- CreateTable
CREATE TABLE "DistributorLogo" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "distributorNorm" TEXT NOT NULL,
    "distributor" TEXT NOT NULL,
    "logoKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DistributorLogo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DistributorLogo_userId_idx" ON "DistributorLogo"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "DistributorLogo_userId_distributorNorm_key" ON "DistributorLogo"("userId", "distributorNorm");

-- AddForeignKey
ALTER TABLE "DistributorLogo" ADD CONSTRAINT "DistributorLogo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
