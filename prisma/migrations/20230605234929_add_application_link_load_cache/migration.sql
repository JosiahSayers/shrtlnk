-- AlterTable
ALTER TABLE "Application" ADD COLUMN     "totalLoads" INTEGER NOT NULL DEFAULT 0;

COMMIT;

UPDATE "Application" AS a
SET "totalLoads" = (
  SELECT COUNT(sl.id) FROM "Shrtlnk" AS s
	JOIN "ShrtlnkLoad" AS sl ON sl."shrtlnkId" = s.id
  WHERE s."applicationId" = a.id
);
