-- AlterTable
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "importEmailToken" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "trialReminderEmailSentAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "paymentFailedEmailSentAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "haussesDigestEmailSentAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "User_importEmailToken_key" ON "User"("importEmailToken");
