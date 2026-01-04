"use client";

import { Input } from "@/components/ui/input";
import { useState, useEffect, useRef } from "react";
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
import { TOPICS } from "@/lib/constants";
import Link from "next/link";
import {
  Search,
  X,
  RotateCcw,
  Flame,
  Eye,
  EyeOff,
  TrendingUp,
  Library,
  Tag,
  ArrowDownAZ,
  Clock,
  LayoutGrid,
  Dices,
} from "lucide-react";

import { UserButton } from "@/components/user-button";
import { GameList } from "@/lib/use-lists";

type SortOption = "title" | "topic" | "played";

interface GamesHeaderProps {
  playedCount: number;
  totalCount: number;
  filteredCount: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  topicFilter: string;
  onTopicFilterChange: (topic: string) => void;
  listFilter: string;
  onListFilterChange: (listId: string) => void;
  lists: GameList[];
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  onClear: () => void;
  onRandom: () => void;
  currentStreak?: number;
  showHidden?: boolean;
  onShowHiddenChange?: (show: boolean) => void;
  hiddenCount?: number;
  isAuthenticated?: boolean;
}

export function GamesHeader({
  playedCount,
  totalCount,
  filteredCount,
  searchQuery,
  onSearchChange,
  topicFilter,
  onTopicFilterChange,
  listFilter,
  onListFilterChange,
  lists,
  sortBy,
  onSortChange,
  onClear,
  onRandom,
  currentStreak = 0,
  showHidden = false,
  onShowHiddenChange,
  hiddenCount = 0,
  isAuthenticated = false,
}: GamesHeaderProps) {
  const headerRef = useRef<HTMLDivElement>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Show compact header only when the main header is completely out of view (scrolled past)
        setIsScrolled(
          !entry.isIntersecting && entry.boundingClientRect.top < 0
        );
      },
      {
        threshold: 0,
        rootMargin: "-10px 0px 0px 0px", // Slight offset to ensure smooth transition
      }
    );

    if (headerRef.current) {
      observer.observe(headerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative">
      {/* FULL HEADER (Static - always rendered in flow) */}
      <div ref={headerRef} className="py-4 mb-6">
        <div className="-mx-4 px-4 md:-mx-8 md:px-8 lg:-mx-12 lg:px-12">
          <div className="mx-auto max-w-7xl space-y-6">
            {/* ROW 1: Branding & Stats */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  Daily Games
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Progress resets at midnight.
                </p>
              </div>
              <div className="flex items-center gap-4">
                {isAuthenticated && (
                  <>
                    <div className="flex items-center gap-3 text-sm font-medium">
                      {currentStreak > 0 && (
                        <span className="flex items-center gap-1.5 text-orange-500 bg-orange-500/10 px-2.5 py-0.5 rounded-full border border-orange-500/20">
                          <Flame className="h-3.5 w-3.5 fill-current" />
                          {currentStreak}{" "}
                          <span className="hidden sm:inline">streak</span>
                        </span>
                      )}

                      {currentStreak > 0 && (
                        <span className="text-muted-foreground w-px h-4 bg-border hidden sm:block"></span>
                      )}

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button
                            className="flex flex-col items-end sm:items-start group cursor-pointer hover:opacity-80 transition-opacity text-left"
                            title="Reset Daily Progress"
                          >
                            <span className="text-foreground text-sm font-medium group-hover:text-destructive transition-colors">
                              {playedCount}/{totalCount} played
                            </span>
                            {/* Mini Progress Bar */}
                            <div className="h-1.5 w-24 bg-secondary rounded-full overflow-hidden mt-1">
                              <div
                                className="h-full bg-primary transition-all group-hover:bg-destructive"
                                style={{
                                  width: `${
                                    (playedCount / Math.max(totalCount, 1)) *
                                    100
                                  }%`,
                                }}
                              />
                            </div>
                          </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Reset daily progress?
                            </AlertDialogTitle>
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
                    </div>
                    <span className="text-muted-foreground w-px h-4 bg-border hidden sm:block"></span>
                  </>
                )}
                <UserButton />
              </div>
            </div>

            {/* ROW 2: Controls (Search + Filters + Actions) */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
              {/* Left Group: Search + Filters */}
              <div className="flex flex-1 flex-col sm:flex-row items-center gap-3 w-full lg:w-auto min-w-0">
                {/* Search */}
                <div className="relative w-full sm:max-w-xs md:max-w-sm lg:max-w-md shrink group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none" />
                  <Input
                    id="search-input-main"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="h-10 pl-9 pr-8 text-sm bg-background/50 focus:bg-background w-full"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    {searchQuery && (
                      <button
                        onClick={() => onSearchChange("")}
                        className="text-muted-foreground hover:text-foreground p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                    <kbd className="hidden sm:inline-flex h-4 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                      <span className="text-xs">/</span>
                    </kbd>
                  </div>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
                  {isAuthenticated && lists.length > 0 && (
                    <Select
                      value={listFilter}
                      onValueChange={onListFilterChange}
                    >
                      <SelectTrigger
                        size="lg"
                        className={`w-[160px] h-10 text-sm ${
                          listFilter !== "all"
                            ? "border-primary bg-primary/5 text-primary"
                            : ""
                        }`}
                      >
                        <SelectValue placeholder="All Games" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">
                          <div className="flex items-center gap-2">
                            <Library className="h-4 w-4" />
                            <span>All Games</span>
                          </div>
                        </SelectItem>
                        {lists.map((l) => (
                          <SelectItem key={l.id} value={l.id}>
                            {l.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  <Select
                    value={topicFilter}
                    onValueChange={onTopicFilterChange}
                  >
                    <SelectTrigger
                      size="lg"
                      className={`w-[160px] h-10 text-sm ${
                        topicFilter !== "all"
                          ? "border-primary bg-primary/5 text-primary"
                          : ""
                      }`}
                    >
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        <div className="flex items-center gap-2">
                          <Tag className="h-4 w-4" />
                          <span>All Topics</span>
                        </div>
                      </SelectItem>
                      {TOPICS.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t.charAt(0).toUpperCase() + t.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={sortBy}
                    onValueChange={(v) => onSortChange(v as SortOption)}
                  >
                    <SelectTrigger
                      size="lg"
                      className={`w-[110px] h-10 text-sm ${
                        sortBy !== "title"
                          ? "border-primary bg-primary/5 text-primary"
                          : ""
                      }`}
                    >
                      <SelectValue placeholder="Sort" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="title">
                        <div className="flex items-center gap-2">
                          <ArrowDownAZ className="h-4 w-4" />
                          <span>A-Z</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="topic">
                        <div className="flex items-center gap-2">
                          <LayoutGrid className="h-4 w-4" />
                          <span>Category</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="played">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>Unplayed</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Right Group: Actions */}
              <div className="flex items-center gap-2 shrink-0 ml-auto lg:ml-0">
                <Button
                  variant="outline"
                  onClick={onRandom}
                  className="h-10 gap-2 border-primary/20 hover:border-primary/50 hover:bg-primary/5 transition-all hover:scale-105"
                >
                  <Dices className="h-4 w-4 text-primary" />
                  Feeling Lucky
                </Button>

                {/* Show hidden toggle */}
                {isAuthenticated && hiddenCount > 0 && onShowHiddenChange && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onShowHiddenChange(!showHidden)}
                    className={`h-10 w-10 ${
                      showHidden
                        ? "text-primary bg-primary/10"
                        : "text-muted-foreground"
                    }`}
                    title={
                      showHidden ? "Hide hidden games" : "Show hidden games"
                    }
                  >
                    {showHidden ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* COMPACT HEADER (Fixed Overlay - Slides in) */}
      <div
        className={`fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/40 shadow-sm transition-transform duration-300 ease-in-out ${
          isScrolled ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="px-4 md:px-8 lg:px-12">
          <div className="mx-auto max-w-7xl py-2">
            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="h-10 pl-9 pr-8 text-sm bg-background/50 focus:bg-background"
                />
                {searchQuery && (
                  <button
                    onClick={() => onSearchChange("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>

              {/* Compact Controls */}
              <div className="hidden md:flex items-center gap-2">
                {isAuthenticated && lists.length > 0 && (
                  <Select value={listFilter} onValueChange={onListFilterChange}>
                    <SelectTrigger size="lg" className="w-[140px] h-10 text-sm">
                      <SelectValue placeholder="All Games" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        <div className="flex items-center gap-2">
                          <Library className="h-4 w-4" />
                          <span>All Games</span>
                        </div>
                      </SelectItem>
                      {lists.map((l) => (
                        <SelectItem key={l.id} value={l.id}>
                          {l.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                <Select value={topicFilter} onValueChange={onTopicFilterChange}>
                  <SelectTrigger size="lg" className="w-[160px] h-10 text-sm">
                    <SelectValue placeholder="Topic" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4" />
                        <span>All Topics</span>
                      </div>
                    </SelectItem>
                    {TOPICS.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={sortBy}
                  onValueChange={(v) => onSortChange(v as SortOption)}
                >
                  <SelectTrigger size="lg" className="w-[120px] h-10 text-sm">
                    <SelectValue placeholder="Sort" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="title">
                      <div className="flex items-center gap-2">
                        <ArrowDownAZ className="h-4 w-4" />
                        <span>A-Z</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="played">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>Unplayed</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="h-4 w-px bg-border hidden md:block" />

              {/* Stats & Actions */}
              <div className="flex items-center gap-3 ml-auto">
                {isAuthenticated && (
                  <div className="flex items-center gap-3 text-xs font-medium text-muted-foreground whitespace-nowrap">
                    {currentStreak > 0 && (
                      <span className="flex items-center gap-1 text-orange-500">
                        <Flame className="h-3.5 w-3.5 fill-current" />
                        {currentStreak}
                      </span>
                    )}
                    <span>
                      {playedCount}/{totalCount}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 text-primary"
                    onClick={onRandom}
                    title="Feeling Lucky"
                  >
                    <Dices className="h-4 w-4" />
                  </Button>
                  <UserButton />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
