"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Dices, Flag } from "lucide-react";

import { UserButton } from "@/components/user-button";
import { GameList } from "@/lib/use-lists";
import { HeaderSearch } from "./header/header-search";
import { HeaderFilters } from "./header/header-filters";
import { HeaderStats } from "./header/header-stats";

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

export function GamesHeader(props: GamesHeaderProps) {
  const {
    playedCount,
    totalCount,
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
  } = props;

  const headerRef = useRef<HTMLDivElement>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsScrolled(
          !entry.isIntersecting && entry.boundingClientRect.top < 0
        );
      },
      { threshold: 0, rootMargin: "-10px 0px 0px 0px" }
    );

    if (headerRef.current) observer.observe(headerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative">
      {/* FULL HEADER */}
      <div ref={headerRef} className="py-4 mb-6">
        <div className="-mx-4 px-4 md:-mx-8 md:px-8 lg:-mx-12 lg:px-12">
          <div className="mx-auto max-w-7xl space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">dles.fun</h1>
                <p className="text-muted-foreground mt-1">
                  A curated list of daily games my friends and I play.
                </p>
              </div>
              <div className="flex items-center gap-4">
                <HeaderStats
                  playedCount={playedCount}
                  totalCount={totalCount}
                  currentStreak={currentStreak}
                  onClear={onClear}
                  isAuthenticated={isAuthenticated}
                />
                {isAuthenticated && (
                  <span className="text-muted-foreground w-px h-4 bg-border hidden sm:block"></span>
                )}
                <UserButton />
              </div>
            </div>

            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
              <div className="flex flex-1 flex-col sm:flex-row items-center gap-3 w-full lg:w-auto min-w-0">
                <HeaderSearch
                  query={searchQuery}
                  onChange={onSearchChange}
                  className="w-full sm:max-w-xs md:max-w-sm lg:max-w-md shrink"
                  id="search-input-main"
                  showKbd
                />
                <HeaderFilters
                  topicFilter={topicFilter}
                  onTopicFilterChange={onTopicFilterChange}
                  listFilter={listFilter}
                  onListFilterChange={onListFilterChange}
                  lists={lists}
                  sortBy={sortBy}
                  onSortChange={onSortChange}
                  isAuthenticated={isAuthenticated}
                />
              </div>

              <div className="flex items-center gap-2 shrink-0 ml-auto lg:ml-0">
                <Button
                  variant="outline"
                  onClick={onRandom}
                  className="h-10 gap-2 border-primary/20 hover:border-primary/50 hover:bg-primary/5 transition-all hover:scale-105"
                >
                  <Dices className="h-4 w-4 text-primary" />
                  Feeling Lucky
                </Button>

                <Button
                  variant="outline"
                  className="h-10 gap-2 border-primary/20 hover:border-primary/50 hover:bg-primary/5 transition-all hover:scale-105"
                  asChild
                >
                  <Link href="/race/new">
                    <Flag className="h-4 w-4 text-primary" />
                    Race
                  </Link>
                </Button>

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

      {/* COMPACT HEADER */}
      <div
        className={`fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/40 shadow-sm transition-transform duration-300 ease-in-out ${
          isScrolled ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="px-4 md:px-8 lg:px-12">
          <div className="mx-auto max-w-7xl py-2">
            <div className="flex items-center gap-4">
              <HeaderSearch
                query={searchQuery}
                onChange={onSearchChange}
                className="flex-1 max-w-md"
              />

              <div className="hidden md:flex items-center gap-2">
                <HeaderFilters
                  topicFilter={topicFilter}
                  onTopicFilterChange={onTopicFilterChange}
                  listFilter={listFilter}
                  onListFilterChange={onListFilterChange}
                  lists={lists}
                  sortBy={sortBy}
                  onSortChange={onSortChange}
                  isAuthenticated={isAuthenticated}
                  isCompact
                />
              </div>

              <div className="h-4 w-px bg-border hidden md:block" />

              <div className="flex items-center gap-3 ml-auto">
                <HeaderStats
                  playedCount={playedCount}
                  totalCount={totalCount}
                  currentStreak={currentStreak}
                  onClear={onClear}
                  isAuthenticated={isAuthenticated}
                  isCompact
                />
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
