import { z } from "zod";

export const bookingPayloadSchema = z.object({
  customerName: z.string().trim().min(2, "Full name is required."),
  email: z.email("Enter a valid email address."),
  phone: z.string().trim().min(7, "Phone number is required."),
  pickupAddress: z.string().trim().min(5, "Pickup address is required."),
  dropoffAddress: z.string().trim().min(5, "Dropoff address is required."),
  pickupTime: z.coerce.date().refine((date) => !Number.isNaN(date.getTime()), {
    message: "Pickup date and time is required.",
  }),
  passengers: z.coerce
    .number()
    .int("Passengers must be a whole number.")
    .min(1, "At least one passenger is required.")
    .max(8, "Passenger count is too high for a standard booking."),
  luggage: z.coerce
    .number()
    .int("Luggage must be a whole number.")
    .min(0, "Luggage cannot be negative.")
    .max(12, "Luggage count is too high for a standard booking."),
  paymentMethod: z.enum(["card", "cash"], {
    error: "Select whether this trip will be paid by card or cash.",
  }),
});

export type BookingPayload = z.infer<typeof bookingPayloadSchema>;
