-- AlterTable
ALTER TABLE "Transcation" ADD COLUMN     "status" "TransactionStatus" NOT NULL DEFAULT 'PENDING';

-- CreateIndex
CREATE INDEX "Transcation_status_idx" ON "Transcation"("status");

-- CreateIndex
CREATE INDEX "Transcation_userId_idx" ON "Transcation"("userId");
