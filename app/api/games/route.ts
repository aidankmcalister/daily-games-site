import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser, canManageGames } from "@/lib/auth-helpers";
import type { Topic } from "@/app/generated/prisma/client";

export const dynamic = "force-dynamic";

// GET all games (public, filtered by default)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const includeArchived = searchParams.get("includeArchived") === "true";

    let where = { archived: false };

    // Allow admins to fetch archived games
    if (includeArchived) {
      const currentUser = await getCurrentUser();
      if (currentUser && canManageGames(currentUser.role)) {
        // @ts-ignore - filtering is optional when admin
        where = {};
      }
    }

    const games = await prisma.game.findMany({
      where,
      orderBy: { title: "asc" },
    });
    return NextResponse.json(games);
  } catch (error) {
    console.error("Failed to fetch games:", error);
    return NextResponse.json(
      { error: "Failed to fetch games" },
      { status: 500 }
    );
  }
}

// POST create new game (admin+ only)
export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !canManageGames(currentUser.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { title, link, topic } = body as {
      title: string;
      link: string;
      topic: Topic;
    };

    if (!title || !link || !topic) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const game = await prisma.game.create({
      data: { title, link, topic },
    });

    return NextResponse.json(game, { status: 201 });
  } catch (error) {
    console.error("Failed to create game:", error);
    return NextResponse.json(
      { error: "Failed to create game" },
      { status: 500 }
    );
  }
}
