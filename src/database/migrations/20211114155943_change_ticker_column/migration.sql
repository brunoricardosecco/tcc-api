/*
  Warnings:

  - You are about to drop the column `rawTicker` on the `transaction` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "transaction" DROP COLUMN "rawTicker",
ADD COLUMN     "raw_ticker" TEXT NOT NULL DEFAULT E'';
