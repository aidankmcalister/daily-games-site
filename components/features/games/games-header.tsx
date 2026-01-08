"use client";

import { useState, useEffect, useRef } from "react";
import { Eye, EyeOff, Dices } from "lucide-react";
import { DlesButton } from "@/components/design/dles-button";
import { cn } from "@/lib/utils";

import { GameList } from "@/lib/use-lists";
import { HeaderSearch } from "../../header/header-search";
import { HeaderFilters } from "./games-filters";

type SortOption = "title" | "topic" | "played" | "playCount";

interface GamesHeaderProps {
  playedCount: number;
  totalCount: number;
  filteredCount: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  topicFilter: string[];
  onTopicFilterChange: (topic: string[]) => void;
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

/**
 * Games toolbar with search, filters, and actions.
 * Logo/nav/user are now handled by the global SiteHeader.
 */
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
      {/* TOOLBAR */}
      <div ref={headerRef} className="mb-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          {/* Search */}
          <div className="w-full md:w-[280px] lg:w-[320px] shrink-0">
            <HeaderSearch
              query={searchQuery}
              onChange={onSearchChange}
              className="w-full"
              id="search-input-main"
              showKbd
            />
          </div>

          {/* Filters */}
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

          {/* Right side actions */}
          <div className="flex items-center gap-2 md:ml-auto">
            {/* Show Hidden Toggle */}
            {isAuthenticated && hiddenCount > 0 && onShowHiddenChange && (
              <DlesButton
                variant="ghost"
                size="icon-sm"
                onClick={() => onShowHiddenChange(!showHidden)}
                className={cn(
                  showHidden
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground"
                )}
                title={showHidden ? "Hide hidden games" : "Show hidden games"}
              >
                {showHidden ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </DlesButton>
            )}

            {/* Feeling Lucky */}
            <DlesButton onClick={onRandom} className="gap-2">
              <Dices className="h-4 w-4" />
              <span className="hidden sm:inline">Feeling Lucky</span>
              <span className="sm:hidden">Lucky</span>
            </DlesButton>
          </div>
        </div>
      </div>

      {/* COMPACT TOOLBAR (on scroll) */}
      <div
        className={`fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/40 transition-transform duration-300 ease-in-out ${
          isScrolled ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="px-4 md:px-8 lg:px-12">
          <div className="mx-auto max-w-7xl py-2">
            <div className="flex items-center gap-4">
              {/* Search (compact) */}
              <HeaderSearch
                query={searchQuery}
                onChange={onSearchChange}
                className="w-48 hidden md:flex"
              />

              {/* Right side */}
              <div className="flex items-center gap-3 ml-auto">
                <DlesButton
                  variant="ghost"
                  size="icon-sm"
                  onClick={onRandom}
                  title="Feeling Lucky"
                  className="text-primary"
                >
                  <Dices className="h-4 w-4" />
                </DlesButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
