import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const game = await prisma.game.update({
      where: { id },
      data: { playCount: { increment: 1 } },
    });
    return NextResponse.json(game);
  } catch (error) {
    console.error("Failed to update game:", error);
    return NextResponse.json(
      { error: "Failed to update game" },
      { status: 500 }
    );
  }
}
