import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth-helpers";
import { startOfYear, subYears, format, getDay, getHours } from "date-fns";

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const oneYearAgo = subYears(new Date(), 1);

    // Fetch all logs for the last year
    const logs = await prisma.gamePlayLog.findMany({
      where: {
        userId,
        playedAt: {
          gte: oneYearAgo,
        },
      },
      select: { playedAt: true },
    });

    // 1. Heatmap Data
    // Group by date (YYYY-MM-DD) -> count
    const heatmap: Record<string, number> = {};
    logs.forEach((log) => {
      const date = format(log.playedAt, "yyyy-MM-dd");
      heatmap[date] = (heatmap[date] || 0) + 1;
    });

    // 2. Insights
    const dayCounts = [0, 0, 0, 0, 0, 0, 0]; // Sun-Sat
    const hourCounts = new Array(24).fill(0);

    logs.forEach((log) => {
      const day = getDay(log.playedAt);
      const hour = getHours(log.playedAt);
      dayCounts[day]++;
      hourCounts[hour]++;
    });

    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    // Busiest Day
    let maxDayIndex = 0;
    dayCounts.forEach((count, idx) => {
      if (count > dayCounts[maxDayIndex]) maxDayIndex = idx;
    });
    const busiestDay = days[maxDayIndex];

    // Favorite Time
    let maxHourIndex = 0;
    hourCounts.forEach((count, idx) => {
      if (count > hourCounts[maxHourIndex]) maxHourIndex = idx;
    });
    const favoriteTime = `${maxHourIndex}:00`;

    // Completion Rate (Needs UserGame vs Game count? Or distinct games played?)
    // "You complete 85% of games you start".
    // "Start" isn't tracked. We only track "Play".
    // Maybe "Played / Total Games"?
    // Or "You've played X unique games".
    const uniqueGamesPlayed = await prisma.userGame.count({
      where: { userId, played: true },
    });
    const totalGames = await prisma.game.count({ where: { archived: false } });
    const completionRate =
      totalGames > 0 ? Math.round((uniqueGamesPlayed / totalGames) * 100) : 0;

    const insights = {
      totalPlays: logs.length,
      busiestDay,
      favoriteTime,
      completionRate,
      uniqueGamesPlayed,
    };

    return NextResponse.json({ heatmap, insights });
  } catch (error) {
    console.error("Failed to fetch enhanced stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch enhanced stats" },
      { status: 500 }
    );
  }
}
