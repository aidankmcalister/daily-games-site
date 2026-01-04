import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";
import { format } from "date-fns";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "owner" && user.role !== "coowner")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Export users with selected fields only to protect privacy (exclude sessions/passwords)
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        emailVerified: true,
        image: true,
      },
    });

    const data = JSON.stringify(users, null, 2);
    const filename = `users-export-${format(new Date(), "yyyy-MM-dd")}.json`;

    return new NextResponse(data, {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Failed to export users:", error);
    return NextResponse.json(
      { error: "Failed to export users" },
      { status: 500 }
    );
  }
}
