"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DlesButton } from "@/components/design/dles-button";
import { Badge } from "@/components/ui/badge";
import { MultiSelect } from "@/components/ui/multi-select";
import { HeaderSearch } from "@/components/header/header-search";
import { DlesTopic } from "@/components/design/dles-topic";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
  allGames,
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
    <section className="transition-all duration-300">
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-bold flex items-center gap-3">
            <div className="flex items-center justify-center w-6 h-6 rounded-md bg-muted text-muted-foreground text-[10px] font-black">
              2
            </div>
            Select Games
            <Badge className="ml-1 font-bold rounded-full px-2 py-0 border-none bg-primary/10 text-primary text-[10px]">
              {selectedGameIds.length} Picked
            </Badge>
          </h2>
          <div className="flex items-center gap-2">
            <DlesButton size="sm" onClick={onSelectAll} className="text-[10px]">
              Select All
            </DlesButton>
            <DlesButton
              variant="ghost"
              size="sm"
              onClick={onClear}
              className="text-[10px] text-muted-foreground hover:text-destructive"
            >
              Clear
            </DlesButton>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-2">
          <HeaderSearch
            query={searchQuery}
            onChange={onSearchChange}
            className="flex-1"
            showKbd
          />
          <MultiSelect
            options={[
              { value: "all", label: "All Topics" },
              ...topics.map((t) => ({ value: t, label: formatTopic(t) })),
            ]}
            value={selectedTopics.length === 0 ? ["all"] : selectedTopics}
            onChange={(newTopics) => {
              // Logic for handling "all" selection behavior is simpler to keep in parent
              // but we can just pass the raw newTopics to parent to handle the "all" logic
              // or handle filtering in parent. The props name suggests parent handles change.
              // We will just pass the newTopics up.
              onTopicChange(newTopics);
            }}
            placeholder="Category"
            className="w-[200px]"
            renderLabel={(option) => (
              <DlesTopic
                topic={option.value}
                className="text-[10px] px-1.5 h-5 pointer-events-none"
              />
            )}
            renderSelectedItem={(option) => (
              <DlesTopic topic={option.value} className="gap-1" />
            )}
          />
        </div>

        <div className="pt-2">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground/20" />
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/20">
                Loading Library...
              </p>
            </div>
          ) : filteredGames.length === 0 ? (
            <div className="text-center py-20 bg-muted/50 rounded-xl border border-dashed border-border">
              <p className="text-xs font-bold text-muted-foreground/30">
                No games found
              </p>
            </div>
          ) : (
            <TooltipProvider delayDuration={300}>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {filteredGames.map((game) => {
                  const isSelected = selectedGameIds.includes(game.id);
                  return (
                    <Tooltip key={game.id}>
                      <TooltipTrigger asChild>
                        <div
                          onClick={() => onToggleGame(game.id)}
                          className={cn(
                            "group relative flex items-center gap-3 p-4 rounded-xl border transition-all cursor-pointer select-none h-20",
                            "hover:shadow-lg hover:-translate-y-0.5 hover:border-primary/30",
                            isSelected
                              ? "border-primary/40 bg-primary/5 ring-1 ring-primary/10"
                              : "border-border bg-card"
                          )}
                        >
                          <div
                            className={cn(
                              "flex items-center justify-center h-4 w-4 rounded-sm border transition-all shrink-0",
                              isSelected
                                ? "bg-primary border-primary"
                                : "bg-muted/40 border-border"
                            )}
                          >
                            {isSelected && (
                              <Check className="h-2.5 w-2.5 text-primary-foreground" />
                            )}
                          </div>
                          <div className="flex flex-col gap-2 min-w-0">
                            <span
                              className={cn(
                                "font-bold text-sm tracking-tight truncate leading-tight transition-colors",
                                isSelected ? "text-primary" : "text-foreground"
                              )}
                            >
                              {game.title}
                            </span>
                            <DlesTopic
                              topic={game.topic}
                              className="text-[9px] px-2 py-0 h-4 rounded-sm"
                            />
                          </div>
                        </div>
                      </TooltipTrigger>
                      {game.description && (
                        <TooltipContent side="top" className="max-w-xs text-xs">
                          {game.description}
                        </TooltipContent>
                      )}
                    </Tooltip>
                  );
                })}
              </div>
            </TooltipProvider>
          )}
        </div>
      </div>
    </section>
  );
}
