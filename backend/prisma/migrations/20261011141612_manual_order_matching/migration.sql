/*
  Warnings:

  - You are about to drop the column `buyTransactionId` on the `TransactionMatch` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `TransactionMatch` table. All the data in the column will be lost.
  - You are about to drop the column `executionPrice` on the `TransactionMatch` table. All the data in the column will be lost.
  - You are about to drop the column `sellTransactionId` on the `TransactionMatch` table. All the data in the column will be lost.
  - You are about to drop the column `totalAmount` on the `TransactionMatch` table. All the data in the column will be lost.
  - Added the required column `companyCode` to the `TransactionMatch` table without a default value. This is not possible if the table is not empty.
  - Added the required column `matchId` to the `TransactionMatch` table without a default value. This is not possible if the table is not empty.
  - Added the required column `matchedByAdminId` to the `TransactionMatch` table without a default value. This is not possible if the table is not empty.
  - Added the required column `transactionId` to the `TransactionMatch` table without a default value. This is not possible if the table is not empty.

*/
-- Safety check: the old TransactionMatch table was never used by the app, so it
-- should be empty. Stop instead of silently deleting data if it is not.
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM "TransactionMatch") THEN
        RAISE EXCEPTION 'TransactionMatch is not empty; back it up and empty it before running this migration.';
    END IF;
END $$;

-- DropForeignKey
ALTER TABLE "TransactionMatch" DROP CONSTRAINT "TransactionMatch_buyTransactionId_fkey";

-- DropForeignKey
ALTER TABLE "TransactionMatch" DROP CONSTRAINT "TransactionMatch_sellTransactionId_fkey";

-- DropIndex
DROP INDEX "TransactionMatch_buyTransactionId_idx";

-- DropIndex
DROP INDEX "TransactionMatch_sellTransactionId_idx";

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "approvedQuantity" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "matchedQuantity" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "pendingQuantity" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "TransactionMatch" DROP COLUMN "buyTransactionId",
DROP COLUMN "createdAt",
DROP COLUMN "executionPrice",
DROP COLUMN "sellTransactionId",
DROP COLUMN "totalAmount",
ADD COLUMN     "companyCode" TEXT NOT NULL,
ADD COLUMN     "matchDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "matchId" VARCHAR(20) NOT NULL,
ADD COLUMN     "matchedByAdminId" INTEGER NOT NULL,
ADD COLUMN     "transactionId" INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX "TransactionMatch_companyCode_matchId_idx" ON "TransactionMatch"("companyCode", "matchId");

-- CreateIndex
CREATE INDEX "TransactionMatch_transactionId_idx" ON "TransactionMatch"("transactionId");

-- AddForeignKey
ALTER TABLE "TransactionMatch" ADD CONSTRAINT "TransactionMatch_companyCode_fkey" FOREIGN KEY ("companyCode") REFERENCES "Company"("companyCode") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransactionMatch" ADD CONSTRAINT "TransactionMatch_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransactionMatch" ADD CONSTRAINT "TransactionMatch_matchedByAdminId_fkey" FOREIGN KEY ("matchedByAdminId") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Keep the order quantities consistent at the database level
-- (Prisma does not model CHECK constraints, so they live only here).
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_quantities_check" CHECK (
    "approvedQuantity" >= 0
    AND "matchedQuantity" >= 0
    AND "pendingQuantity" >= 0
    AND "pendingQuantity" = "approvedQuantity" - "matchedQuantity"
);

ALTER TABLE "TransactionMatch" ADD CONSTRAINT "TransactionMatch_quantity_check" CHECK ("quantity" > 0);
