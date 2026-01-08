"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "@/lib/auth-client";
import { getPlayedIds, savePlayedIds } from "@/lib/played-state";
import { getCurrentStreak, getLongestStreak } from "@/lib/streaks";

interface UserGame {
  id: string;
  gameId: string;
  playedAt: string;
  hidden: boolean;
  played: boolean;
}

interface UsePlayedGamesResult {
  playedIds: Set<string>;
  hiddenIds: Set<string>;
  currentStreak: number;
  longestStreak: number;
  isLoading: boolean;
  isAuthenticated: boolean;
  markAsPlayed: (gameId: string) => Promise<void>;
  toggleHidden: (gameId: string, hidden: boolean) => Promise<void>;
  syncFromLocalStorage: () => Promise<void>;
  clearLocalPlayed: () => void;
}

export function usePlayedGames(gameIds: string[]): UsePlayedGamesResult {
  const { data: session, isPending } = useSession();
  const [playedIds, setPlayedIds] = useState<Set<string>>(new Set());
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());
  const [playedDates, setPlayedDates] = useState<Date[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!session?.user;

  // Fetch user games from API if authenticated
  useEffect(() => {
    if (isPending) return;

    const fetchData = async () => {
      setIsLoading(true);

      if (isAuthenticated) {
        try {
          const res = await fetch("/api/user-games");
          if (res.ok) {
            const userGames: UserGame[] = await res.json();
            const played = new Set<string>();
            const hidden = new Set<string>();
            const dates: Date[] = [];

            const today = new Date().toISOString().split("T")[0];
            userGames.forEach((ug) => {
              if (gameIds.includes(ug.gameId)) {
                // Only count as played if played field is true AND it was played today
                const playedDate = new Date(ug.playedAt)
                  .toISOString()
                  .split("T")[0];
                if (ug.played && playedDate === today) {
                  played.add(ug.gameId);
                }

                // Still add all dates for streak purposes
                if (ug.played) {
                  dates.push(new Date(ug.playedAt));
                }

                if (ug.hidden) {
                  hidden.add(ug.gameId);
                }
              }
            });

            setPlayedIds(played);
            setHiddenIds(hidden);
            setPlayedDates(dates);
          }
        } catch (error) {
          console.error("Failed to fetch user games:", error);
        }
      } else {
        // Use localStorage for guests
        const storedIds = getPlayedIds();
        const validIds = new Set<string>();
        storedIds.forEach((id) => {
          if (gameIds.includes(id)) {
            validIds.add(id);
          }
        });
        setPlayedIds(validIds);
        setHiddenIds(new Set()); // Guests can't hide
        setPlayedDates([]); // No streak tracking for guests
      }

      setIsLoading(false);
    };

    fetchData();
  }, [isAuthenticated, isPending, JSON.stringify([...gameIds].sort())]);

  const markAsPlayed = useCallback(
    async (gameId: string) => {
      // Optimistic update
      setPlayedIds((prev) => new Set(prev).add(gameId));

      if (isAuthenticated) {
        try {
          await fetch("/api/user-games", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ gameId }),
          });
          setPlayedDates((prev) => [...prev, new Date()]);
        } catch (error) {
          console.error("Failed to mark as played:", error);
          // Revert on failure
          setPlayedIds((prev) => {
            const next = new Set(prev);
            next.delete(gameId);
            return next;
          });
        }
      } else {
        // Save to localStorage for guests
        setPlayedIds((prev) => {
          const next = new Set(prev).add(gameId);
          savePlayedIds(next);
          return next;
        });
        // Still update play count
        fetch(`/api/games/${gameId}/play`, { method: "PATCH" }).catch(
          console.error
        );
      }
    },
    [isAuthenticated]
  );

  const toggleHidden = useCallback(
    async (gameId: string, hidden: boolean) => {
      if (!isAuthenticated) return; // Guests can't hide

      // Optimistic update
      setHiddenIds((prev) => {
        const next = new Set(prev);
        if (hidden) {
          next.add(gameId);
        } else {
          next.delete(gameId);
        }
        return next;
      });

      try {
        await fetch(`/api/user-games/${gameId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ hidden }),
        });
      } catch (error) {
        console.error("Failed to toggle hidden:", error);
        // Revert on failure
        setHiddenIds((prev) => {
          const next = new Set(prev);
          if (hidden) {
            next.delete(gameId);
          } else {
            next.add(gameId);
          }
          return next;
        });
      }
    },
    [isAuthenticated]
  );

  const syncFromLocalStorage = useCallback(async () => {
    if (!isAuthenticated) return;

    const localIds = getPlayedIds();
    if (localIds.size === 0) return;

    try {
      await fetch("/api/user-games/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameIds: [...localIds] }),
      });
      // Clear localStorage after successful sync
      savePlayedIds(new Set());
    } catch (error) {
      console.error("Failed to sync from localStorage:", error);
    }
  }, [isAuthenticated]);

  const clearLocalPlayed = useCallback(async () => {
    setPlayedIds(new Set());
    savePlayedIds(new Set());

    if (isAuthenticated) {
      try {
        await fetch("/api/user-games", { method: "DELETE" });
      } catch (error) {
        console.error("Failed to clear database played games:", error);
      }
    }
  }, [isAuthenticated]);

  return {
    playedIds,
    hiddenIds,
    currentStreak: getCurrentStreak(playedDates),
    longestStreak: getLongestStreak(playedDates),
    isLoading,
    isAuthenticated,
    markAsPlayed,
    toggleHidden,
    syncFromLocalStorage,
    clearLocalPlayed,
  };
}
