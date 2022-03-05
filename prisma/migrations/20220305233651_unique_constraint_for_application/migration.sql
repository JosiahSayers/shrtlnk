/*
  Warnings:

  - A unique constraint covering the columns `[id,userId]` on the table `Application` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Application_id_userId_key" ON "Application"("id", "userId");
