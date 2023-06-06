-- DropIndex
DROP INDEX "Application_createdAt_idx";

-- DropIndex
DROP INDEX "Shrtlnk_createdAt_idx";

-- DropIndex
DROP INDEX "ShrtlnkLoad_createdAt_idx";

-- DropIndex
DROP INDEX "User_createdAt_idx";

-- CreateIndex
CREATE INDEX "Application_createdAt_idx" ON "Application"("createdAt");

-- CreateIndex
CREATE INDEX "Shrtlnk_createdAt_idx" ON "Shrtlnk"("createdAt");

-- CreateIndex
CREATE INDEX "ShrtlnkLoad_createdAt_idx" ON "ShrtlnkLoad"("createdAt");

-- CreateIndex
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");
