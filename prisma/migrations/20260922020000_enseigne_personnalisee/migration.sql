-- CreateTable
CREATE TABLE "EnseignePersonnalisee" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "distributorNorm" TEXT NOT NULL,
    "metiers" TEXT,
    "domaineLogo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EnseignePersonnalisee_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EnseignePersonnalisee_userId_idx" ON "EnseignePersonnalisee"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "EnseignePersonnalisee_userId_slug_key" ON "EnseignePersonnalisee"("userId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "EnseignePersonnalisee_userId_distributorNorm_key" ON "EnseignePersonnalisee"("userId", "distributorNorm");

-- AddForeignKey
ALTER TABLE "EnseignePersonnalisee" ADD CONSTRAINT "EnseignePersonnalisee_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
