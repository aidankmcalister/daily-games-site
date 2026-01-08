import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// PATCH /api/games/[id]/embed - Update embedSupported status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { embedSupported } = body;

    if (typeof embedSupported !== "boolean") {
      return NextResponse.json(
        { error: "embedSupported must be a boolean" },
        { status: 400 }
      );
    }

    const game = await prisma.game.update({
      where: { id },
      data: { embedSupported },
      select: { id: true, title: true, embedSupported: true },
    });

    return NextResponse.json(game);
  } catch (error) {
    console.error("Error updating embed support:", error);
    return NextResponse.json(
      { error: "Failed to update embed support" },
      { status: 500 }
    );
  }
}
