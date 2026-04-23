import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

declare global {
  var prisma: PrismaClient | undefined;
}

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("Missing required environment variable: DATABASE_URL");
}

export const prisma =
  globalThis.prisma ??
  (connectionString.startsWith("prisma+postgres://")
    ? new PrismaClient({
        accelerateUrl: connectionString,
        log:
          process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
      })
    : new PrismaClient({
        adapter: new PrismaPg({ connectionString }),
        log:
          process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
      }));

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma;
}
