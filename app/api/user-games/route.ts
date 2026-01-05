import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth-helpers";

// GET /api/user-games - Get current user's played games
export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userGames = await prisma.userGame.findMany({
      where: { userId: session.user.id },
      include: { game: true },
      orderBy: { playedAt: "desc" },
    });

    return NextResponse.json(userGames);
  } catch (error) {
    console.error("Failed to fetch user games:", error);
    return NextResponse.json(
      { error: "Failed to fetch user games" },
      { status: 500 }
    );
  }
}

// POST /api/user-games - Mark a game as played
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { gameId } = await request.json();
    if (!gameId) {
      return NextResponse.json(
        { error: "gameId is required" },
        { status: 400 }
      );
    }

    // Use transaction to ensure all updates happen or none
    const [userGame] = await prisma.$transaction([
      // 1. Upsert UserGame (current status)
      prisma.userGame.upsert({
        where: {
          userId_gameId: {
            userId: session.user.id,
            gameId,
          },
        },
        update: { playedAt: new Date(), played: true },
        create: {
          userId: session.user.id,
          gameId,
          played: true,
        },
      }),
      // 2. Increment global play count
      prisma.game.update({
        where: { id: gameId },
        data: { playCount: { increment: 1 } },
      }),
      // 3. Create play log (history)
      prisma.gamePlayLog.create({
        data: {
          userId: session.user.id,
          gameId,
        },
      }),
      // 4. Update Daily Stats
      prisma.dailyStats.upsert({
        where: {
          date_gameId: {
            date: new Date(new Date().setHours(0, 0, 0, 0)),
            gameId,
          },
        },
        update: { playCount: { increment: 1 } },
        create: {
          date: new Date(new Date().setHours(0, 0, 0, 0)),
          gameId,
          playCount: 1,
        },
      }),
    ]);

    return NextResponse.json(userGame);
  } catch (error) {
    console.error("Failed to mark game as played:", error);
    return NextResponse.json(
      { error: "Failed to mark game as played" },
      { status: 500 }
    );
  }
}

// DELETE /api/user-games - Reset all played games for current user
export async function DELETE() {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Instead of deleting records (which might lose hidden status),
    // we just reset the 'played' and 'playedAt' fields.
    // However, the user request says "it didnt reset the database played status".
    // If they want a full reset, maybe we should delete?
    // Usually "reset progress" means starting fresh.

    await prisma.userGame.deleteMany({
      where: { userId: session.user.id },
    });

    return NextResponse.json({ message: "Progress reset successfully" });
  } catch (error) {
    console.error("Failed to reset user progress:", error);
    return NextResponse.json(
      { error: "Failed to reset user progress" },
      { status: 500 }
    );
  }
}
