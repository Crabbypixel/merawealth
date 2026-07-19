-- AlterTable
ALTER TABLE "User" ADD COLUMN     "bankAccountNo" VARCHAR(34),
ADD COLUMN     "bankName" VARCHAR(100),
ADD COLUMN     "dematClientId" VARCHAR(10),
ADD COLUMN     "dematDpId" VARCHAR(10),
ADD COLUMN     "ifscCode" CHAR(11),
ADD COLUMN     "panNumber" CHAR(10);
