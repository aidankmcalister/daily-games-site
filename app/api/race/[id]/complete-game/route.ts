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
    const { id: raceId } = await params;
    const body = await req.json();
    const { raceGameId, skipped = false, participantId } = body;

    const race = await prisma.race.findUnique({
      where: { id: raceId },
      include: {
        participants: {
          include: {
            completions: true,
          },
        },
        raceGames: true,
      },
    });

    if (!race || race.status !== "active") {
      return new NextResponse("Race not active", { status: 400 });
    }

    let participant = null;

    if (participantId) {
      participant = race.participants.find((p) => p.id === participantId);
    } else if (user) {
      participant = race.participants.find((p) => p.userId === user.id);
    }

    if (!participant) {
      return new NextResponse("Participant not found", { status: 404 });
    }

    if (participant.userId && (!user || user.id !== participant.userId)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const existingCompletion = participant.completions.find(
      (c) => c.raceGameId === raceGameId
    );
    if (existingCompletion) {
      return new NextResponse("Game already completed", { status: 400 });
    }

    const now = new Date();
    const startTime = race.startedAt!;
    const timeToComplete = Math.floor(
      (now.getTime() - startTime.getTime()) / 1000
    );

    const completion = await prisma.raceCompletion.create({
      data: {
        raceGameId,
        participantId: participant.id,
        completedAt: now,
        timeToComplete,
        skipped,
      },
    });

    const completedGameIds = [
      ...participant.completions.map((c) => c.raceGameId),
      raceGameId,
    ];
    const allGameIds = race.raceGames.map((rg) => rg.id);
    const finishedAll = allGameIds.every((id) => completedGameIds.includes(id));

    let updatedParticipant = participant;
    if (finishedAll) {
      updatedParticipant = (await prisma.raceParticipant.update({
        where: { id: participant.id },
        data: {
          finishedAt: now,
          totalTime: timeToComplete,
        },
        include: {
          completions: true,
        },
      })) as any;
    }

    const allFinished = race.participants.every((p) =>
      p.id === participant.id ? finishedAll : !!p.finishedAt
    );

    if (allFinished) {
      await prisma.race.update({
        where: { id: raceId },
        data: {
          status: "completed",
          completedAt: now,
        },
      });
    }

    await pusherServer.trigger(`race-${raceId}`, "game-completed", {
      userId: participant.userId,
      participantId: participant.id,
      raceGameId,
      timeToComplete,
      skipped,
      finishedAll,
      raceStatus: allFinished ? "completed" : "active",
    });

    return NextResponse.json({ completion, finishedAll });
  } catch (error) {
    console.error("[RACE_COMPLETE_GAME]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
