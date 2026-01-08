import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// POST /api/admin/games/check-embed/[id] - Check single game for iframe compatibility
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check admin auth
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Get the game
    const game = await prisma.game.findUnique({
      where: { id },
      select: { id: true, link: true, embedSupported: true },
    });

    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    // Fetch headers from the game URL
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
      const response = await fetch(game.link, {
        method: "HEAD",
        signal: controller.signal,
        redirect: "follow",
      });

      clearTimeout(timeoutId);

      // Check X-Frame-Options header
      const xFrameOptions = response.headers.get("x-frame-options");
      const csp = response.headers.get("content-security-policy");

      let isBlocked = false;

      // X-Frame-Options: DENY or SAMEORIGIN blocks embedding
      if (xFrameOptions) {
        const value = xFrameOptions.toLowerCase();
        if (value === "deny" || value === "sameorigin") {
          isBlocked = true;
        }
      }

      // CSP frame-ancestors directive can also block embedding
      if (csp) {
        if (
          csp.includes("frame-ancestors 'none'") ||
          csp.includes("frame-ancestors 'self'") ||
          (csp.includes("frame-ancestors") &&
            !csp.includes("frame-ancestors *"))
        ) {
          isBlocked = true;
        }
      }

      // Update the database if status changed
      if (isBlocked !== !game.embedSupported) {
        await prisma.game.update({
          where: { id: game.id },
          data: { embedSupported: !isBlocked },
        });
      }

      return NextResponse.json({
        id: game.id,
        blocked: isBlocked,
        xFrameOptions,
        csp: csp ? "present" : null,
      });
    } catch (fetchError) {
      clearTimeout(timeoutId);
      return NextResponse.json({
        id: game.id,
        blocked: false,
        error:
          fetchError instanceof Error ? fetchError.message : "fetch failed",
      });
    }
  } catch (error) {
    console.error("Error checking embed support:", error);
    return NextResponse.json(
      { error: "Failed to check embed support" },
      { status: 500 }
    );
  }
}
