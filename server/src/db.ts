import "dotenv/config";
import { PrismaClient } from "./generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

// One shared PrismaClient for the whole app.
//
// A PrismaClient manages database access, so we want exactly one instance — not a
// fresh one per request. In development `tsx watch` re-runs this module on every
// file save; caching the client on `globalThis` lets it survive those reloads
// instead of leaking a new client (and new connections) each time.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createPrisma(): PrismaClient {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set — check server/.env");
  }
  // Prisma 7 removed the bundled query engine: the client now talks to the
  // database through a "driver adapter". better-sqlite3 is a fast, synchronous
  // SQLite driver, and this adapter lets Prisma use it.
  const adapter = new PrismaBetterSqlite3({ url });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrisma();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
