"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import {
  authenticateAdmin,
  clearAdminSession,
  createAdminSession,
  requireAdminSession,
} from "@/lib/admin-auth";
import { getAdminDashboardData } from "@/lib/admin-dashboard";
import { getFareSettings, hasDispatchSettingsTable } from "@/lib/fare-settings";
import { prisma } from "@/lib/prisma";

const loginSchema = z.object({
  username: z.string().trim().min(1, "Enter your username."),
  password: z.string().min(1, "Enter your password."),
});

const addDriverSchema = z.object({
  name: z.string().trim().min(2, "Driver name must be at least 2 characters."),
  phone: z.string().trim().optional(),
  vehicleLabel: z.string().trim().optional(),
});

const assignDriverSchema = z.object({
  bookingId: z.string().trim().min(1),
  driverId: z.string().trim().optional(),
});

const deleteBookingSchema = z.object({
  bookingId: z.string().trim().min(1),
});

const updateFareRateSchema = z.object({
  fareRatePerMile: z.coerce
    .number()
    .finite()
    .min(0.5, "Fare rate must be at least $0.50 per mile.")
    .max(25, "Fare rate must be $25.00 per mile or less."),
});

export type AdminLoginState =
  | {
      error?: string;
    }
  | undefined;

export async function loginAdmin(
  _state: AdminLoginState,
  formData: FormData,
): Promise<AdminLoginState> {
  const parsed = loginSchema.safeParse({
    username: formData.get("username"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Please check your login details.",
    };
  }

  const isValid = await authenticateAdmin(
    parsed.data.username,
    parsed.data.password,
  );

  if (!isValid) {
    return {
      error: "Those admin credentials did not match.",
    };
  }

  await createAdminSession();
  redirect("/admin");
}

export async function logoutAdmin() {
  await clearAdminSession();
  redirect("/admin/login");
}

export async function addDriver(formData: FormData) {
  await requireAdminSession();
  const { schemaReady } = await getAdminDashboardData();

  if (!schemaReady) {
    throw new Error("Run the latest Prisma migration before adding drivers.");
  }

  const parsed = addDriverSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone") ?? "",
    vehicleLabel: formData.get("vehicleLabel") ?? "",
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid driver details.");
  }

  await prisma.driver.create({
    data: {
      name: parsed.data.name,
      phone: parsed.data.phone || null,
      vehicleLabel: parsed.data.vehicleLabel || null,
    },
  });

  revalidatePath("/admin");
}

export async function assignDriverToBooking(formData: FormData) {
  await requireAdminSession();
  const { schemaReady } = await getAdminDashboardData();

  if (!schemaReady) {
    throw new Error("Run the latest Prisma migration before assigning drivers.");
  }

  const parsed = assignDriverSchema.safeParse({
    bookingId: formData.get("bookingId"),
    driverId: formData.get("driverId") ?? "",
  });

  if (!parsed.success) {
    throw new Error("Could not read the driver assignment.");
  }

  const driverId = parsed.data.driverId || null;

  if (driverId) {
    const driver = await prisma.driver.findUnique({
      where: { id: driverId },
      select: { id: true, isActive: true },
    });

    if (!driver?.isActive) {
      throw new Error("Choose an active driver for this trip.");
    }
  }

  await prisma.booking.update({
    where: { id: parsed.data.bookingId },
    data: {
      assignedDriverId: driverId,
      assignedAt: driverId ? new Date() : null,
    },
  });

  revalidatePath("/admin");
}

export async function deleteBooking(formData: FormData) {
  await requireAdminSession();

  const parsed = deleteBookingSchema.safeParse({
    bookingId: formData.get("bookingId"),
  });

  if (!parsed.success) {
    throw new Error("Could not read the booking to delete.");
  }

  await prisma.booking.delete({
    where: {
      id: parsed.data.bookingId,
    },
  });

  revalidatePath("/admin");
}

export async function updateFareRate(formData: FormData) {
  await requireAdminSession();

  if (!(await hasDispatchSettingsTable())) {
    throw new Error("Run the latest Prisma migration before updating the fare rate.");
  }

  const parsed = updateFareRateSchema.safeParse({
    fareRatePerMile: formData.get("fareRatePerMile"),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid fare rate.");
  }

  const cents = Math.round(parsed.data.fareRatePerMile * 100);
  const currentSettings = await getFareSettings();

  await prisma.dispatchSettings.upsert({
    where: { id: "default" },
    update: {
      fareRatePerMileCents: cents,
    },
    create: {
      id: "default",
      fareRatePerMileCents: cents || currentSettings.fareRatePerMileCents,
    },
  });

  revalidatePath("/admin");
}
