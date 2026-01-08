"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import {
  GameGrid,
  GameGridSkeleton,
} from "@/components/features/games/game-grid";
import { GamesHeader } from "@/components/features/games/games-header";
import { GameModal } from "@/components/features/games/game-modal";
import type { Game } from "@/app/generated/prisma/client";
import { usePlayedGames } from "@/lib/use-played-games";
import { useLists } from "@/lib/use-lists";
import { useStats } from "@/lib/stats-context";
import { Skeleton } from "@/components/ui/skeleton";

import { toast } from "sonner";
import { DlesButton } from "@/components/design/dles-button";
import { Search } from "lucide-react";
import { useInView } from "react-intersection-observer";

import dynamic from "next/dynamic";

const FeelingLuckyModal = dynamic(
  () =>
    import("@/components/feeling-lucky-modal").then(
      (mod) => mod.FeelingLuckyModal
    ),
  {
    ssr: false,
  }
);

type SortOption = "title" | "topic" | "played" | "playCount";

export function GamesClient({
  games: initialGames,
  newGameMinutes = 10080,
}: {
  games: Game[];
  newGameMinutes?: number;
}) {
  const [games, setGames] = useState<Game[]>(initialGames);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("playCount");
  const [topicFilter, setTopicFilter] = useState<string[]>([]);
  const [listFilter, setListFilter] = useState("all");
  const [showHidden, setShowHidden] = useState(false);
  const [embedOnly, setEmbedOnly] = useState(false);
  const [isLuckyModalOpen, setIsLuckyModalOpen] = useState(false);
  const [openGame, setOpenGame] = useState<Game | null>(null);

  const { lists } = useLists();
  const { setStats } = useStats();

  const gameIds = useMemo(() => games.map((g) => g.id), [games]);

  const {
    playedIds,
    hiddenIds,
    currentStreak,
    isLoading: isStatsLoading,
    isAuthenticated,
    markAsPlayed,
    toggleHidden,
    syncFromLocalStorage,
    clearLocalPlayed,
  } = usePlayedGames(gameIds);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (e.key === "/") {
        e.preventDefault();
        const searchInput = document.getElementById("search-input-main");
        searchInput?.focus();
      }

      if (e.key.toLowerCase() === "l") {
        e.preventDefault();
        setIsLuckyModalOpen(true);
      }

      // Grid Navigation & Actions
      const activeEl = document.activeElement as HTMLElement;
      const isGameCard = activeEl?.dataset?.gameCard === "true";

      if (isGameCard) {
        const gameId = activeEl.dataset.gameId;

        if (e.key === "h" || e.key === "H") {
          e.preventDefault();
          if (gameId) handleHide(gameId);
        }

        if (e.key === "p" || e.key === "P") {
          e.preventDefault();
          if (gameId) handlePlay(gameId);
        }

        if (
          gameId &&
          ["ArrowRight", "ArrowLeft", "ArrowDown", "ArrowUp"].includes(e.key)
        ) {
          e.preventDefault();
          const cards = Array.from(
            document.querySelectorAll('[data-game-card="true"]')
          ) as HTMLElement[];
          const currentIndex = cards.indexOf(activeEl);
          if (currentIndex === -1) return;

          let targetIndex = currentIndex;
          const colCount = getGridColumnCount(cards);

          if (e.key === "ArrowRight") targetIndex = currentIndex + 1;
          if (e.key === "ArrowLeft") targetIndex = currentIndex - 1;
          if (e.key === "ArrowDown") targetIndex = currentIndex + colCount;
          if (e.key === "ArrowUp") targetIndex = currentIndex - colCount;

          if (targetIndex >= 0 && targetIndex < cards.length) {
            cards[targetIndex].focus();
          }
        }
      }
    };

    // Helper to determine grid columns dynamically
    const getGridColumnCount = (cards: HTMLElement[]) => {
      if (cards.length < 2) return 1;
      const firstTop = cards[0].getBoundingClientRect().top;
      // Find first card that is on a different row
      const firstNextRow = cards.find(
        (c) => c.getBoundingClientRect().top > firstTop + 10 // +10 fuzziness
      );
      if (!firstNextRow) return cards.length; // All in one row
      return cards.indexOf(firstNextRow);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Sync localStorage to server on sign-in
  useEffect(() => {
    if (isAuthenticated && !isStatsLoading) {
      syncFromLocalStorage();
    }
  }, [isAuthenticated, isStatsLoading, syncFromLocalStorage]);

  // Populate global header stats
  useEffect(() => {
    if (!isStatsLoading) {
      setStats({
        playedCount: playedIds.size,
        totalCount: Math.max(0, games.length - hiddenIds.size),
        currentStreak,
        onClear: handleClear,
        isAuthenticated,
      });
    }
    return () => setStats(null);
  }, [
    playedIds.size,
    games.length,
    hiddenIds.size,
    currentStreak,
    isAuthenticated,
    isStatsLoading,
    setStats,
  ]);

  const handlePlay = async (id: string) => {
    const gameIndex = games.findIndex((g) => g.id === id);
    if (gameIndex === -1) return;

    const game = games[gameIndex];

    // Check if game supports embedding
    if (game.embedSupported === false) {
      // Open directly in new tab for unsupported games
      await markAsPlayed(id);
      window.open(game.link, "_blank", "noopener,noreferrer");

      // Optimistic update for play count
      const updatedGames = [...games];
      updatedGames[gameIndex] = {
        ...game,
        playCount: (game.playCount || 0) + 1,
      };
      setGames(updatedGames);

      toast.success("Game played", {
        description: `Marked ${game.title} as played.`,
      });
    } else {
      // Open in modal for supported games
      setOpenGame(game);
    }
  };

  const handleModalPlay = async (id: string) => {
    await markAsPlayed(id);

    const gameIndex = games.findIndex((g) => g.id === id);
    if (gameIndex !== -1) {
      const game = games[gameIndex];

      // Optimistic update for play count
      const updatedGames = [...games];
      updatedGames[gameIndex] = {
        ...game,
        playCount: (game.playCount || 0) + 1,
      };
      setGames(updatedGames);
    }
  };

  const handleMarkUnsupported = useCallback(async (id: string) => {
    try {
      await fetch(`/api/games/${id}/embed`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ embedSupported: false }),
      });

      // Update local state
      setGames((prev) =>
        prev.map((g) => (g.id === id ? { ...g, embedSupported: false } : g))
      );
    } catch (error) {
      console.error("Failed to mark game as unsupported:", error);
    }
  }, []);

  const handleHide = async (id: string) => {
    const isCurrentlyHidden = hiddenIds.has(id);
    await toggleHidden(id, !isCurrentlyHidden);
    const game = games.find((g) => g.id === id);
    if (game) {
      toast.success(isCurrentlyHidden ? "Game unhidden" : "Game hidden", {
        description: `${game.title} is now ${
          isCurrentlyHidden ? "visible" : "hidden"
        }.`,
      });
    }
  };

  const handleClear = () => {
    clearLocalPlayed();
    toast.success("Progress reset", {
      description: "All daily progress has been cleared.",
    });
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setTopicFilter([]);
    setListFilter("all");
    setSortBy("playCount");
    setEmbedOnly(false);
  };

  const handleRandomGame = () => {
    setIsLuckyModalOpen(true);
  };

  // Client-side filtering
  const filteredGames = useMemo(() => {
    const query = searchQuery.toLowerCase();
    const activeTopics =
      topicFilter.length === 0 || topicFilter.includes("all")
        ? []
        : topicFilter;

    return games
      .filter((g) => {
        // Hide games if not showing hidden
        if (!showHidden && hiddenIds.has(g.id)) return false;

        // Filter by list
        if (listFilter !== "all" && lists.length > 0) {
          const list = lists.find((l) => l.id === listFilter);
          if (list && !list.games.includes(g.id)) {
            return false;
          }
        }

        // Filter by topic
        if (activeTopics.length > 0 && !activeTopics.includes(g.topic)) {
          return false;
        }

        // Filter by embed support
        if (embedOnly && g.embedSupported === false) {
          return false;
        }

        return (
          query === "" ||
          g.title.toLowerCase().includes(query) ||
          g.topic.toLowerCase().includes(query)
        );
      })
      .sort((a, b) => {
        if (sortBy === "playCount") {
          return (
            (b.playCount || 0) - (a.playCount || 0) ||
            a.title.localeCompare(b.title)
          );
        }
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
  }, [
    games,
    searchQuery,
    topicFilter,
    listFilter,
    lists,
    sortBy,
    playedIds,
    hiddenIds,
    showHidden,
    embedOnly,
  ]);

  const mappedGames = useMemo(
    () =>
      filteredGames.map((g) => ({
        id: g.id,
        title: g.title,
        link: g.link,
        topic: g.topic,
        playCount: g.playCount || 0,
        createdAt: g.createdAt,
        newGameMinutes,
        embedSupported: g.embedSupported,
      })),
    [filteredGames, newGameMinutes]
  );

  return (
    <div className="space-y-6">
      <GamesHeader
        playedCount={playedIds.size}
        totalCount={Math.max(0, games.length - hiddenIds.size)}
        filteredCount={filteredGames.length}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        topicFilter={topicFilter}
        onTopicFilterChange={setTopicFilter}
        listFilter={listFilter}
        onListFilterChange={setListFilter}
        lists={lists}
        sortBy={sortBy}
        onSortChange={setSortBy}
        onClear={handleClear}
        onRandom={handleRandomGame}
        currentStreak={currentStreak}
        showHidden={showHidden}
        onShowHiddenChange={setShowHidden}
        hiddenCount={hiddenIds.size}
        isAuthenticated={isAuthenticated}
        embedOnly={embedOnly}
        onEmbedOnlyChange={setEmbedOnly}
      />

      <FeelingLuckyModal
        open={isLuckyModalOpen}
        onOpenChange={setIsLuckyModalOpen}
        games={games}
        playedIds={playedIds}
        onPlay={handlePlay}
      />

      <GameModal
        game={openGame}
        open={openGame !== null}
        onOpenChange={(open) => !open && setOpenGame(null)}
        onMarkPlayed={handleModalPlay}
        onMarkUnsupported={handleMarkUnsupported}
      />

      {filteredGames.length > 0 ? (
        <GameGrid
          key={topicFilter.join(",")}
          games={mappedGames}
          playedIds={playedIds}
          onPlay={handlePlay}
          onHide={isAuthenticated ? handleHide : undefined}
        />
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="bg-muted/50 rounded-full p-4 mb-4">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-heading-section">No games found</h3>
          <p className="text-body text-muted-foreground mt-2 max-w-sm">
            We couldn't find any games matching your current search and filters.
          </p>
          <DlesButton
            variant="outline"
            className="mt-6"
            onClick={handleClearFilters}
          >
            Clear all filters
          </DlesButton>
        </div>
      )}
    </div>
  );
}
