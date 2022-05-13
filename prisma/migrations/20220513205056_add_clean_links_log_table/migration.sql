-- AlterTable
ALTER TABLE "BlockedUrl" ADD COLUMN     "foundBy" TEXT;

-- CreateTable
CREATE TABLE "CleanLinksLog" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "totalThreatsFound" INTEGER,

    CONSTRAINT "CleanLinksLog_pkey" PRIMARY KEY ("id")
);
