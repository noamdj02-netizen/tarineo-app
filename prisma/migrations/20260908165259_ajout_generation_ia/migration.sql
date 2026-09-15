-- CreateTable
CREATE TABLE "GenerationIA" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GenerationIA_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GenerationIA_userId_createdAt_idx" ON "GenerationIA"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "GenerationIA" ADD CONSTRAINT "GenerationIA_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
