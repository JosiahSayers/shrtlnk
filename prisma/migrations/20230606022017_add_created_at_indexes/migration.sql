-- CreateIndex
CREATE INDEX "Application_createdAt_idx" ON "Application" USING HASH ("createdAt");

-- CreateIndex
CREATE INDEX "Shrtlnk_createdAt_idx" ON "Shrtlnk" USING HASH ("createdAt");

-- CreateIndex
CREATE INDEX "ShrtlnkLoad_createdAt_idx" ON "ShrtlnkLoad" USING HASH ("createdAt");

-- CreateIndex
CREATE INDEX "User_createdAt_idx" ON "User" USING HASH ("createdAt");
