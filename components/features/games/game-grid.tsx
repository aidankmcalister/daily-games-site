"use client";

import {
  GameCard,
  type GameCardProps,
} from "@/components/features/games/game-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader } from "@/components/ui/card";
import React, { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface GameGridProps {
  games: Omit<
    GameCardProps,
    "isPlayed" | "onPlay" | "onHide" | "onMarkPlayed" | "onUnmarkPlayed"
  >[];
  playedIds: Set<string>;
  onPlay: (id: string) => void;
  onHide?: (id: string) => void;
  onMarkPlayed?: (id: string) => void;
  onUnmarkPlayed?: (id: string) => void;
  currentPage: number;
  onPageChange: (page: number) => void;
  gamesPerPage?: number;
}

const GRID_CLASSES =
  "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6";

const DEFAULT_GAMES_PER_PAGE = 48;

export const GameGrid = React.memo(function GameGrid({
  games,
  playedIds,
  onPlay,
  onHide,
  onMarkPlayed,
  onUnmarkPlayed,
  currentPage,
  onPageChange,
  gamesPerPage = DEFAULT_GAMES_PER_PAGE,
}: GameGridProps) {
  const totalPages = Math.ceil(games.length / gamesPerPage);

  const paginatedGames = useMemo(() => {
    const start = (currentPage - 1) * gamesPerPage;
    const end = start + gamesPerPage;
    return games.slice(start, end);
  }, [games, currentPage, gamesPerPage]);

  const handlePrevPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="space-y-6">
      <div className={GRID_CLASSES}>
        {paginatedGames.map((game, index) => (
          <GameCard
            key={game.id}
            index={index}
            {...game}
            isPlayed={playedIds.has(game.id)}
            onPlay={onPlay}
            onHide={onHide}
            onMarkPlayed={onMarkPlayed}
            onUnmarkPlayed={onUnmarkPlayed}
          />
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className="gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          <span className="text-sm text-muted-foreground">
            Page{" "}
            <span className="font-semibold text-foreground">{currentPage}</span>{" "}
            of{" "}
            <span className="font-semibold text-foreground">{totalPages}</span>
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="gap-1"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
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
