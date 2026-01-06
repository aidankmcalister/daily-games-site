"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { Loader2, FileUp } from "lucide-react";
import type { Topic } from "@/app/generated/prisma/client";
import { GameItem, Game } from "./game-item";
import { toast } from "sonner";

import { AddGameDialog } from "./games/add-game-dialog";
import { BulkActionToolbar } from "./games/bulk-action-toolbar";
import { GamesSearchFilter } from "./games/games-search-filter";
import { DlesButton } from "@/components/design/dles-button";

export function GamesTab({ canManageGames }: { canManageGames: boolean }) {
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Game form state
  const [editingGameId, setEditingGameId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      const res = await fetch("/api/games?includeArchived=true");
      const data = await res.json();
      setGames(data);
    } catch (error) {
      console.error("Failed to fetch games:", error);
    } finally {
      setIsLoading(false);
    }
  };

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
      setSelectedIds(new Set(filteredGames.map((g) => g.id)));
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      const lines = text.split("\n");
      const gamesToImport: any[] = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const parts = line.split(",");
        if (parts.length >= 3) {
          gamesToImport.push({
            title: parts[0].trim(),
            link: parts[1].trim(),
            topic: parts[2].trim().toLowerCase(),
          });
        }
      }

      if (gamesToImport.length === 0) {
        toast.error("No valid games found in CSV");
        return;
      }

      let imported = 0;
      setIsSubmitting(true);

      try {
        await Promise.all(
          gamesToImport.map((g) =>
            fetch("/api/games", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(g),
            }).then((r) => {
              if (r.ok) imported++;
            })
          )
        );

        toast.success(`Imported ${imported} games`);
        fetchGames();
      } finally {
        setIsSubmitting(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };
    reader.readAsText(file);
  };

  const filteredGames = useMemo(() => {
    const q = gameSearch.trim().toLowerCase();

    return games
      .filter((game) => {
        if (!showArchived && game.archived) return false;

        const matchesSearch =
          q.length === 0 ||
          game.title.toLowerCase().includes(q) ||
          game.link.toLowerCase().includes(q);
        const matchesTopic =
          gameTopicFilter.length === 0 ||
          gameTopicFilter.includes("all") ||
          gameTopicFilter.includes(game.topic);
        return matchesSearch && matchesTopic;
      })
      .sort((a, b) => {
        let comparison = 0;

        if (gameSortBy === "title") {
          comparison = a.title.localeCompare(b.title);
        } else if (gameSortBy === "topic") {
          comparison = a.topic.localeCompare(b.topic);
        } else if (gameSortBy === "playCount") {
          comparison = (a.playCount || 0) - (b.playCount || 0);
        } else {
          comparison =
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }

        return gameSortOrder === "asc" ? comparison : -comparison;
      });
  }, [
    games,
    gameSearch,
    gameTopicFilter,
    gameSortBy,
    gameSortOrder,
    showArchived,
  ]);

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-heading-section">
          All Games ({filteredGames.length})
        </h2>
        {canManageGames && (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <DlesButton
              onClick={() => fileInputRef.current?.click()}
              disabled={isSubmitting}
              className="flex-1 sm:flex-none"
            >
              {isSubmitting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <FileUp className="h-3.5 w-3.5" />
              )}
              Import CSV
            </DlesButton>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".csv"
              onChange={handleFileUpload}
            />
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
          {canManageGames && filteredGames.length > 0 && (
            <div className="grid grid-cols-[16px_1fr_100px] md:grid-cols-[16px_180px_150px_minmax(0,1fr)_80px_80px] gap-4 items-center px-4 py-3 border-b border-border/40 bg-muted/20 text-micro text-muted-foreground sticky top-0 z-10 backdrop-blur-sm">
              <div className="flex items-center justify-center">
                <input
                  type="checkbox"
                  checked={
                    filteredGames.length > 0 &&
                    filteredGames.every((g) => selectedIds.has(g.id))
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
          <div className="divide-y divide-border/30 relative">
            {filteredGames.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-sm">
                No games found.
              </div>
            ) : (
              filteredGames.map((game) => (
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
        </div>
      </div>
    </div>
  );
}
