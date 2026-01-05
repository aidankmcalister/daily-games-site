"use client";

import { useState, useMemo, useEffect } from "react";
import { GameGrid, GameGridSkeleton } from "@/components/game-grid";
import { GamesHeader } from "@/components/games-header";
import type { Game } from "@/app/generated/prisma/client";
import { usePlayedGames } from "@/lib/use-played-games";
import { useLists } from "@/lib/use-lists";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

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

const GuestSyncBanner = dynamic(
  () =>
    import("@/components/guest-sync-banner").then((mod) => mod.GuestSyncBanner),
  {
    ssr: false,
  }
);

type SortOption = "title" | "topic" | "played";

export function GamesClient({ games: initialGames }: { games: Game[] }) {
  const [games, setGames] = useState<Game[]>(initialGames);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("title");
  const [topicFilter, setTopicFilter] = useState("all");
  const [listFilter, setListFilter] = useState("all");
  const [showHidden, setShowHidden] = useState(false);
  const [isLuckyModalOpen, setIsLuckyModalOpen] = useState(false);

  const { lists } = useLists();

  const gameIds = useMemo(() => games.map((g) => g.id), [games]);

  const {
    playedIds,
    hiddenIds,
    currentStreak,
    isLoading,
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
    if (isAuthenticated && !isLoading) {
      syncFromLocalStorage();
    }
  }, [isAuthenticated, isLoading, syncFromLocalStorage]);

  const handlePlay = async (id: string) => {
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

      toast.success("Game played", {
        description: `Marked ${game.title} as played.`,
      });
    }
  };

  const handleHide = async (id: string) => {
    await toggleHidden(id, true);
    const game = games.find((g) => g.id === id);
    if (game) {
      toast.success("Game hidden", {
        description: `${game.title} is now hidden.`,
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
    setTopicFilter("all");
    setListFilter("all");
    setSortBy("title");
  };

  const handleRandomGame = () => {
    setIsLuckyModalOpen(true);
  };

  const filteredGames = useMemo(() => {
    const query = searchQuery.toLowerCase();
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

        return (
          (topicFilter === "all" || g.topic === topicFilter) &&
          (query === "" ||
            g.title.toLowerCase().includes(query) ||
            g.topic.toLowerCase().includes(query))
        );
      })
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
  ]);

  if (isLoading) return <GameGridSkeleton count={games.length} />;

  return (
    <div className="space-y-6">
      {!isAuthenticated && <GuestSyncBanner />}

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
      />

      <FeelingLuckyModal
        open={isLuckyModalOpen}
        onOpenChange={setIsLuckyModalOpen}
        games={games}
        playedIds={playedIds}
        onPlay={handlePlay}
      />

      {filteredGames.length > 0 ? (
        <GameGrid
          games={filteredGames.map((g) => ({
            id: g.id,
            title: g.title,
            link: g.link,
            topic: g.topic,
            playCount: g.playCount || 0,
            createdAt: g.createdAt,
          }))}
          playedIds={playedIds}
          onPlay={handlePlay}
          onHide={isAuthenticated ? handleHide : undefined}
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
