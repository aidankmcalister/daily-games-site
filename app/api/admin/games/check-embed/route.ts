import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// POST /api/admin/games/check-embed - Check all games for iframe compatibility
export async function POST() {
  try {
    // Check admin auth
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all games that are currently marked as embedSupported
    const games = await prisma.game.findMany({
      where: { archived: false },
      select: { id: true, link: true, title: true, embedSupported: true },
    });

    const results: {
      checked: number;
      blocked: number;
      allowed: number;
      errors: number;
      details: Array<{ id: string; title: string; status: string }>;
    } = {
      checked: 0,
      blocked: 0,
      allowed: 0,
      errors: 0,
      details: [],
    };

    // Check each game URL
    for (const game of games) {
      results.checked++;

      try {
        // Fetch just the headers (HEAD request)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

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
          // Check for frame-ancestors 'none' or frame-ancestors 'self'
          if (
            csp.includes("frame-ancestors 'none'") ||
            csp.includes("frame-ancestors 'self'") ||
            (csp.includes("frame-ancestors") &&
              !csp.includes("frame-ancestors *"))
          ) {
            // If frame-ancestors is set and doesn't include *, it likely blocks us
            // This is a simplified check; real CSP parsing is complex
            isBlocked = true;
          }
        }

        // Update the database
        if (isBlocked && game.embedSupported !== false) {
          await prisma.game.update({
            where: { id: game.id },
            data: { embedSupported: false },
          });
          results.blocked++;
          results.details.push({
            id: game.id,
            title: game.title,
            status: "blocked",
          });
        } else if (!isBlocked && game.embedSupported === false) {
          // Site is now embeddable - update to true
          await prisma.game.update({
            where: { id: game.id },
            data: { embedSupported: true },
          });
          results.allowed++;
          results.details.push({
            id: game.id,
            title: game.title,
            status: "now_allowed",
          });
        } else if (!isBlocked) {
          results.allowed++;
        } else {
          results.blocked++;
        }
      } catch (error) {
        // Network error, timeout, or other issue
        results.errors++;
        results.details.push({
          id: game.id,
          title: game.title,
          status: `error: ${
            error instanceof Error ? error.message : "unknown"
          }`,
        });
      }
    }

    return NextResponse.json({
      success: true,
      results,
    });
  } catch (error) {
    console.error("Error checking embed support:", error);
    return NextResponse.json(
      { error: "Failed to check embed support" },
      { status: 500 }
    );
  }
}
