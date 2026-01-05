import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = global as unknown as {
  prisma: PrismaClient;
  pool: Pool;
};

const databaseUrl = process.env.DATABASE_URL || "";

let prisma: PrismaClient;

if (globalForPrisma.prisma) {
  prisma = globalForPrisma.prisma;
} else {
  // Create a pg Pool for the adapter
  const pool =
    globalForPrisma.pool || new Pool({ connectionString: databaseUrl });
  globalForPrisma.pool = pool;

  // Use PrismaPg adapter with the Pool
  const adapter = new PrismaPg(pool);
  prisma = new PrismaClient({ adapter });
}

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
