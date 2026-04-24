-- CreateTable
CREATE TABLE "DispatchSettings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "fareRatePerMileCents" INTEGER NOT NULL DEFAULT 130,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DispatchSettings_pkey" PRIMARY KEY ("id")
);

-- Seed singleton row
INSERT INTO "DispatchSettings" ("id", "fareRatePerMileCents", "createdAt", "updatedAt")
VALUES ('default', 130, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;
