"use client";

import { useState, useEffect, useRef } from "react";
import { Dices, Eye, EyeOff, MonitorPlay } from "lucide-react";
import { DlesButton } from "@/components/design/dles-button";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";

import { GameList } from "@/lib/use-lists";
import { HeaderSearch } from "../../header/header-search";
import { HeaderFilters } from "./games-filters";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
  embedOnly?: boolean;
  onEmbedOnlyChange?: (embedOnly: boolean) => void;
}

/**
 * Games toolbar with search, filters, and actions.
 */
export function GamesHeader(props: GamesHeaderProps) {
  const {
    searchQuery,
    onSearchChange,
    topicFilter,
    onTopicFilterChange,
    listFilter,
    onListFilterChange,
    lists,
    sortBy,
    onSortChange,
    onRandom,
    showHidden = false,
    onShowHiddenChange,
    hiddenCount = 0,
    isAuthenticated = false,
    embedOnly = false,
    onEmbedOnlyChange,
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
        <div className="flex flex-col gap-3">
          {/* Row 1: Search + Filters */}
          <div className="flex flex-col md:flex-row gap-2 md:items-center">
            {/* Search */}
            <div className="w-full md:flex-1 md:max-w-md shrink-0">
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

            {/* Actions */}
            <div className="flex items-center gap-2 md:ml-auto shrink-0">
              <TooltipProvider delayDuration={200}>
                {/* In-Modal Toggle */}
                {onEmbedOnlyChange && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className={cn(
                          "flex items-center gap-2 px-3 h-10 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer select-none",
                          embedOnly && "border-primary/50 bg-primary/5"
                        )}
                        onClick={() => onEmbedOnlyChange(!embedOnly)}
                      >
                        <MonitorPlay className="h-3.5 w-3.5" />
                        <span className="text-xs font-medium hidden sm:inline">
                          In-Modal
                        </span>
                        <Switch
                          checked={embedOnly}
                          className="scale-75 ml-1 origin-center pointer-events-none"
                          aria-label="Toggle in-modal games"
                        />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      {embedOnly
                        ? "Showing games that only play in modal"
                        : "Filter to games that only play in modal"}
                    </TooltipContent>
                  </Tooltip>
                )}

                {/* Show Hidden Toggle */}
                {isAuthenticated && hiddenCount > 0 && onShowHiddenChange && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <DlesButton
                        variant={showHidden ? "default" : "outline"}
                        size="sm"
                        onClick={() => onShowHiddenChange(!showHidden)}
                        className={cn(
                          "gap-1.5 text-xs",
                          showHidden && "bg-primary text-primary-foreground"
                        )}
                      >
                        {showHidden ? (
                          <EyeOff className="h-3.5 w-3.5" />
                        ) : (
                          <Eye className="h-3.5 w-3.5" />
                        )}
                        <span className="hidden sm:inline">
                          {showHidden ? "Hidden" : "Hidden"}
                        </span>
                        <span className="text-[10px] opacity-70">
                          {hiddenCount}
                        </span>
                      </DlesButton>
                    </TooltipTrigger>
                    <TooltipContent>
                      {showHidden
                        ? "Showing hidden games"
                        : `Show ${hiddenCount} hidden games`}
                    </TooltipContent>
                  </Tooltip>
                )}

                {/* Feeling Lucky */}
                <DlesButton onClick={onRandom} className="gap-1.5">
                  <Dices className="h-4 w-4" />
                  <span className="hidden sm:inline">Feeling Lucky</span>
                  <span className="sm:hidden">Lucky</span>
                </DlesButton>
              </TooltipProvider>
            </div>
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
            <div className="flex items-center gap-2 md:gap-4">
              {/* Search (compact) */}
              <HeaderSearch
                query={searchQuery}
                onChange={onSearchChange}
                className="flex-1 max-w-md"
              />

              {/* Right side */}
              <div className="flex items-center gap-2 shrink-0">
                {/* In-Modal Toggle */}
                {onEmbedOnlyChange && (
                  <DlesButton
                    variant={embedOnly ? "default" : "ghost"}
                    size="icon-sm"
                    onClick={() => onEmbedOnlyChange(!embedOnly)}
                    title={
                      embedOnly
                        ? "Showing modal games"
                        : "Filter to modal games"
                    }
                    className={cn(
                      embedOnly && "bg-primary text-primary-foreground"
                    )}
                  >
                    <MonitorPlay className="h-4 w-4" />
                  </DlesButton>
                )}

                {/* Feeling Lucky */}
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
