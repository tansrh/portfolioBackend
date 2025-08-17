/*
  Warnings:

  - A unique constraint covering the columns `[portfolioUrl]` on the table `Portfolio` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Portfolio_portfolioUrl_key" ON "Portfolio"("portfolioUrl");
