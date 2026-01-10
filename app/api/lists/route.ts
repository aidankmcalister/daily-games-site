import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth-helpers";
import { cleanText } from "@/lib/filter";
import { listSchema } from "@/lib/validation";

// GET /api/lists - Get user's lists
export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const lists = await prisma.gameList.findMany({
      where: { userId: session.user.id },
      include: {
        games: {
          select: { id: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(
      lists.map((l) => ({
        ...l,
        gameCount: l.games.length,
        games: l.games.map((g) => g.id),
      }))
    );
  } catch (error) {
    console.error("Failed to fetch lists:", error);
    return NextResponse.json(
      { error: "Failed to fetch lists" },
      { status: 500 }
    );
  }
}

// POST /api/lists - Create a new list
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const result = listSchema.safeParse(body);

    if (!result.success) {
      const errorMessage = result.error.issues
        .map((issue) => issue.message)
        .join(", ");
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    const { name, color } = result.data;
    const cleanName = cleanText(name);

    const list = await prisma.gameList.create({
      data: {
        userId: session.user.id,
        name: cleanName,
        ...(color && { color }),
      },
    });

    return NextResponse.json({ ...list, games: [] });
  } catch (error) {
    console.error("Failed to create list:", error);
    return NextResponse.json(
      { error: "Failed to create list" },
      { status: 500 }
    );
  }
}
