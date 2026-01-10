import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser, canManageGames } from "@/lib/auth-helpers";
import type { Topic, Prisma } from "@/app/generated/prisma/client";
import { gameSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

// GET all games (public, filtered by default)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const includeArchived = searchParams.get("includeArchived") === "true";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const search = searchParams.get("search") || "";
    const topic = searchParams.get("topic") || "";
    const sortBy = searchParams.get("sortBy") || "title";
    const sortOrder =
      (searchParams.get("sortOrder") as "asc" | "desc") || "asc";

    const where: Prisma.GameWhereInput = {};

    // Archival check
    if (!includeArchived) {
      where.archived = false;
    } else {
      const currentUser = await getCurrentUser();
      if (!currentUser || !canManageGames(currentUser.role)) {
        where.archived = false;
      }
    }

    // Search filter
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    // Topic filter
    if (topic && topic !== "all") {
      // Handle multiple topics - cast to Topic enum array
      const topics = topic.split(",").filter(Boolean) as Topic[];
      if (topics.length > 0) {
        where.topic = { in: topics };
      }
    }

    // Determine sort
    let orderBy: Prisma.GameOrderByWithRelationInput = {};
    if (sortBy === "topic") {
      orderBy = { topic: sortOrder };
    } else if (sortBy === "playCount") {
      orderBy = { playCount: sortOrder };
    } else if (sortBy === "createdAt") {
      orderBy = { createdAt: sortOrder };
    } else {
      orderBy = { title: sortOrder };
    }

    // Get total count for pagination meta
    const total = await prisma.game.count({ where });

    // Fetch games
    const games = await prisma.game.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    });

    return NextResponse.json({
      items: games,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
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
    const result = gameSchema.safeParse(body);

    if (!result.success) {
      const errorMessage = result.error.issues
        .map((issue) => issue.message)
        .join(", ");
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    const { title, link, topic, description } = result.data;

    const game = await prisma.game.create({
      data: { title, link, topic: topic as Topic, description },
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
