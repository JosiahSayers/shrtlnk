-- CreateTable
CREATE TABLE "Impersonation" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "impersonatorId" TEXT NOT NULL,
    "impersonatedId" TEXT NOT NULL,

    CONSTRAINT "Impersonation_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Impersonation" ADD CONSTRAINT "Impersonation_impersonatorId_fkey" FOREIGN KEY ("impersonatorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Impersonation" ADD CONSTRAINT "Impersonation_impersonatedId_fkey" FOREIGN KEY ("impersonatedId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
