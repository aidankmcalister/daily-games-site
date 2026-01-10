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
import { useLists, GameList } from "@/lib/use-lists";
import { useStats } from "@/lib/stats-context";
import { Skeleton } from "@/components/ui/skeleton";

import { toast } from "sonner";
import { DlesButton } from "@/components/design/dles-button";
import { Search } from "lucide-react";
import { useSearchParams } from "next/navigation";

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

import { KeyboardShortcutsModal } from "@/components/keyboard-shortcuts-modal";

type SortOption = "title" | "topic" | "playCount" | "lastPlayed";

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
  const [hidePlayedToday, setHidePlayedToday] = useState(false);
  const [isLuckyModalOpen, setIsLuckyModalOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [openGame, setOpenGame] = useState<Game | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const { lists } = useLists();
  const { setStats } = useStats();
  const searchParams = useSearchParams();

  const [presetLists, setPresetLists] = useState<GameList[]>([]);

  // Sync URL list param to filter
  useEffect(() => {
    const listParam = searchParams.get("list");
    if (listParam) {
      setListFilter(listParam);
    }
  }, [searchParams]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchQuery,
    topicFilter,
    listFilter,
    sortBy,
    showHidden,
    embedOnly,
    hidePlayedToday,
  ]);

  // Fetch preset lists
  useEffect(() => {
    const fetchPresetLists = async () => {
      try {
        const res = await fetch("/api/preset-lists");
        if (res.ok) {
          const data = await res.json();
          const formattedPresets: GameList[] = data.map((p: any) => ({
            id: p.id,
            name: p.name,
            color: p.color,
            gameCount: p.games.length,
            games: p.games.map((g: any) => g.id),
          }));
          setPresetLists(formattedPresets);
        }
      } catch (error) {
        console.error("Failed to fetch preset lists:", error);
      }
    };
    fetchPresetLists();
  }, []);

  const allLists = useMemo(
    () => [...presetLists, ...lists],
    [presetLists, lists]
  );

  const gameIds = useMemo(() => games.map((g) => g.id), [games]);

  const {
    playedIds,
    hiddenIds,
    currentStreak,
    isLoading: isStatsLoading,
    isAuthenticated,
    markAsPlayed,
    unmarkAsPlayed,
    toggleHidden,
    syncFromLocalStorage,
    clearLocalPlayed,
    playedDates,
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

  // Define handleClear before using it in useEffect
  const handleClear = useCallback(() => {
    clearLocalPlayed();
    toast.success("Progress reset", {
      description: "All daily progress has been cleared.",
    });
  }, [clearLocalPlayed]);

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
    handleClear,
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

  const handleModalPlay = useCallback(
    async (id: string) => {
      await markAsPlayed(id);

      setGames((prevGames) => {
        const gameIndex = prevGames.findIndex((g) => g.id === id);
        if (gameIndex !== -1) {
          const game = prevGames[gameIndex];
          const updatedGames = [...prevGames];
          updatedGames[gameIndex] = {
            ...game,
            playCount: (game.playCount || 0) + 1,
          };
          return updatedGames;
        }
        return prevGames;
      });
    },
    [markAsPlayed]
  );

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

  const handleClearFilters = () => {
    setSearchQuery("");
    setTopicFilter([]);
    setListFilter("all");
    setSortBy("playCount");
    setEmbedOnly(false);
    setCurrentPage(1);
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

        // Hide played games if toggle is on
        if (hidePlayedToday && playedIds.has(g.id)) return false;

        // Filter by list
        if (listFilter !== "all" && allLists.length > 0) {
          const list = allLists.find((l) => l.id === listFilter);
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

        if (sortBy === "lastPlayed") {
          const dateA = playedDates[a.id]?.[0]
            ? new Date(playedDates[a.id][0]).getTime()
            : 0;
          const dateB = playedDates[b.id]?.[0]
            ? new Date(playedDates[b.id][0]).getTime()
            : 0;
          return dateB - dateA || a.title.localeCompare(b.title);
        }
        return a.title.localeCompare(b.title);
      });
  }, [
    games,
    searchQuery,
    topicFilter,
    listFilter,
    allLists,
    sortBy,
    playedIds,
    hiddenIds,
    showHidden,
    embedOnly,
    hidePlayedToday,
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

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if input/textarea is focused
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        if (e.key === "Escape") {
          (document.activeElement as HTMLElement).blur();
        }
        return;
      }

      // Help
      if (e.key === "?") {
        e.preventDefault();
        setIsShortcutsOpen((prev) => !prev);
      }

      // Search
      if (e.key === "/") {
        e.preventDefault();
        const searchInput = document.querySelector(
          'input[placeholder*="Search"]'
        ) as HTMLInputElement;
        searchInput?.focus();
      }

      // Number keys 1-9
      const num = parseInt(e.key);
      if (!isNaN(num) && num >= 1 && num <= 9) {
        const game = filteredGames[num - 1]; // Use filtered games instead of mappedGames to avoid complexity
        if (game) {
          handlePlay(game.id);
        }
      }

      // Random
      if (e.key.toLowerCase() === "k") {
        e.preventDefault();
        handleRandomGame();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [filteredGames, handlePlay]);

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
        lists={allLists}
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
        hidePlayedToday={hidePlayedToday}
        onHidePlayedTodayChange={setHidePlayedToday}
      />

      <FeelingLuckyModal
        open={isLuckyModalOpen}
        onOpenChange={setIsLuckyModalOpen}
        games={games}
        playedIds={playedIds}
        onPlay={handlePlay}
      />

      <KeyboardShortcutsModal
        open={isShortcutsOpen}
        onOpenChange={setIsShortcutsOpen}
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
          key={`${topicFilter.join(
            ","
          )}-${listFilter}-${sortBy}-${showHidden}-${hidePlayedToday}-${embedOnly}-${searchQuery}`}
          games={mappedGames}
          playedIds={playedIds}
          onPlay={handlePlay}
          onHide={isAuthenticated ? handleHide : undefined}
          onMarkPlayed={handleModalPlay}
          onUnmarkPlayed={unmarkAsPlayed}
          currentPage={currentPage}
          onPageChange={(page) => {
            setCurrentPage(page);
          }}
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
