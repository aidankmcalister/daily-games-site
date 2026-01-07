import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser, canAccessAdmin } from "@/lib/auth-helpers";

// POST: Add games to a preset list
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user || !canAccessAdmin(user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const { gameIds } = body;

    if (!Array.isArray(gameIds) || gameIds.length === 0) {
      return NextResponse.json(
        { error: "gameIds array is required" },
        { status: 400 }
      );
    }

    const presetList = await prisma.presetList.update({
      where: { id },
      data: {
        games: {
          connect: gameIds.map((gameId: string) => ({ id: gameId })),
        },
      },
      include: {
        games: {
          select: {
            id: true,
            title: true,
            topic: true,
          },
        },
      },
    });

    return NextResponse.json(presetList);
  } catch (error) {
    console.error("Failed to add games to preset list:", error);
    return NextResponse.json({ error: "Failed to add games" }, { status: 500 });
  }
}

// DELETE: Remove a game from a preset list
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user || !canAccessAdmin(user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const { gameId } = body;

    if (!gameId) {
      return NextResponse.json(
        { error: "gameId is required" },
        { status: 400 }
      );
    }

    const presetList = await prisma.presetList.update({
      where: { id },
      data: {
        games: {
          disconnect: { id: gameId },
        },
      },
      include: {
        games: {
          select: {
            id: true,
            title: true,
            topic: true,
          },
        },
      },
    });

    return NextResponse.json(presetList);
  } catch (error) {
    console.error("Failed to remove game from preset list:", error);
    return NextResponse.json(
      { error: "Failed to remove game" },
      { status: 500 }
    );
  }
}
