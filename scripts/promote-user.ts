import prisma from "../lib/prisma";
import type { Role } from "../app/generated/prisma/client";

async function main() {
  const email = process.argv[2];
  const role = (process.argv[3] || "owner") as Role;

  if (!email) {
    console.error("Usage: bun run scripts/promote-user.ts <email> [role]");
    process.exit(1);
  }

  try {
    const user = await prisma.user.update({
      where: { email },
      data: { role },
    });

    console.log(
      `✅ Successfully promoted ${user.name} (${user.email}) to ${role}`
    );
  } catch (error) {
    console.error("Error promoting user:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
