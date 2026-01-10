import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getCurrentUser, canManageGames } from "@/lib/auth-helpers";
import { bulkActionSchema } from "@/lib/validation";
import type { Topic } from "@/app/generated/prisma/client";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !canManageGames(user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const result = bulkActionSchema.safeParse(body);

    if (!result.success) {
      const errorMessage = result.error.issues
        .map((issue) => issue.message)
        .join(", ");
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    const { action, gameIds, data } = result.data;

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
      // Build update object with proper types
      // Only include fields that are defined
      const updateData: {
        topic?: Topic;
        archived?: boolean;
        embedSupported?: boolean;
      } = {};
      if (data.topic !== undefined) updateData.topic = data.topic as Topic;
      if (data.archived !== undefined) updateData.archived = data.archived;
      if (data.embedSupported !== undefined)
        updateData.embedSupported = data.embedSupported;

      await prisma.game.updateMany({
        where: { id: { in: gameIds } },
        data: updateData,
      });
      return NextResponse.json({ success: true, count: gameIds.length });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Bulk action failed:", error);
    return NextResponse.json({ error: "Bulk action failed" }, { status: 500 });
  }
}
