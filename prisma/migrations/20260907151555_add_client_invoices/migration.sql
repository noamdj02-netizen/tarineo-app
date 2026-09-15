-- AlterTable
ALTER TABLE "CompanyProfile" ADD COLUMN     "nextInvoiceNumber" INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE "ClientInvoice" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "clientNom" TEXT NOT NULL,
    "clientAdresse" TEXT,
    "dateEmission" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateEcheance" TIMESTAMP(3) NOT NULL,
    "conditionsPaiement" TEXT NOT NULL,
    "totalHt" DECIMAL(10,2) NOT NULL,
    "totalTva" DECIMAL(10,2) NOT NULL,
    "totalTtc" DECIMAL(10,2) NOT NULL,
    "pdfKey" TEXT,
    "clientQuoteId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClientInvoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientInvoiceLine" (
    "id" TEXT NOT NULL,
    "clientInvoiceId" TEXT NOT NULL,
    "ordre" INTEGER NOT NULL,
    "designation" TEXT NOT NULL,
    "quantite" DECIMAL(10,2) NOT NULL,
    "prixUnitaireHt" DECIMAL(10,2) NOT NULL,
    "tauxTva" DECIMAL(5,2) NOT NULL,
    "totalHt" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "ClientInvoiceLine_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ClientInvoice_clientQuoteId_key" ON "ClientInvoice"("clientQuoteId");

-- CreateIndex
CREATE INDEX "ClientInvoice_userId_createdAt_idx" ON "ClientInvoice"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "ClientInvoiceLine_clientInvoiceId_idx" ON "ClientInvoiceLine"("clientInvoiceId");

-- AddForeignKey
ALTER TABLE "ClientInvoice" ADD CONSTRAINT "ClientInvoice_clientQuoteId_fkey" FOREIGN KEY ("clientQuoteId") REFERENCES "ClientQuote"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientInvoice" ADD CONSTRAINT "ClientInvoice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientInvoiceLine" ADD CONSTRAINT "ClientInvoiceLine_clientInvoiceId_fkey" FOREIGN KEY ("clientInvoiceId") REFERENCES "ClientInvoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;
