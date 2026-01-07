import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser, canAccessAdmin } from "@/lib/auth-helpers";

// GET: Fetch all preset lists (including inactive) for admin
export async function GET() {
  const user = await getCurrentUser();
  if (!user || !canAccessAdmin(user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const presetLists = await prisma.presetList.findMany({
      orderBy: { order: "asc" },
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

    return NextResponse.json(presetLists);
  } catch (error) {
    console.error("Failed to fetch preset lists:", error);
    return NextResponse.json(
      { error: "Failed to fetch preset lists" },
      { status: 500 }
    );
  }
}

// POST: Create a new preset list
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || !canAccessAdmin(user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, color = "slate", gameIds = [] } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    // Get max order
    const maxOrder = await prisma.presetList.aggregate({
      _max: { order: true },
    });

    const presetList = await prisma.presetList.create({
      data: {
        name: name.trim(),
        color,
        order: (maxOrder._max.order ?? -1) + 1,
        games: {
          connect: gameIds.map((id: string) => ({ id })),
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

    return NextResponse.json(presetList, { status: 201 });
  } catch (error) {
    console.error("Failed to create preset list:", error);
    return NextResponse.json(
      { error: "Failed to create preset list" },
      { status: 500 }
    );
  }
}
