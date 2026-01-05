"use client";

import {
  GameCard,
  type GameCardProps,
} from "@/components/features/games/game-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardFooter } from "@/components/ui/card";

interface GameGridProps {
  games: Omit<GameCardProps, "isPlayed" | "onPlay" | "onHide">[];
  playedIds: Set<string>;
  onPlay: (id: string) => void;
  onHide?: (id: string) => void;
}

const GRID_CLASSES =
  "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";

export function GameGrid({ games, playedIds, onPlay, onHide }: GameGridProps) {
  return (
    <div className={GRID_CLASSES}>
      {games.map((game, index) => (
        <GameCard
          key={game.id}
          index={index}
          {...game}
          isPlayed={playedIds.has(game.id)}
          onPlay={onPlay}
          onHide={onHide}
        />
      ))}
    </div>
  );
}

export function GameGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className={GRID_CLASSES}>
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </CardHeader>
          <CardFooter className="pt-0">
            <Skeleton className="h-5 w-16 rounded-full" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
