import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser, canAccessAdmin } from "@/lib/auth-helpers";

// PATCH: Update a preset list
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user || !canAccessAdmin(user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const { name, color, order, isActive } = body;

    const presetList = await prisma.presetList.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(color !== undefined && { color }),
        ...(order !== undefined && { order }),
        ...(isActive !== undefined && { isActive }),
      },
      include: {
        games: {
          select: {
            id: true,
            title: true,
            topic: true,
          },
        },
      },
    });

    return NextResponse.json(presetList);
  } catch (error) {
    console.error("Failed to update preset list:", error);
    return NextResponse.json(
      { error: "Failed to update preset list" },
      { status: 500 }
    );
  }
}

// DELETE: Delete a preset list
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user || !canAccessAdmin(user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    await prisma.presetList.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete preset list:", error);
    return NextResponse.json(
      { error: "Failed to delete preset list" },
      { status: 500 }
    );
  }
}
