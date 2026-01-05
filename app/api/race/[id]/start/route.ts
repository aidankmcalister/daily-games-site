import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";
import prisma from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    const { id } = await params;

    let guestId: string | undefined;
    try {
      const body = await req.json();
      guestId = body.guestId;
    } catch (e) {}

    if (!user && !guestId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const race = await prisma.race.findUnique({
      where: { id },
      include: {
        participants: true,
      },
    });

    if (!race) {
      return new NextResponse("Not Found", { status: 404 });
    }

    if (race.status !== "ready") {
      return new NextResponse("Race not ready to start", { status: 400 });
    }

    let isAuthorized = false;

    if (user) {
      isAuthorized = race.participants.some((p) => p.userId === user.id);
    } else if (guestId) {
      isAuthorized = race.participants.some((p) => p.id === guestId);
    }

    if (!isAuthorized) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const updatedRace = await prisma.race.update({
      where: { id },
      data: {
        status: "active",
        startedAt: new Date(),
      },
    });

    await pusherServer.trigger(`race-${id}`, "race-started", {
      status: "active",
      startedAt: updatedRace.startedAt,
    });

    return NextResponse.json(updatedRace);
  } catch (error) {
    console.error("[RACE_START]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
