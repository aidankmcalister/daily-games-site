"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DlesSelect } from "@/components/design/dles-select";
import { HeaderSearch } from "@/components/header/header-search";
import { DlesTopic } from "@/components/design/dles-topic";
import { Loader2, Check } from "lucide-react";
import { cn, formatTopic } from "@/lib/utils";
import { Topic } from "@/app/generated/prisma/client";

interface Game {
  id: string;
  title: string;
  description: string;
  topic: Topic;
  archived?: boolean;
}

interface GameSelectorProps {
  allGames: Game[];
  selectedGameIds: string[];
  filteredGames: Game[];
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedTopics: string[];
  onTopicChange: (value: string[]) => void;
  isLoading: boolean;
  onToggleGame: (id: string) => void;
  onSelectAll: () => void;
  onClear: () => void;
  topics: string[];
}

export function GameSelector({
  selectedGameIds,
  filteredGames,
  searchQuery,
  onSearchChange,
  selectedTopics,
  onTopicChange,
  isLoading,
  onToggleGame,
  onSelectAll,
  onClear,
  topics,
}: GameSelectorProps) {
  return (
    <section className="space-y-4">
      {/* Search & Filter Row */}
      <div className="flex flex-col sm:flex-row gap-2">
        <HeaderSearch
          query={searchQuery}
          onChange={onSearchChange}
          className="flex-1"
        />
        <DlesSelect // Changed from MultiSelect to DlesSelect
          multi
          topics // Added topics prop
          value={selectedTopics.length === 0 ? ["all"] : selectedTopics}
          onChange={onTopicChange}
          placeholder="Filter"
          className="w-full sm:w-[180px]"
          // Removed options, renderLabel, and renderSelectedItem props
        />
      </div>

      {/* Game Grid */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground/30" />
          <p className="text-xs text-muted-foreground/50">Loading games...</p>
        </div>
      ) : filteredGames.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-lg">
          <p className="text-sm text-muted-foreground">No games found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {filteredGames.map((game) => {
            const isSelected = selectedGameIds.includes(game.id);
            return (
              <div
                key={game.id}
                onClick={() => onToggleGame(game.id)}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all select-none relative overflow-hidden",
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/30 hover:bg-muted/30"
                )}
              >
                <div
                  className={cn(
                    "flex items-center justify-center h-5 w-5 rounded border shrink-0 transition-colors",
                    isSelected
                      ? "bg-primary border-primary"
                      : "bg-muted/50 border-border"
                  )}
                >
                  {isSelected && (
                    <Check className="h-3 w-3 text-primary-foreground" />
                  )}
                </div>
                <span
                  className={cn(
                    "font-medium text-sm truncate flex-1",
                    isSelected ? "text-primary" : "text-foreground"
                  )}
                >
                  {game.title}
                </span>
                <DlesTopic topic={game.topic} className="ml-auto shrink-0" />
              </div>
            );
          })}
        </div>
      )}

      {/* Bulk actions */}
      {filteredGames.length > 0 && (
        <div className="flex items-center gap-2 pt-3 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-muted-foreground"
            onClick={onSelectAll}
          >
            Select all visible
          </Button>
          <span className="text-muted-foreground/30">|</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-muted-foreground hover:text-destructive"
            onClick={onClear}
          >
            Clear selection
          </Button>
          {selectedGameIds.length > 0 && (
            <Badge
              variant="secondary"
              className="ml-auto text-[10px] font-bold"
            >
              {selectedGameIds.length} selected
            </Badge>
          )}
        </div>
      )}
    </section>
  );
}
