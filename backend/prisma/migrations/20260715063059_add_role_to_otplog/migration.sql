/*
  Warnings:

  - Added the required column `role` to the `OtpLog` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "OtpLog" ADD COLUMN     "role" "Role" NOT NULL;
