import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET: Fetch all active preset lists with games
export async function GET() {
  try {
    const presetLists = await prisma.presetList.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
      include: {
        games: {
          select: {
            id: true,
            title: true,
            topic: true,
            link: true,
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
