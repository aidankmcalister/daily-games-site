import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";
import prisma from "@/lib/prisma";
import { z } from "zod";

const createRaceSchema = z.object({
  name: z.string().min(1).max(50),
  gameIds: z.array(z.string()).min(1),
  guestName: z.string().min(1).max(30).optional(),
});

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();

    const body = await req.json();
    const { name, gameIds, guestName } = createRaceSchema.parse(body);

    // Either authenticated user or guest with name
    if (!user && !guestName) {
      return new NextResponse("Must be logged in or provide a guest name", {
        status: 401,
      });
    }

    const race = await prisma.race.create({
      data: {
        name,
        createdBy: user?.id || null,
        status: "waiting",
        participants: {
          create: {
            userId: user?.id ?? null,
            guestName: user ? null : guestName,
          },
        },
        raceGames: {
          create: gameIds.map((gameId, index) => ({
            gameId,
            order: index,
          })),
        },
      },
      include: {
        participants: true,
        raceGames: true,
      },
    });

    return NextResponse.json(race);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.issues), { status: 400 });
    }
    console.error("[RACE_CREATE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
