import prisma from "@/lib/prisma";
import { GamesClient } from "@/components/games-client";
import { UserButton } from "@/components/user-button";
import type { Game } from "@/app/generated/prisma/client";

export const dynamic = "force-dynamic";

export default async function Page() {
  let games: Game[] = [];

  try {
    games = await prisma.game.findMany({
      orderBy: { title: "asc" },
    });
  } catch {
    // Table may not exist yet
  }

  return (
    <main className="min-h-screen px-4 py-8 md:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              Daily Games
            </h1>
            <p className="mt-2 text-muted-foreground">
              Click a game to play. Progress resets at midnight.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <UserButton />
          </div>
        </header>
        {games.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="text-lg text-muted-foreground">No games yet.</p>
            <p className="text-sm text-muted-foreground">
              Add a game using the button above, or run the seed script.
            </p>
          </div>
        ) : (
          <GamesClient games={games} />
        )}
      </div>
    </main>
  );
}
