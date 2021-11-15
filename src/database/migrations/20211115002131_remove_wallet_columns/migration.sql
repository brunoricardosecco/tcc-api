/*
  Warnings:

  - You are about to drop the column `actual_amount` on the `wallets` table. All the data in the column will be lost.
  - You are about to drop the column `invested_amount` on the `wallets` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "wallets" DROP COLUMN "actual_amount",
DROP COLUMN "invested_amount";
