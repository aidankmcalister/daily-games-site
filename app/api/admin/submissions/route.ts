import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getCurrentUser, canManageGames } from "@/lib/auth-helpers";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || !canManageGames(user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const submissions = await prisma.gameSubmission.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { name: true, email: true },
        },
      },
    });

    return NextResponse.json(submissions);
  } catch (error) {
    console.error("Failed to fetch submissions:", error);
    return NextResponse.json(
      { error: "Failed to fetch submissions" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !canManageGames(user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, status, reviewNote } = await request.json();

    if (!id || !status) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const submission = await prisma.gameSubmission.update({
      where: { id },
      data: {
        status,
        reviewNote,
        reviewedAt: new Date(),
        reviewedBy: user.id,
      },
    });

    // If approved, create the game automatically
    if (status === "APPROVED") {
      await prisma.game.create({
        data: {
          title: submission.title,
          link: submission.link,
          topic: submission.topic,
          createdAt: new Date(), // Explicitly set to now
        },
      });
    }

    return NextResponse.json(submission);
  } catch (error) {
    console.error("Failed to update submission:", error);
    return NextResponse.json(
      { error: "Failed to update submission" },
      { status: 500 }
    );
  }
}
