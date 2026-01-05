import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const races = await prisma.race.findMany({
      where: {
        participants: {
          some: {
            userId: user.id,
          },
        },
      },
      include: {
        participants: {
          include: {
            user: true,
            completions: true,
          },
        },
        raceGames: {
          include: {
            game: true,
          },
          orderBy: {
            order: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 20, // Limit to recent 20 races for now
    });

    return NextResponse.json(races);
  } catch (error) {
    console.error("[RACES_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
