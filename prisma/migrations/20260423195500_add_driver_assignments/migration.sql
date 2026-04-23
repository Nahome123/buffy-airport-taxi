-- CreateTable
CREATE TABLE "Driver" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "vehicleLabel" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Driver_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "Booking"
ADD COLUMN "assignedAt" TIMESTAMP(3),
ADD COLUMN "assignedDriverId" TEXT;

-- AddForeignKey
ALTER TABLE "Booking"
ADD CONSTRAINT "Booking_assignedDriverId_fkey"
FOREIGN KEY ("assignedDriverId") REFERENCES "Driver"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;
