-- AlterEnum
ALTER TYPE "TransactionStatus" ADD VALUE 'PARTIALLY_COMPLETED';

-- CreateTable
CREATE TABLE "TransactionMatch" (
    "id" SERIAL NOT NULL,
    "sellTransactionId" INTEGER NOT NULL,
    "buyTransactionId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "executionPrice" DECIMAL(12,2) NOT NULL,
    "totalAmount" DECIMAL(14,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TransactionMatch_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TransactionMatch_sellTransactionId_idx" ON "TransactionMatch"("sellTransactionId");

-- CreateIndex
CREATE INDEX "TransactionMatch_buyTransactionId_idx" ON "TransactionMatch"("buyTransactionId");

-- AddForeignKey
ALTER TABLE "TransactionMatch" ADD CONSTRAINT "TransactionMatch_sellTransactionId_fkey" FOREIGN KEY ("sellTransactionId") REFERENCES "Transaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransactionMatch" ADD CONSTRAINT "TransactionMatch_buyTransactionId_fkey" FOREIGN KEY ("buyTransactionId") REFERENCES "Transaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
