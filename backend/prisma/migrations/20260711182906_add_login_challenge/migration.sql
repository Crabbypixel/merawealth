/*
  Warnings:

  - A unique constraint covering the columns `[challenge]` on the table `OtpLog` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `challenge` to the `OtpLog` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "OtpLog" ADD COLUMN     "challenge" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "OtpLog_challenge_key" ON "OtpLog"("challenge");
