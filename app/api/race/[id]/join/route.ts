import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";
import prisma from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher";
import { cleanText } from "@/lib/filter";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();

    let guestName: string | undefined;
    try {
      const body = await req.json();
      guestName = body.guestName;
    } catch {}

    if (!user && !guestName) {
      return new NextResponse("Must be logged in or provide a guest name", {
        status: 401,
      });
    }

    const { id } = await params;

    const race = await prisma.race.findUnique({
      where: { id },
      include: {
        participants: true,
      },
    });

    if (!race) {
      return new NextResponse("Not Found", { status: 404 });
    }

    if (race.status !== "waiting") {
      return new NextResponse("Race already in progress or completed", {
        status: 400,
      });
    }

    if (race.participants.length >= 2) {
      return new NextResponse("Race is full", { status: 400 });
    }

    if (user) {
      const isAlreadyParticipant = race.participants.some(
        (p) => p.userId === user.id
      );
      if (isAlreadyParticipant) {
        return NextResponse.json(race);
      }
    }

    const updatedRace = await prisma.race.update({
      where: { id },
      data: {
        participants: {
          create: {
            userId: user?.id ?? null,
            guestName: user ? null : guestName ? cleanText(guestName) : null,
          },
        },
        status: "ready", // Both joined, now ready
      },
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
      },
    });

    const newParticipant = updatedRace.participants.find((p) =>
      user ? p.userId === user.id : p.guestName === guestName
    );

    await pusherServer.trigger(`race-${id}`, "player-joined", {
      participant: newParticipant,
      status: "ready",
    });

    return NextResponse.json(updatedRace);
  } catch (error) {
    console.error("[RACE_JOIN]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
