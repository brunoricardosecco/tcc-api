-- CreateEnum
CREATE TYPE "transaction_categories" AS ENUM ('STOCKS', 'IF', 'TREASURE');

-- CreateEnum
CREATE TYPE "transaction_types" AS ENUM ('BUY', 'SELL');

-- CreateTable
CREATE TABLE "transaction" (
    "id" SERIAL NOT NULL,
    "type" "transaction_types" NOT NULL DEFAULT E'BUY',
    "category" "transaction_categories" NOT NULL DEFAULT E'STOCKS',
    "ticker" TEXT NOT NULL,
    "financial_institution" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" MONEY NOT NULL,
    "walletId" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transaction_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "wallets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
