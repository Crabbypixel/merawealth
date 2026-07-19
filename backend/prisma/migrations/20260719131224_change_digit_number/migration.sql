/*
  Warnings:

  - You are about to alter the column `dematClientId` on the `User` table. The data in that column could be lost. The data in that column will be cast from `VarChar(10)` to `VarChar(8)`.
  - You are about to alter the column `dematDpId` on the `User` table. The data in that column could be lost. The data in that column will be cast from `VarChar(10)` to `VarChar(8)`.

*/
-- AlterTable
ALTER TABLE "User" ALTER COLUMN "dematClientId" SET DATA TYPE VARCHAR(8),
ALTER COLUMN "dematDpId" SET DATA TYPE VARCHAR(8);
