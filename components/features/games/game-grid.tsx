"use client";

import {
  GameCard,
  type GameCardProps,
} from "@/components/features/games/game-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader } from "@/components/ui/card";
import React, { useState, useEffect, useMemo } from "react";
import { useInView } from "react-intersection-observer";

interface GameGridProps {
  games: Omit<GameCardProps, "isPlayed" | "onPlay" | "onHide">[];
  playedIds: Set<string>;
  onPlay: (id: string) => void;
  onHide?: (id: string) => void;
}

const GRID_CLASSES =
  "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6";

const INITIAL_BATCH = 48; // Ensure full screen coverage
const LOAD_INCREMENT = 48;
const ROOT_MARGIN = "800px"; // Load well before bottom

export const GameGrid = React.memo(function GameGrid({
  games,
  playedIds,
  onPlay,
  onHide,
}: GameGridProps) {
  const [visibleCount, setVisibleCount] = useState(INITIAL_BATCH);
  const { ref, inView } = useInView({
    rootMargin: ROOT_MARGIN,
  });

  // Reset rendering when the game list changes (filtering)
  useEffect(() => {
    setVisibleCount(INITIAL_BATCH);
  }, [games]);

  // Load more games when sentinel comes into view
  useEffect(() => {
    if (inView) {
      setVisibleCount((prev) => Math.min(prev + LOAD_INCREMENT, games.length));
    }
  }, [inView, games.length]);

  const visibleGames = useMemo(
    () => games.slice(0, visibleCount),
    [games, visibleCount]
  );

  return (
    <div className={GRID_CLASSES}>
      {visibleGames.map((game, index) => (
        <GameCard
          key={game.id}
          index={index % LOAD_INCREMENT}
          {...game}
          isPlayed={playedIds.has(game.id)}
          onPlay={onPlay}
          onHide={onHide}
        />
      ))}

      {/* Sentinel for lazy loading */}
      {visibleCount < games.length && (
        <div
          ref={ref}
          className="col-span-full h-20 w-full opacity-0 pointer-events-none"
          aria-hidden="true"
        />
      )}
    </div>
  );
});

export function GameGridSkeleton({ count = 48 }: { count?: number }) {
  return (
    <div className={`${GRID_CLASSES} animate-in fade-in duration-300`}>
      {Array.from({ length: count }).map((_, i) => (
        <Card
          key={i}
          className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both"
          style={{ animationDelay: `${i * 30}ms`, animationDuration: "300ms" }}
        >
          <CardHeader className="p-1.5">
            <div className="space-y-0.5">
              <Skeleton className="h-3 w-3/4" />
              <Skeleton className="h-2 w-1/2" />
            </div>
            <div className="pt-1.5">
              <Skeleton className="h-3 w-10 rounded-full" />
            </div>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}
