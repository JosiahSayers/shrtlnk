/*
  Warnings:

  - The primary key for the `Application` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `BlockedUrl` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Shrtlnk` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `ShrtlnkLoad` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "Application" DROP CONSTRAINT "Application_userId_fkey";

-- DropForeignKey
ALTER TABLE "BlockedUrl" DROP CONSTRAINT "BlockedUrl_applicationId_fkey";

-- DropForeignKey
ALTER TABLE "Shrtlnk" DROP CONSTRAINT "Shrtlnk_applicationId_fkey";

-- DropForeignKey
ALTER TABLE "ShrtlnkLoad" DROP CONSTRAINT "ShrtlnkLoad_shrtlnkId_fkey";

-- AlterTable
ALTER TABLE "Application" DROP CONSTRAINT "Application_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "userId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Application_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Application_id_seq";

-- AlterTable
ALTER TABLE "BlockedUrl" DROP CONSTRAINT "BlockedUrl_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "applicationId" SET DATA TYPE TEXT,
ADD CONSTRAINT "BlockedUrl_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "BlockedUrl_id_seq";

-- AlterTable
ALTER TABLE "Shrtlnk" DROP CONSTRAINT "Shrtlnk_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "applicationId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Shrtlnk_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Shrtlnk_id_seq";

-- AlterTable
ALTER TABLE "ShrtlnkLoad" DROP CONSTRAINT "ShrtlnkLoad_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "shrtlnkId" SET DATA TYPE TEXT,
ADD CONSTRAINT "ShrtlnkLoad_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "ShrtlnkLoad_id_seq";

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "User_id_seq";

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shrtlnk" ADD CONSTRAINT "Shrtlnk_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShrtlnkLoad" ADD CONSTRAINT "ShrtlnkLoad_shrtlnkId_fkey" FOREIGN KEY ("shrtlnkId") REFERENCES "Shrtlnk"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlockedUrl" ADD CONSTRAINT "BlockedUrl_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
