import { getSession } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { RaceStatsClient } from "@/app/race/stats/race-stats-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Race Stats",
  description: "View your race history, wins, and statistics on dles.fun.",
};

export default async function RaceStatsPage() {
  const session = await getSession();

  if (!session?.user?.id) {
    redirect("/");
  }

  // Get start of today in server time
  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );

  // Fetch user's played games (explicitly check for played: true AND played today AND NOT hidden)
  const userGames = await prisma.userGame.findMany({
    where: {
      userId: session.user.id,
      played: true,
      hidden: false,
      playedAt: {
        gte: startOfToday,
      },
    },
    include: { game: true },
    orderBy: { playedAt: "desc" },
  });

  // Fetch hidden games
  const hiddenGames = await prisma.userGame.findMany({
    where: { userId: session.user.id, hidden: true },
    include: { game: true },
    orderBy: { playedAt: "desc" },
  });

  // Total unarchived games
  const totalUnarchivedGames = await prisma.game.count({
    where: { archived: false },
  });

  // Calculate total games for this user (excluding hidden ones)
  const totalGames = Math.max(0, totalUnarchivedGames - hiddenGames.length);

  // Calculate stats
  const playedDates = userGames.map((ug) => ug.playedAt);
  const categoryCount: Record<string, number> = {};

  userGames.forEach((ug) => {
    const topic = ug.game.topic;
    categoryCount[topic] = (categoryCount[topic] || 0) + 1;
  });

  // Fetch completed races for stats
  const races = await prisma.race.findMany({
    where: {
      participants: {
        some: { userId: session.user.id },
      },
      status: "completed",
    },
    include: {
      participants: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          completions: true,
        },
      },
      raceGames: {
        include: {
          game: {
            select: {
              id: true,
              title: true,
              topic: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <RaceStatsClient
      playedCount={userGames.length}
      totalGames={totalGames}
      playedDates={playedDates.map((d) => d.toISOString())}
      categoryData={Object.entries(categoryCount).map(([name, count]) => ({
        name,
        count,
      }))}
      hiddenGames={hiddenGames.map((ug) => ({
        id: ug.game.id,
        title: ug.game.title,
        topic: ug.game.topic,
      }))}
      races={JSON.parse(JSON.stringify(races))}
    />
  );
}
