import "server-only";

import { prisma } from "@/lib/prisma";

type RawBooking = {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  pickupAddress: string;
  dropoffAddress: string;
  pickupTime: Date;
  passengers: number;
  luggage: number;
  fareTotal: number;
  status: string;
  stripeSessionId: string | null;
  assignedDriverId: string | null;
  assignedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

type RawPayment = {
  id: string;
  bookingId: string;
  stripePaymentId: string | null;
  amount: number;
  currency: string;
  status: string;
  createdAt: Date;
};

type RawDriver = {
  id: string;
  name: string;
  phone: string | null;
  vehicleLabel: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type AdminDashboardData = {
  schemaReady: boolean;
  bookings: Array<
    RawBooking & {
      payments: RawPayment[];
      assignedDriver: RawDriver | null;
    }
  >;
  drivers: RawDriver[];
};

type BookingWithoutDriver = RawBooking & {
  payments: RawPayment[];
};

async function hasTable(tableName: string) {
  const rows = await prisma.$queryRaw<Array<{ exists: boolean }>>`
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = ${tableName}
    ) AS "exists"
  `;

  return rows[0]?.exists ?? false;
}

async function hasColumn(tableName: string, columnName: string) {
  const rows = await prisma.$queryRaw<Array<{ exists: boolean }>>`
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = ${tableName}
        AND column_name = ${columnName}
    ) AS "exists"
  `;

  return rows[0]?.exists ?? false;
}

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  const [driverTableExists, assignedDriverIdExists, assignedAtExists] =
    await Promise.all([
      hasTable("Driver"),
      hasColumn("Booking", "assignedDriverId"),
      hasColumn("Booking", "assignedAt"),
    ]);

  const schemaReady =
    driverTableExists && assignedDriverIdExists && assignedAtExists;

  const bookings = schemaReady
    ? await prisma.booking.findMany({
        include: {
          payments: true,
          assignedDriver: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      })
    : (
        await prisma.booking.findMany({
          include: {
            payments: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        })
      ).map((booking: BookingWithoutDriver) => ({
        ...booking,
        assignedDriverId: null,
        assignedAt: null,
        assignedDriver: null,
      }));

  const drivers = schemaReady
    ? await prisma.driver.findMany({
        orderBy: {
          createdAt: "desc",
        },
      })
    : [];

  return {
    schemaReady,
    bookings,
    drivers,
  };
}
