/*
  Warnings:

  - You are about to drop the column `assetId` on the `ExistingTrade` table. All the data in the column will be lost.
  - Added the required column `assetSymbol` to the `ExistingTrade` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."ExistingTrade" DROP CONSTRAINT "ExistingTrade_assetId_fkey";

-- AlterTable
ALTER TABLE "public"."ExistingTrade" DROP COLUMN "assetId",
ADD COLUMN     "assetSymbol" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."ExistingTrade" ADD CONSTRAINT "ExistingTrade_assetSymbol_fkey" FOREIGN KEY ("assetSymbol") REFERENCES "public"."Asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
