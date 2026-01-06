"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useSession } from "@/lib/auth-client";

export interface GameList {
  id: string;
  name: string;
  color: string;
  gameCount: number;
  games: string[]; // Game IDs
}

interface UseListsResult {
  lists: GameList[];
  isLoading: boolean;
  createList: (name: string, color?: string) => Promise<GameList | null>;
  deleteList: (id: string) => Promise<void>;
  renameList: (id: string, name: string) => Promise<void>;
  updateListColor: (id: string, color: string) => Promise<void>;
  addGameToList: (listId: string, gameId: string) => Promise<void>;
  removeGameFromList: (listId: string, gameId: string) => Promise<void>;
  getListsForGame: (gameId: string) => string[]; // Returns list IDs containing the game
  refetch: () => Promise<void>;
}

const ListsContext = createContext<UseListsResult | null>(null);

export function ListsProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [lists, setLists] = useState<GameList[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!session?.user;

  const fetchLists = useCallback(async () => {
    if (!isAuthenticated) {
      setLists([]);
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/lists");
      if (res.ok) {
        const data = await res.json();
        setLists(data);
      }
    } catch (error) {
      console.error("Failed to fetch lists:", error);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchLists();
  }, [fetchLists]);

  const createList = useCallback(
    async (name: string, color?: string): Promise<GameList | null> => {
      if (!isAuthenticated) return null;

      try {
        const res = await fetch("/api/lists", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, color }),
        });

        if (res.ok) {
          const newList = await res.json();
          const listWithMeta = {
            ...newList,
            gameCount: 0,
            games: [],
            color: newList.color || "slate",
          };
          setLists((prev) => [listWithMeta, ...prev]);
          return listWithMeta;
        }
      } catch (error) {
        console.error("Failed to create list:", error);
      }
      return null;
    },
    [isAuthenticated]
  );

  const deleteList = useCallback(
    async (id: string) => {
      if (!isAuthenticated) return;

      setLists((prev) => prev.filter((l) => l.id !== id));

      try {
        await fetch(`/api/lists/${id}`, { method: "DELETE" });
      } catch (error) {
        console.error("Failed to delete list:", error);
        fetchLists(); // Revert on error
      }
    },
    [isAuthenticated, fetchLists]
  );

  const renameList = useCallback(
    async (id: string, name: string) => {
      if (!isAuthenticated) return;

      setLists((prev) => prev.map((l) => (l.id === id ? { ...l, name } : l)));

      try {
        await fetch(`/api/lists/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name }),
        });
      } catch (error) {
        console.error("Failed to rename list:", error);
        fetchLists();
      }
    },
    [isAuthenticated, fetchLists]
  );

  const updateListColor = useCallback(
    async (id: string, color: string) => {
      if (!isAuthenticated) return;

      setLists((prev) => prev.map((l) => (l.id === id ? { ...l, color } : l)));

      try {
        await fetch(`/api/lists/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ color }),
        });
      } catch (error) {
        console.error("Failed to update list color:", error);
        fetchLists();
      }
    },
    [isAuthenticated, fetchLists]
  );

  const addGameToList = useCallback(
    async (listId: string, gameId: string) => {
      if (!isAuthenticated) return;

      // Optimistic update
      setLists((prev) =>
        prev.map((l) =>
          l.id === listId
            ? { ...l, games: [...l.games, gameId], gameCount: l.gameCount + 1 }
            : l
        )
      );

      try {
        await fetch(`/api/lists/${listId}/games`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ gameId }),
        });
      } catch (error) {
        console.error("Failed to add game to list:", error);
        fetchLists();
      }
    },
    [isAuthenticated, fetchLists]
  );

  const removeGameFromList = useCallback(
    async (listId: string, gameId: string) => {
      if (!isAuthenticated) return;

      // Optimistic update
      setLists((prev) =>
        prev.map((l) =>
          l.id === listId
            ? {
                ...l,
                games: l.games.filter((g) => g !== gameId),
                gameCount: l.gameCount - 1,
              }
            : l
        )
      );

      try {
        await fetch(`/api/lists/${listId}/games`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ gameId }),
        });
      } catch (error) {
        console.error("Failed to remove game from list:", error);
        fetchLists();
      }
    },
    [isAuthenticated, fetchLists]
  );

  const getListsForGame = useCallback(
    (gameId: string): string[] => {
      return lists.filter((l) => l.games.includes(gameId)).map((l) => l.id);
    },
    [lists]
  );

  const value = {
    lists,
    isLoading,
    createList,
    deleteList,
    renameList,
    updateListColor,
    addGameToList,
    removeGameFromList,
    getListsForGame,
    refetch: fetchLists,
  };

  return (
    <ListsContext.Provider value={value}>{children}</ListsContext.Provider>
  );
}

export function useLists() {
  const context = useContext(ListsContext);
  if (!context) {
    throw new Error("useLists must be used within a ListsProvider");
  }
  return context;
}
