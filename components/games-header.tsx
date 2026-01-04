"use client";

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
import { Button } from "@/components/ui/button";
import type { Topic } from "@/app/generated/prisma/client";
import { TOPICS } from "@/lib/constants";
import { Search, X, RotateCcw } from "lucide-react";

type SortOption = "title" | "topic" | "played";

interface GamesHeaderProps {
  playedCount: number;
  totalCount: number;
  filteredCount: number;
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
  filteredCount,
  searchQuery,
  onSearchChange,
  topicFilter,
  onTopicFilterChange,
  sortBy,
  onSortChange,
  onClear,
}: GamesHeaderProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        {/* Search - Grows to fill remaining space */}
        <div className="relative w-full sm:flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search games..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 pr-9 w-full"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          {!searchQuery && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
              {filteredCount} games
            </span>
          )}
        </div>

        {/* Filters and Progress - Fixed width/Shrink wrapped */}
        <div className="flex shrink-0 items-center gap-2 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
          <Select value={topicFilter} onValueChange={onTopicFilterChange}>
            <SelectTrigger className="w-[130px]">
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
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="title">A-Z</SelectItem>
              <SelectItem value="topic">Category</SelectItem>
              <SelectItem value="played">Unplayed First</SelectItem>
            </SelectContent>
          </Select>

          {/* Divider */}
          <div className="mx-1 h-6 w-px bg-border hidden sm:block" />

          {/* Progress Info */}
          <div className="flex items-center gap-2 whitespace-nowrap pl-1">
            <span className="text-sm text-muted-foreground font-medium">
              {playedCount}/{totalCount}
              <span className="hidden sm:inline"> played</span>
            </span>
            {playedCount > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    title="Reset Progress"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Reset daily progress?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will unmark all games as played for today.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={onClear}>
                      Reset
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
