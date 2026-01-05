import prisma from "@/lib/prisma";
import { GamesClient } from "@/components/features/games/games-client";
import type { Game } from "@/app/generated/prisma/client";

export const revalidate = 60;

export default async function Page() {
  let games: Game[] = [];

  try {
    games = await prisma.game.findMany({
      where: { archived: false },
      orderBy: { title: "asc" },
    });
  } catch {
    // Table may not exist yet
  }

  return (
    <main className="min-h-screen px-4 pt-4 pb-8 md:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        {games.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <h1 className="text-2xl font-bold tracking-tight mb-2">dles.fun</h1>
            <p className="text-lg text-muted-foreground">No games yet.</p>
            <p className="text-sm text-muted-foreground">
              Add a game using the admin tools, or run the seed script.
            </p>
          </div>
        ) : (
          <GamesClient games={games} />
        )}
      </div>
    </main>
  );
}
