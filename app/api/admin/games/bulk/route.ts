import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getCurrentUser, canManageGames } from "@/lib/auth-helpers";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !canManageGames(user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { action, gameIds, data } = await request.json();

    if (!gameIds || !Array.isArray(gameIds) || gameIds.length === 0) {
      return NextResponse.json({ error: "No games selected" }, { status: 400 });
    }

    if (action === "archive") {
      await prisma.game.updateMany({
        where: { id: { in: gameIds } },
        data: { archived: true },
      });
      return NextResponse.json({ success: true, count: gameIds.length });
    }

    if (action === "unarchive") {
      await prisma.game.updateMany({
        where: { id: { in: gameIds } },
        data: { archived: false },
      });
      return NextResponse.json({ success: true, count: gameIds.length });
    }

    if (action === "delete") {
      // Owner only for bulk delete? Or same as manage games?
      // Let's stick to manage games permission for now.
      await prisma.game.deleteMany({
        where: { id: { in: gameIds } },
      });
      return NextResponse.json({ success: true, count: gameIds.length });
    }

    if (action === "update") {
      if (!data) {
        return NextResponse.json(
          { error: "No update data provided" },
          { status: 400 }
        );
      }
      await prisma.game.updateMany({
        where: { id: { in: gameIds } },
        data: data,
      });
      return NextResponse.json({ success: true, count: gameIds.length });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Bulk action failed:", error);
    return NextResponse.json({ error: "Bulk action failed" }, { status: 500 });
  }
}
