-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "fileHash" TEXT,
ADD COLUMN     "possibleDoublon" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Document_userId_fileHash_idx" ON "Document"("userId", "fileHash");
