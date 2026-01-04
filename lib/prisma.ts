import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = global as unknown as {
  prisma: PrismaClient;
};

// Check if using TCP postgres:// URL or HTTP prisma+postgres:// URL
const databaseUrl = process.env.DATABASE_URL || "";
const isTcpConnection =
  databaseUrl.startsWith("postgres://") ||
  databaseUrl.startsWith("postgresql://");

let prisma: PrismaClient;

if (globalForPrisma.prisma) {
  prisma = globalForPrisma.prisma;
} else if (isTcpConnection) {
  // Use PrismaPg adapter for TCP connections
  const adapter = new PrismaPg({
    connectionString: databaseUrl,
  });
  prisma = new PrismaClient({ adapter });
} else {
  // Use direct PrismaClient for Prisma Postgres HTTP connections
  // PrismaClient requires an adapter for HTTP connections
  const adapter = new PrismaPg({
    connectionString: databaseUrl,
  });
  prisma = new PrismaClient({ adapter });
}

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
