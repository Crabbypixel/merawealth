-- CreateEnum
CREATE TYPE "SessionTerminationReason" AS ENUM ('LOGOUT', 'NEW_LOGIN', 'EXPIRED', 'ADMIN');

-- AlterTable
ALTER TABLE "Session" ADD COLUMN     "logoutAt" TIMESTAMP(3),
ADD COLUMN     "terminationReason" "SessionTerminationReason";
