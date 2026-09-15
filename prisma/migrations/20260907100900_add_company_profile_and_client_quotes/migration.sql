/*
  Warnings:

  - You are about to drop the column `clientName` on the `ClientQuote` table. All the data in the column will be lost.
  - You are about to drop the column `extraFees` on the `ClientQuote` table. All the data in the column will be lost.
  - You are about to drop the column `hours` on the `ClientQuote` table. All the data in the column will be lost.
  - You are about to drop the column `laborRate` on the `ClientQuote` table. All the data in the column will be lost.
  - You are about to drop the column `lines` on the `ClientQuote` table. All the data in the column will be lost.
  - Added the required column `clientNom` to the `ClientQuote` table without a default value. This is not possible if the table is not empty.
  - Added the required column `conditionsPaiement` to the `ClientQuote` table without a default value. This is not possible if the table is not empty.
  - Added the required column `numero` to the `ClientQuote` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalTva` to the `ClientQuote` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "RegimeTva" AS ENUM ('NORMAL', 'FRANCHISE_293B');

-- AlterTable
ALTER TABLE "ClientQuote" DROP COLUMN "clientName",
DROP COLUMN "extraFees",
DROP COLUMN "hours",
DROP COLUMN "laborRate",
DROP COLUMN "lines",
ADD COLUMN     "clientAdresse" TEXT,
ADD COLUMN     "clientNom" TEXT NOT NULL,
ADD COLUMN     "conditionsPaiement" TEXT NOT NULL,
ADD COLUMN     "dateEmission" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "dureeValiditeJours" INTEGER NOT NULL DEFAULT 30,
ADD COLUMN     "numero" TEXT NOT NULL,
ADD COLUMN     "promptOriginal" TEXT,
ADD COLUMN     "totalTva" DECIMAL(10,2) NOT NULL;

-- CreateTable
CREATE TABLE "CompanyProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "raisonSociale" TEXT NOT NULL,
    "siret" TEXT NOT NULL,
    "formeJuridique" TEXT,
    "adresseRue" TEXT NOT NULL,
    "adresseCodePostal" TEXT NOT NULL,
    "adresseVille" TEXT NOT NULL,
    "telephone" TEXT NOT NULL,
    "emailContact" TEXT NOT NULL,
    "regimeTva" "RegimeTva" NOT NULL DEFAULT 'NORMAL',
    "registreImmatriculation" TEXT,
    "assuranceNom" TEXT,
    "assuranceAdresse" TEXT,
    "assuranceNumeroContrat" TEXT,
    "assuranceActivitesGaranties" TEXT,
    "assuranceZoneGeographique" TEXT,
    "logoKey" TEXT,
    "nextQuoteNumber" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientQuoteLine" (
    "id" TEXT NOT NULL,
    "clientQuoteId" TEXT NOT NULL,
    "ordre" INTEGER NOT NULL,
    "designation" TEXT NOT NULL,
    "quantite" DECIMAL(10,2) NOT NULL,
    "prixUnitaireHt" DECIMAL(10,2) NOT NULL,
    "tauxTva" DECIMAL(5,2) NOT NULL,
    "totalHt" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "ClientQuoteLine_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CompanyProfile_userId_key" ON "CompanyProfile"("userId");

-- CreateIndex
CREATE INDEX "ClientQuoteLine_clientQuoteId_idx" ON "ClientQuoteLine"("clientQuoteId");

-- AddForeignKey
ALTER TABLE "CompanyProfile" ADD CONSTRAINT "CompanyProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientQuoteLine" ADD CONSTRAINT "ClientQuoteLine_clientQuoteId_fkey" FOREIGN KEY ("clientQuoteId") REFERENCES "ClientQuote"("id") ON DELETE CASCADE ON UPDATE CASCADE;
