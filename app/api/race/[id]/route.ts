import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";
import prisma from "@/lib/prisma";
import { z } from "zod";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // No auth required - allow guests to view races
    const { id } = await params;

    const race = await prisma.race.findUnique({
      where: { id },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
            completions: true,
          },
        },
        raceGames: {
          include: {
            game: true,
            completions: true,
          },
          orderBy: {
            order: "asc",
          },
        },
      },
    });

    if (!race) {
      return new NextResponse("Not Found", { status: 404 });
    }

    return NextResponse.json(race);
  } catch (error) {
    console.error("[RACE_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

const updateRaceSchema = z.object({
  gameIds: z.array(z.string()),
  guestId: z.string().optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    const { id } = await params;
    const body = await req.json();
    const { gameIds, guestId } = updateRaceSchema.parse(body);

    const race = await prisma.race.findUnique({
      where: { id },
      include: {
        participants: {
          orderBy: { joinedAt: "asc" },
        },
        raceGames: true,
      },
    });

    if (!race) {
      return new NextResponse("Not Found", { status: 404 });
    }

    let isAuthorized = false;

    if (race.createdBy) {
      if (user && user.id === race.createdBy) {
        isAuthorized = true;
      }
    } else {
      const hostParticipant = race.participants[0];
      if (hostParticipant && guestId === hostParticipant.id) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const validGameIds = new Set(race.raceGames.map((rg) => rg.id));
    const allValid = gameIds.every((id: string) => validGameIds.has(id));

    if (!allValid || gameIds.length !== race.raceGames.length) {
      return new NextResponse("Invalid game IDs", { status: 400 });
    }

    await prisma.$transaction(
      gameIds.map((gameId: string, index: number) =>
        prisma.raceGame.update({
          where: { id: gameId },
          data: { order: index },
        })
      )
    );

    // Trigger Pusher update if needed in future
    return NextResponse.json({ success: true });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.issues), { status: 400 });
    }
    console.error("[RACE_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
