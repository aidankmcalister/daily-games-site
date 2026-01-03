"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { ThemeToggle } from "@/components/theme-toggle";
import type { Topic } from "@/app/generated/prisma/client";
import { TOPICS } from "@/lib/constants";
import { Search, X, RotateCcw, Plus } from "lucide-react";

type SortOption = "title" | "topic" | "played";

interface GamesHeaderProps {
  playedCount: number;
  totalCount: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  topicFilter: string;
  onTopicFilterChange: (topic: string) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  onClear: () => void;
}

export function GamesHeader({
  playedCount,
  totalCount,
  searchQuery,
  onSearchChange,
  topicFilter,
  onTopicFilterChange,
  sortBy,
  onSortChange,
  onClear,
}: GamesHeaderProps) {
  const router = useRouter();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newGameTitle, setNewGameTitle] = useState("");
  const [newGameLink, setNewGameLink] = useState("");
  const [newGameTopic, setNewGameTopic] = useState<Topic>("puzzle");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddGame = async () => {
    if (!newGameTitle.trim() || !newGameLink.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/games", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newGameTitle.trim(),
          link: newGameLink.trim(),
          topic: newGameTopic,
        }),
      });
      if (res.ok) {
        setNewGameTitle("");
        setNewGameLink("");
        setNewGameTopic("puzzle");
        setAddDialogOpen(false);
        router.refresh();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Badge variant="outline" className="text-sm">
          {playedCount}/{totalCount} played
        </Badge>

        {playedCount > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="h-3 w-3" />
                Clear
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear all progress?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will reset your played status for all games today.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={onClear}>Clear</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

        <div className="ml-auto flex items-center gap-2">
          <AlertDialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 text-xs"
              >
                <Plus className="h-3 w-3" />
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
                    value={newGameTitle}
                    onChange={(e) => setNewGameTitle(e.target.value)}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="game-link">Link</FieldLabel>
                  <Input
                    id="game-link"
                    placeholder="https://example.com/game"
                    value={newGameLink}
                    onChange={(e) => setNewGameLink(e.target.value)}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="game-topic">Category</FieldLabel>
                  <Select
                    value={newGameTopic}
                    onValueChange={(v) => setNewGameTopic(v as Topic)}
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
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <Button
                  onClick={handleAddGame}
                  disabled={
                    isSubmitting || !newGameTitle.trim() || !newGameLink.trim()
                  }
                >
                  {isSubmitting ? "Adding..." : "Add Game"}
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <ThemeToggle />
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search games..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 pr-9"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 sm:flex sm:shrink-0">
          <Select value={topicFilter} onValueChange={onTopicFilterChange}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Topics</SelectItem>
              {TOPICS.map((t) => (
                <SelectItem key={t} value={t} className="capitalize">
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={sortBy}
            onValueChange={(v) => onSortChange(v as SortOption)}
          >
            <SelectTrigger className="w-full sm:w-[160px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="title">A-Z</SelectItem>
              <SelectItem value="topic">Category</SelectItem>
              <SelectItem value="played">Unplayed First</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
