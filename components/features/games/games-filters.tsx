"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DlesSelect } from "@/components/design/dles-select";
import { DlesTopic } from "@/components/design/dles-topic";
import { ListChip } from "@/components/features/lists/list-chip";
import { TOPICS, LIST_CARD_STYLES } from "@/lib/constants";
import { Tag, Library, ArrowDownAZ, LayoutGrid, Clock, X } from "lucide-react";
import { GameList } from "@/lib/use-lists";
import { cn, formatTopic } from "@/lib/utils";

type SortOption = "title" | "topic" | "played";

interface HeaderFiltersProps {
  topicFilter: string[];
  onTopicFilterChange: (topic: string[]) => void;
  listFilter: string;
  onListFilterChange: (listId: string) => void;
  lists: GameList[];
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  isAuthenticated: boolean;
  isCompact?: boolean;
}

export function HeaderFilters({
  topicFilter,
  onTopicFilterChange,
  listFilter,
  onListFilterChange,
  lists,
  sortBy,
  onSortChange,
  isAuthenticated,
  isCompact = false,
}: HeaderFiltersProps) {
  const handleTopicChange = (newTopics: string[]) => {
    // Normalize: treat empty topicFilter as ["all"] for comparison purposes
    const effectiveCurrentTopics =
      topicFilter.length === 0 ? ["all"] : topicFilter;

    // If "all" is newly selected (it wasn't in previous filter), clear others
    if (newTopics.includes("all") && !effectiveCurrentTopics.includes("all")) {
      onTopicFilterChange(["all"]);
      return;
    }

    // If "all" was present and we selected something else, remove "all"
    if (effectiveCurrentTopics.includes("all") && newTopics.length > 1) {
      onTopicFilterChange(newTopics.filter((t) => t !== "all"));
      return;
    }

    // If we deselected everything, revert to empty (which displays as "all")
    if (newTopics.length === 0) {
      onTopicFilterChange([]);
      return;
    }

    onTopicFilterChange(newTopics);
  };

  const topicOptions = [
    { value: "all", label: "All Topics" },
    ...TOPICS.map((t) => ({ value: t, label: formatTopic(t) })),
  ];

  return (
    <div className="grid grid-cols-2 gap-2 w-full md:flex md:w-auto md:gap-2">
      {isAuthenticated && lists.length > 0 && (
        <div className="col-span-2 md:col-span-1 md:w-auto">
          <DlesSelect
            value={listFilter}
            onChange={(val) => onListFilterChange(val)}
            options={[
              { value: "all", label: "All Lists" },
              ...lists.map((l) => ({ value: l.id, label: l.name })),
            ]}
            placeholder="All Games"
            className={cn(
              "w-full md:w-[180px] h-10 text-sm border-primary/20",
              !isCompact && listFilter !== "all" && "bg-primary/5"
            )}
            renderSelected={(option) => {
              if (option.value === "all") {
                const totalGames = lists.reduce(
                  (acc, l) => acc + (l.games?.length || 0),
                  0
                );
                return (
                  <ListChip
                    label="All Lists"
                    count={totalGames}
                    color="slate"
                    className="w-full border-0 px-2"
                  />
                );
              }
              const list = lists.find((l) => l.id === option.value);
              const color = list?.color || "slate";
              return (
                <ListChip
                  label={option.label}
                  count={list?.games.length || 0}
                  color={color}
                  className="w-full border-0 px-2"
                />
              );
            }}
            renderOption={(option) => {
              if (option.value === "all") {
                const totalGames = lists.reduce(
                  (acc, l) => acc + (l.games?.length || 0),
                  0
                );
                return (
                  <ListChip
                    label="All Lists"
                    count={totalGames}
                    color="slate"
                  />
                );
              }
              const list = lists.find((l) => l.id === option.value);
              const color = list?.color || "slate";
              return (
                <ListChip
                  label={option.label}
                  count={list?.games.length || 0}
                  color={color}
                />
              );
            }}
          />
        </div>
      )}

      <DlesSelect
        multi
        topics
        value={topicFilter.length === 0 ? ["all"] : topicFilter}
        onChange={handleTopicChange}
        placeholder="Category"
        className={cn(
          "w-full md:w-[160px] lg:w-[260px]",
          !isCompact && topicFilter.length > 0 && !topicFilter.includes("all")
            ? "bg-primary/5"
            : ""
        )}
      />

      <Select
        value={sortBy}
        onValueChange={(v) => onSortChange(v as SortOption)}
      >
        <SelectTrigger
          size="lg"
          className={cn(
            "w-full md:w-[140px] text-xs h-10 bg-muted/40 border-border/40 hover:border-border hover:bg-muted/60",
            !isCompact &&
              sortBy !== "title" &&
              "border-primary/50 bg-primary/5 text-primary"
          )}
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
  );
}
