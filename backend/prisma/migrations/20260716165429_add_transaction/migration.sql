-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('BUY', 'SELL');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('PENDING', 'UNDER_PROCESS', 'COMPLETED', 'REJECTED', 'CANCELLED');

-- CreateTable
CREATE TABLE "Transcation" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "companyCode" TEXT NOT NULL,
    "type" "TransactionType" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "priceAtOrder" DECIMAL(12,2) NOT NULL,
    "totalAmount" DECIMAL(14,2) NOT NULL,
    "adminRemarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transcation_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Transcation" ADD CONSTRAINT "Transcation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transcation" ADD CONSTRAINT "Transcation_companyCode_fkey" FOREIGN KEY ("companyCode") REFERENCES "Company"("companyCode") ON DELETE RESTRICT ON UPDATE CASCADE;
