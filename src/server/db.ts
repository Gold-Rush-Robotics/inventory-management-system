import { env } from "@/env";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { PrismaClient } from "../../generated/prisma/client";

const createPrismaClient = (pool: pg.Pool) =>
  new PrismaClient({
    adapter: new PrismaPg(pool),
    log:
      env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

const globalForPrisma = globalThis as unknown as {
  pool: pg.Pool | undefined;
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

const pool =
  globalForPrisma.pool ??
  new pg.Pool({
    connectionString: env.DATABASE_URL,
  });

export const db = globalForPrisma.prisma ?? createPrismaClient(pool);

if (env.NODE_ENV !== "production") {
  globalForPrisma.pool = pool;
  globalForPrisma.prisma = db;
}
