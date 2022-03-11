-- CreateTable
CREATE TABLE "BlockedUrl" (
    "id" SERIAL NOT NULL,
    "url" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "applicationId" INTEGER NOT NULL,

    CONSTRAINT "BlockedUrl_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "BlockedUrl" ADD CONSTRAINT "BlockedUrl_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
