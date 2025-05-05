/*
  Warnings:

  - You are about to drop the column `titre` on the `Section` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Section" DROP COLUMN "titre",
ADD COLUMN     "title" TEXT;
