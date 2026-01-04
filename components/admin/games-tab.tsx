"use client";

import { useState, useEffect, useMemo } from "react";
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
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Field, FieldLabel } from "@/components/ui/field";
import { TOPICS, TOPIC_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Pencil, Trash2, Plus, Loader2 } from "lucide-react";
import type { Topic } from "@/app/generated/prisma/client";

interface Game {
  id: string;
  title: string;
  link: string;
  topic: string;
  playCount: number;
  createdAt: string;
}

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

  // Game form state
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [formLink, setFormLink] = useState("");
  const [formTopic, setFormTopic] = useState<Topic>("puzzle");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      const res = await fetch("/api/games");
      const data = await res.json();
      setGames(data);
    } catch (error) {
      console.error("Failed to fetch games:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddGame = async () => {
    if (!formTitle || !formLink) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/games", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formTitle,
          link: formLink,
          topic: formTopic,
        }),
      });
      if (res.ok) {
        resetForm();
        setShowAddDialog(false);
        fetchGames();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateGame = async () => {
    if (!editingGame || !formTitle || !formLink) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/games/${editingGame.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formTitle,
          link: formLink,
          topic: formTopic,
        }),
      });
      if (res.ok) {
        resetForm();
        setEditingGame(null);
        fetchGames();
      }
    } finally {
      setIsSubmitting(false);
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

  const startEditing = (game: Game) => {
    setEditingGame(game);
    setFormTitle(game.title);
    setFormLink(game.link);
    setFormTopic(game.topic as Topic);
  };

  const resetForm = () => {
    setFormTitle("");
    setFormLink("");
    setFormTopic("puzzle");
    setEditingGame(null);
  };

  const filteredGames = useMemo(() => {
    const q = gameSearch.trim().toLowerCase();

    return games
      .filter((game) => {
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
  }, [games, gameSearch, gameTopicFilter, gameSortBy, gameSortOrder]);

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
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="game-link">Link</FieldLabel>
                  <Input
                    id="game-link"
                    placeholder="https://example.com/game"
                    value={formLink}
                    onChange={(e) => setFormLink(e.target.value)}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="game-topic">Category</FieldLabel>
                  <Select
                    value={formTopic}
                    onValueChange={(v) => setFormTopic(v as Topic)}
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
                <AlertDialogCancel onClick={resetForm}>
                  Cancel
                </AlertDialogCancel>
                <Button
                  onClick={handleAddGame}
                  disabled={
                    isSubmitting || !formTitle.trim() || !formLink.trim()
                  }
                >
                  {isSubmitting ? "Adding..." : "Add Game"}
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {/* Game search and filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search games..."
            value={gameSearch}
            onChange={(e) => setGameSearch(e.target.value)}
            className="max-w-md"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Select
            value={gameTopicFilter}
            onValueChange={(value) =>
              setGameTopicFilter(value as Topic | "all")
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by topic" />
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
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="title-asc">Title (A-Z)</SelectItem>
              <SelectItem value="title-desc">Title (Z-A)</SelectItem>
              <SelectItem value="topic-asc">Topic (A-Z)</SelectItem>
              <SelectItem value="topic-desc">Topic (Z-A)</SelectItem>
              <SelectItem value="playCount-desc">Most Played</SelectItem>
              <SelectItem value="playCount-asc">Least Played</SelectItem>
              <SelectItem value="createdAt-desc">Newest First</SelectItem>
              <SelectItem value="createdAt-asc">Oldest First</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border">
        <div className="divide-y">
          {filteredGames.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No games found matching your criteria.
            </div>
          ) : (
            filteredGames.map((game) => (
              <div
                key={game.id}
                className="flex items-center justify-between px-4 py-2.5 hover:bg-muted/50"
              >
                {editingGame?.id === game.id ? (
                  <div className="flex-1 flex items-center gap-2">
                    <Input
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      className="h-8 flex-1"
                      placeholder="Title"
                    />
                    <Input
                      value={formLink}
                      onChange={(e) => setFormLink(e.target.value)}
                      className="h-8 flex-1"
                      placeholder="Link"
                    />
                    <Select
                      value={formTopic}
                      onValueChange={(v) => setFormTopic(v as Topic)}
                    >
                      <SelectTrigger className="h-8 w-[120px] capitalize">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TOPICS.map((t) => (
                          <SelectItem key={t} value={t} className="capitalize">
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      size="sm"
                      className="h-8"
                      onClick={handleUpdateGame}
                      disabled={isSubmitting}
                    >
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8"
                      onClick={resetForm}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="font-medium whitespace-nowrap">
                        {game.title}
                      </span>
                      <Badge
                        className={cn(
                          "capitalize text-xs",
                          TOPIC_COLORS[game.topic]
                        )}
                      >
                        {game.topic}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {game.link}
                      </span>
                      <span className="text-xs text-muted-foreground ml-2">
                        {game.playCount || 0} plays
                      </span>
                    </div>
                    {canManageGames && (
                      <div className="flex items-center gap-1 ml-4">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7"
                          onClick={() => startEditing(game)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Delete {game.title}?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteGame(game.id)}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
