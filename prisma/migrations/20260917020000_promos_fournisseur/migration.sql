-- CreateTable
CREATE TABLE "PromoFournisseur" (
    "id" TEXT NOT NULL,
    "bibliothequeId" TEXT NOT NULL,
    "distributorNorm" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "remisePct" DECIMAL(5,2),
    "valableJusquA" TIMESTAMP(3),
    "sourceUrl" TEXT NOT NULL,
    "confiance" DOUBLE PRECISION NOT NULL,
    "fetchedAt" TIMESTAMP(3) NOT NULL,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PromoFournisseur_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromoFetchLog" (
    "id" TEXT NOT NULL,
    "bibliothequeId" TEXT NOT NULL,
    "userId" TEXT,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "succes" BOOLEAN NOT NULL,
    "nbPromos" INTEGER NOT NULL DEFAULT 0,
    "message" TEXT,

    CONSTRAINT "PromoFetchLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PromoFournisseur_bibliothequeId_actif_fetchedAt_idx" ON "PromoFournisseur"("bibliothequeId", "actif", "fetchedAt");

-- CreateIndex
CREATE INDEX "PromoFournisseur_distributorNorm_idx" ON "PromoFournisseur"("distributorNorm");

-- CreateIndex
CREATE INDEX "PromoFetchLog_bibliothequeId_fetchedAt_idx" ON "PromoFetchLog"("bibliothequeId", "fetchedAt");
