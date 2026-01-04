"use client";

import { useState, useEffect, useMemo } from "react";
import { GameGrid, GameGridSkeleton } from "@/components/game-grid";
import { GamesHeader } from "@/components/games-header";
import type { Game } from "@/app/generated/prisma/client";
import { getPlayedIds, savePlayedIds, isNewDay } from "@/lib/played-state";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

type SortOption = "title" | "topic" | "played";

export function GamesClient({ games: initialGames }: { games: Game[] }) {
  const [games, setGames] = useState<Game[]>(initialGames);
  const [playedIds, setPlayedIds] = useState<Set<string>>(new Set());
  const [isLoaded, setIsLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("title");
  const [topicFilter, setTopicFilter] = useState("all");

  useEffect(() => {
    setPlayedIds(getPlayedIds());
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (isNewDay()) setPlayedIds(new Set());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const handlePlay = (id: string) => {
    setPlayedIds((prev) => {
      const next = new Set(prev).add(id);
      savePlayedIds(next);
      return next;
    });

    const gameIndex = games.findIndex((g) => g.id === id);
    if (gameIndex !== -1) {
      const game = games[gameIndex];

      // Optimistic update
      const updatedGames = [...games];
      updatedGames[gameIndex] = {
        ...game,
        playCount: (game.playCount || 0) + 1,
      };
      setGames(updatedGames);

      // API call
      fetch(`/api/games/${id}/play`, { method: "PATCH" }).catch((err) => {
        console.error("Failed to update play count:", err);
        // Revert on failure (optional, but good practice. For now keeping simple)
      });

      toast.success("Game played", {
        description: `Marked ${game.title} as played.`,
      });
    }
  };

  const handleClear = () => {
    setPlayedIds(new Set());
    savePlayedIds(new Set());
    toast.success("Progress reset", {
      description: "All daily progress has been cleared.",
    });
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setTopicFilter("all");
    setSortBy("title");
  };

  const filteredGames = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return games
      .filter(
        (g) =>
          (topicFilter === "all" || g.topic === topicFilter) &&
          (query === "" ||
            g.title.toLowerCase().includes(query) ||
            g.topic.toLowerCase().includes(query))
      )
      .sort((a, b) => {
        if (sortBy === "topic")
          return (
            a.topic.localeCompare(b.topic) || a.title.localeCompare(b.title)
          );
        if (sortBy === "played")
          return (
            (playedIds.has(a.id) ? 1 : 0) - (playedIds.has(b.id) ? 1 : 0) ||
            a.title.localeCompare(b.title)
          );
        return a.title.localeCompare(b.title);
      });
  }, [games, searchQuery, topicFilter, sortBy, playedIds]);

  if (!isLoaded) return <GameGridSkeleton count={games.length} />;

  return (
    <div className="space-y-6">
      <GamesHeader
        playedCount={playedIds.size}
        totalCount={games.length}
        filteredCount={filteredGames.length}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        topicFilter={topicFilter}
        onTopicFilterChange={setTopicFilter}
        sortBy={sortBy}
        onSortChange={setSortBy}
        onClear={handleClear}
      />

      {filteredGames.length > 0 ? (
        <GameGrid
          games={filteredGames.map((g) => ({
            id: g.id,
            title: g.title,
            link: g.link,
            topic: g.topic,
            playCount: g.playCount || 0,
          }))}
          playedIds={playedIds}
          onPlay={handlePlay}
        />
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="bg-muted/50 rounded-full p-4 mb-4">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">No games found</h3>
          <p className="text-muted-foreground mt-2 max-w-sm">
            We couldn't find any games matching your current search and filters.
          </p>
          <Button
            variant="outline"
            className="mt-6"
            onClick={handleClearFilters}
          >
            Clear all filters
          </Button>
        </div>
      )}
    </div>
  );
}
