import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getSession, getCurrentUser } from "@/lib/auth-helpers";

// GET /api/settings - Get site config
export async function GET() {
  try {
    // Get or create default config
    let config = await prisma.siteConfig.findUnique({
      where: { id: "default" },
    });

    if (!config) {
      config = await prisma.siteConfig.create({
        data: { id: "default" },
      });
    }

    return NextResponse.json(config);
  } catch (error) {
    console.error("Failed to fetch settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

// PATCH /api/settings - Update site config (owner/coowner only)
export async function PATCH(request: Request) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getCurrentUser();
    if (!user || !["owner", "coowner"].includes(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updates = await request.json();

    // Sanitize input - only allow specific fields
    const allowedFields = [
      "newGameMinutes",
      "topicColors",
      "maintenanceMode",
      "welcomeMessage",
      "showWelcomeMessage",
      "featuredGameIds",
      "minPlayStreak",
      "enableCommunitySubmissions",
      "defaultSort",
      "maxCustomLists",
      "showPresetLists",
      "maxSubmissionsPerDay",
      "enableLeaderboards",
    ];

    const sanitizedUpdates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        sanitizedUpdates[key] = value;
      }
    }

    const config = await prisma.siteConfig.upsert({
      where: { id: "default" },
      update: sanitizedUpdates,
      create: {
        id: "default",
        ...sanitizedUpdates,
      },
    });

    return NextResponse.json(config);
  } catch (error) {
    console.error("Failed to update settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
