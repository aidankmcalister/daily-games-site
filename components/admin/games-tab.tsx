"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { TOPICS } from "@/lib/constants";
import { Plus, Loader2, Archive, Trash2, Upload, FileUp } from "lucide-react";
import type { Topic } from "@/app/generated/prisma/client";
import { GameItem, Game } from "./game-item";
import { toast } from "sonner";

export function GamesTab({ canManageGames }: { canManageGames: boolean }) {
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search and filter states
  const [gameSearch, setGameSearch] = useState("");
  const [gameTopicFilter, setGameTopicFilter] = useState<Topic | "all">("all");
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
  const [showAddDialog, setShowAddDialog] = useState(false);

  // New game form state
  const [newTitle, setNewTitle] = useState("");
  const [newLink, setNewLink] = useState("");
  const [newTopic, setNewTopic] = useState<Topic>("puzzle");
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

  const handleAddGame = async () => {
    if (!newTitle || !newLink) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/games", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          link: newLink,
          topic: newTopic,
        }),
      });
      if (res.ok) {
        setNewTitle("");
        setNewLink("");
        setNewTopic("puzzle");
        setShowAddDialog(false);
        fetchGames();
      }
    } finally {
      setIsSubmitting(false);
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

  // Bulk Actions
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

  // CSV Import
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      const lines = text.split("\n");
      const gamesToImport: any[] = [];

      // Basic CSV parser: Title, Link, Topic
      for (let i = 1; i < lines.length; i++) {
        // Skip header
        const line = lines[i].trim();
        if (!line) continue;

        // Handle quotes? Simple split for now as requested format is simple
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

      // Bulk Import via standard create API (loop) or bulk API?
      // Since create API is singular, let's just make a new bulk import API?
      // Or loop here. Loop is slow but fine for <100 games.
      // Actually /api/games/bulk import would be better.
      // But for speed, let's just loop locally or user API modification.

      // Let's assume user wants to use existing API for now to avoid creating another route unless needed.
      // Actually, I can add 'import' action to bulk route or create separate route.
      // I'll create a quick loop here, simpler.

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
          gameTopicFilter === "all" || game.topic === gameTopicFilter;
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
        <h2 className="text-lg font-semibold">
          All Games ({filteredGames.length})
        </h2>
        {canManageGames && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5"
              onClick={() => fileInputRef.current?.click()}
            >
              <FileUp className="h-3.5 w-3.5" />
              Import CSV
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".csv"
              onChange={handleFileUpload}
            />
            <AlertDialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-1.5">
                  <Plus className="h-3.5 w-3.5" />
                  Add Game
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Add Custom Game</AlertDialogTitle>
                  <AlertDialogDescription>
                    Add a new game to your collection.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="space-y-4 py-4">
                  <Field>
                    <FieldLabel htmlFor="game-title">Title</FieldLabel>
                    <Input
                      id="game-title"
                      placeholder="Game name"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="game-link">Link</FieldLabel>
                    <Input
                      id="game-link"
                      placeholder="https://example.com/game"
                      value={newLink}
                      onChange={(e) => setNewLink(e.target.value)}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="game-topic">Category</FieldLabel>
                    <Select
                      value={newTopic}
                      onValueChange={(v) => setNewTopic(v as Topic)}
                    >
                      <SelectTrigger
                        id="game-topic"
                        className="w-full capitalize"
                      >
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {TOPICS.map((t) => (
                          <SelectItem key={t} value={t} className="capitalize">
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setShowAddDialog(false)}>
                    Cancel
                  </AlertDialogCancel>
                  <Button
                    onClick={handleAddGame}
                    disabled={
                      isSubmitting || !newTitle.trim() || !newLink.trim()
                    }
                  >
                    {isSubmitting ? "Adding..." : "Add Game"}
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>

      {/* Bulk Actions Bar */}
      {selectedIds.size > 0 && canManageGames && (
        <div className="bg-primary/10 border border-primary/20 rounded-md p-2 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <span className="text-sm font-medium px-2">
            {selectedIds.size} selected
          </span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleBulkAction("archive")}
            >
              <Archive className="h-4 w-4 mr-2" />
              Archive
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleBulkAction("unarchive")}
            >
              <Upload className="h-4 w-4 mr-2" />
              Restore
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="sm" variant="destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Delete {selectedIds.size} games?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleBulkAction("delete")}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 flex gap-2">
          <Input
            placeholder="Search games..."
            value={gameSearch}
            onChange={(e) => setGameSearch(e.target.value)}
            className="flex-1 h-9"
          />
          <Button
            variant={showArchived ? "secondary" : "outline"}
            size="sm"
            onClick={() => setShowArchived(!showArchived)}
            className="h-9 whitespace-nowrap"
          >
            {showArchived ? "Hide Archived" : "Show Archived"}
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          <Select
            value={gameTopicFilter}
            onValueChange={(value) =>
              setGameTopicFilter(value as Topic | "all")
            }
          >
            <SelectTrigger className="w-[140px] h-9 text-xs">
              <SelectValue placeholder="Topic" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Topics</SelectItem>
              {TOPICS.map((topic) => (
                <SelectItem key={topic} value={topic} className="capitalize">
                  {topic}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={`${gameSortBy}-${gameSortOrder}`}
            onValueChange={(value) => {
              const [sortBy, order] = value.split("-") as [
                "title" | "topic" | "playCount" | "createdAt",
                "asc" | "desc"
              ];
              setGameSortBy(sortBy);
              setGameSortOrder(order);
            }}
          >
            <SelectTrigger className="w-[140px] h-9 text-xs">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="title-asc">Title (A-Z)</SelectItem>
              <SelectItem value="title-desc">Title (Z-A)</SelectItem>
              <SelectItem value="playCount-desc">Most Played</SelectItem>
              <SelectItem value="createdAt-desc">Newest First</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border bg-card">
        {canManageGames && filteredGames.length > 0 && (
          <div className="px-4 py-2 border-b flex items-center gap-4 text-xs text-muted-foreground bg-muted/30">
            <input
              type="checkbox"
              checked={filteredGames.every((g) => selectedIds.has(g.id))}
              onChange={(e) => handleSelectAll(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span>Select All</span>
          </div>
        )}
        <div className="divide-y relative">
          {filteredGames.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">
              No games found.
            </div>
          ) : (
            filteredGames.map((game) => (
              <div
                key={game.id}
                className="px-4 py-3 hover:bg-muted/40 transition-colors"
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
  );
}
