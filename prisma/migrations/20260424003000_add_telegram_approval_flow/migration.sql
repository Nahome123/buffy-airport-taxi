-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CARD', 'CASH');

-- AlterEnum
ALTER TYPE "BookingStatus" ADD VALUE IF NOT EXISTS 'AWAITING_APPROVAL';

-- AlterTable
ALTER TABLE "Booking"
ADD COLUMN "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'CARD',
ADD COLUMN "approvalDecisionAt" TIMESTAMP(3);
