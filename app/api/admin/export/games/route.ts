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

    const games = await prisma.game.findMany({
      orderBy: { createdAt: "desc" },
    });

    const data = JSON.stringify(games, null, 2);
    const filename = `games-export-${format(new Date(), "yyyy-MM-dd")}.json`;

    return new NextResponse(data, {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Failed to export games:", error);
    return NextResponse.json(
      { error: "Failed to export games" },
      { status: 500 }
    );
  }
}
