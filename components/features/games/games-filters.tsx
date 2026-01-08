"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DlesSelect } from "@/components/design/dles-select";
import { DlesBadge } from "@/components/design/dles-badge";
import { TOPICS } from "@/lib/constants";
import { ArrowDownAZ, LayoutGrid, Clock, TrendingUp } from "lucide-react";
import { GameList } from "@/lib/use-lists";
import { cn, formatTopic } from "@/lib/utils";

type SortOption = "title" | "topic" | "played" | "playCount";

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

  return (
    <div className="grid grid-cols-2 gap-2 w-full md:flex md:w-auto md:gap-2">
      {isAuthenticated && lists.length > 0 && (
        <div className="col-span-2 md:col-span-1 md:w-auto">
          <DlesSelect
            value={listFilter}
            onChange={(val) => onListFilterChange(val)}
            options={[
              { value: "all", label: "All Lists", color: "brand" },
              ...lists.map((l) => ({
                value: l.id,
                label: l.name,
                color: l.color || "slate",
              })),
            ]}
            placeholder="All Games"
            className={cn(
              "w-full md:w-[200px] h-10 text-sm border-primary/20",
              !isCompact && listFilter !== "all" && "bg-primary/5"
            )}
            renderSelected={(option) => {
              const list = lists.find((l) => l.id === option.value);
              return (
                <DlesBadge
                  text={option.label}
                  color={option.color || "brand"}
                  count={
                    option.value !== "all" ? list?.games.length : undefined
                  }
                  size="sm"
                />
              );
            }}
            renderOption={(option) => {
              const list = lists.find((l) => l.id === option.value);
              return (
                <DlesBadge
                  text={option.label}
                  color={option.color || "brand"}
                  count={
                    option.value !== "all" ? list?.games.length : undefined
                  }
                  size="sm"
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
          <SelectItem value="playCount">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span>Popularity</span>
            </div>
          </SelectItem>
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
