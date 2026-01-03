"use client";

import { useState, useEffect, useMemo } from "react";
import { GameGrid, GameGridSkeleton } from "@/components/game-grid";
import { GamesHeader } from "@/components/games-header";
import type { Game } from "@/app/generated/prisma/client";
import { getPlayedIds, savePlayedIds, isNewDay } from "@/lib/played-state";

type SortOption = "title" | "topic" | "played";

export function GamesClient({ games }: { games: Game[] }) {
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
  };

  const handleClear = () => {
    setPlayedIds(new Set());
    savePlayedIds(new Set());
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
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        topicFilter={topicFilter}
        onTopicFilterChange={setTopicFilter}
        sortBy={sortBy}
        onSortChange={setSortBy}
        onClear={handleClear}
      />

      {(searchQuery || topicFilter !== "all") && (
        <p className="text-sm text-muted-foreground">
          Showing {filteredGames.length} of {games.length} games
        </p>
      )}

      {filteredGames.length > 0 ? (
        <GameGrid
          games={filteredGames.map((g) => ({
            id: g.id,
            title: g.title,
            link: g.link,
            topic: g.topic,
          }))}
          playedIds={playedIds}
          onPlay={handlePlay}
        />
      ) : (
        <div className="py-12 text-center text-muted-foreground">
          No games found matching your criteria.
        </div>
      )}
    </div>
  );
}
