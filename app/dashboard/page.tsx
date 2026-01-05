import { getSession } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { DashboardClient } from "./dashboard-client";

export default async function DashboardPage() {
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

  return (
    <DashboardClient
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
    />
  );
}
