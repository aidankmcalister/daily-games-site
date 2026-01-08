"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import type { Topic } from "@/app/generated/prisma/client";
import { GameItem, Game } from "./game-item";
import { toast } from "sonner";

import { AddGameDialog } from "./games/add-game-dialog";
import { ImportJsonDialog } from "./games/import-json-dialog";
import { BulkActionToolbar } from "./games/bulk-action-toolbar";
import { GamesSearchFilter } from "./games/games-search-filter";
import { DlesButton } from "@/components/design/dles-button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function GamesTab({ canManageGames }: { canManageGames: boolean }) {
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [totalPages, setTotalPages] = useState(1);
  const [totalGames, setTotalGames] = useState(0);

  // Search and filter states
  const [gameSearch, setGameSearch] = useState("");
  const [gameTopicFilter, setGameTopicFilter] = useState<string[]>([]);
  const [gameSortBy, setGameSortBy] = useState<
    "title" | "topic" | "playCount" | "createdAt"
  >("title");
  const [gameSortOrder, setGameSortOrder] = useState<"asc" | "desc">("asc");
  const [showArchived, setShowArchived] = useState(false);

  // Bulk Selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Game form state
  const [editingGameId, setEditingGameId] = useState<string | null>(null);

  const fetchGames = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      params.set("page", page.toString());
      params.set("limit", limit.toString());
      params.set("search", gameSearch);
      params.set("includeArchived", showArchived.toString()); // If false, server handles it

      params.set("sortBy", gameSortBy);
      params.set("sortOrder", gameSortOrder);

      // Handle topic
      // The current UI sends ["all"] or ["words", "logic"]
      if (gameTopicFilter.length > 0 && !gameTopicFilter.includes("all")) {
        params.set("topic", gameTopicFilter.join(","));
      }

      const res = await fetch(`/api/games?${params.toString()}`);
      const data = await res.json();

      if (data.items) {
        setGames(data.items);
        setTotalPages(data.meta.totalPages);
        setTotalGames(data.meta.total);
      }
    } catch (error) {
      console.error("Failed to fetch games:", error);
    } finally {
      setIsLoading(false);
    }
  }, [
    page,
    limit,
    gameSearch,
    gameTopicFilter,
    gameSortBy,
    gameSortOrder,
    showArchived,
  ]);

  useEffect(() => {
    // Debounce fetch
    const timer = setTimeout(() => {
      fetchGames();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchGames]);

  // Reset page when filters change (except page itself)
  useEffect(() => {
    setPage(1);
  }, [gameSearch, gameTopicFilter, gameSortBy, gameSortOrder, showArchived]);

  const handleAddGame = async (newGame: {
    title: string;
    link: string;
    topic: Topic;
    description: string;
  }) => {
    const res = await fetch("/api/games", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newGame),
    });
    if (res.ok) {
      fetchGames();
    } else {
      toast.error("Failed to add game");
    }
  };

  const handleUpdateGame = async (
    id: string,
    data: { title: string; link: string; topic: Topic }
  ) => {
    try {
      const res = await fetch(`/api/games/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        setEditingGameId(null);
        fetchGames();
      }
    } catch (error) {
      console.error("Failed to update game:", error);
    }
  };

  const handleDeleteGame = async (id: string) => {
    try {
      const res = await fetch(`/api/games/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchGames();
      }
    } catch (error) {
      console.error("Failed to delete game:", error);
    }
  };

  const handleBulkAction = async (
    action: "archive" | "unarchive" | "delete"
  ) => {
    if (selectedIds.size === 0) return;

    try {
      const res = await fetch("/api/admin/games/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          gameIds: Array.from(selectedIds),
        }),
      });

      if (res.ok) {
        toast.success(`Bulk ${action} successful`);
        setSelectedIds(new Set());
        fetchGames();
      } else {
        toast.error("Bulk action failed");
      }
    } catch (error) {
      toast.error("Failed to perform bulk action");
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(games.map((g) => g.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    const next = new Set(selectedIds);
    if (checked) next.add(id);
    else next.delete(id);
    setSelectedIds(next);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-heading-section">All Games ({totalGames})</h2>
        {canManageGames && (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <ImportJsonDialog onImportComplete={fetchGames} />
            <AddGameDialog onAdd={handleAddGame} />
          </div>
        )}
      </div>

      <BulkActionToolbar
        selectedCount={selectedIds.size}
        onAction={handleBulkAction}
      />

      <GamesSearchFilter
        search={gameSearch}
        onSearchChange={setGameSearch}
        topicFilter={gameTopicFilter}
        onTopicFilterChange={setGameTopicFilter}
        sortBy={gameSortBy}
        sortOrder={gameSortOrder}
        onSortChange={(by, order) => {
          setGameSortBy(by);
          setGameSortOrder(order);
        }}
        showArchived={showArchived}
        onShowArchivedToggle={() => setShowArchived(!showArchived)}
      />

      <div className="rounded-md border border-border/40 bg-card overflow-hidden">
        <div className="overflow-x-auto">
          {canManageGames && (
            <div className="grid grid-cols-[16px_1fr_100px] md:grid-cols-[16px_180px_150px_minmax(0,1fr)_80px_80px] gap-4 items-center px-4 py-3 border-b border-border/40 bg-muted/20 text-micro text-muted-foreground sticky top-0 z-10 backdrop-blur-sm">
              <div className="flex items-center justify-center">
                <input
                  type="checkbox"
                  checked={
                    games.length > 0 &&
                    games.every((g) => selectedIds.has(g.id))
                  }
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="h-3.5 w-3.5 rounded border-gray-300 text-primary focus:ring-primary/20 bg-background/50 cursor-pointer"
                />
              </div>
              <div className="hidden md:block">Title</div>
              <div className="hidden md:block">Category</div>
              <div className="hidden md:block">Link</div>
              <div className="hidden md:block">Stats</div>
              <div className="text-right ml-auto">Actions</div>
            </div>
          )}

          {isLoading && games.length === 0 ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="divide-y divide-border/30 relative">
              {games.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground text-sm">
                  No games found.
                </div>
              ) : (
                games.map((game) => (
                  <div
                    key={game.id}
                    className="px-4 py-3 hover:bg-muted/5 transition-colors"
                  >
                    <GameItem
                      game={game}
                      isEditing={editingGameId === game.id}
                      canManage={canManageGames}
                      isSelected={selectedIds.has(game.id)}
                      onSelect={(checked) => handleSelectOne(game.id, checked)}
                      onEdit={() => setEditingGameId(game.id)}
                      onCancelEdit={() => setEditingGameId(null)}
                      onUpdate={handleUpdateGame}
                      onDelete={handleDeleteGame}
                    />
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-border/40 bg-muted/10">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="hidden sm:inline">Rows per page</span>
            <Select
              value={limit.toString()}
              onValueChange={(v) => setLimit(parseInt(v))}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground mr-2">
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-1">
              <DlesButton
                variant="outline"
                size="icon-sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || isLoading}
              >
                <ChevronLeft className="h-4 w-4" />
              </DlesButton>
              <DlesButton
                variant="outline"
                size="icon-sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || isLoading}
              >
                <ChevronRight className="h-4 w-4" />
              </DlesButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
