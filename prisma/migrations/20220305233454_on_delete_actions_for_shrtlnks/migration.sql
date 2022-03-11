-- DropForeignKey
ALTER TABLE "Shrtlnk" DROP CONSTRAINT "Shrtlnk_applicationId_fkey";

-- DropForeignKey
ALTER TABLE "ShrtlnkLoad" DROP CONSTRAINT "ShrtlnkLoad_shrtlnkId_fkey";

-- AddForeignKey
ALTER TABLE "Shrtlnk" ADD CONSTRAINT "Shrtlnk_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShrtlnkLoad" ADD CONSTRAINT "ShrtlnkLoad_shrtlnkId_fkey" FOREIGN KEY ("shrtlnkId") REFERENCES "Shrtlnk"("id") ON DELETE CASCADE ON UPDATE CASCADE;
