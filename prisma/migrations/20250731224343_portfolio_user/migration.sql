/*
  Warnings:

  - Added the required column `userId` to the `Portfolio` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Portfolio" ADD COLUMN     "userId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Portfolio" ADD CONSTRAINT "Portfolio_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
