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
import { ArrowDownAZ, LayoutGrid, Clock, TrendingUp } from "lucide-react";
import { GameList } from "@/lib/use-lists";
import { cn } from "@/lib/utils";

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
    const effectiveCurrentTopics =
      topicFilter.length === 0 ? ["all"] : topicFilter;

    if (newTopics.includes("all") && !effectiveCurrentTopics.includes("all")) {
      onTopicFilterChange(["all"]);
      return;
    }

    if (effectiveCurrentTopics.includes("all") && newTopics.length > 1) {
      onTopicFilterChange(newTopics.filter((t) => t !== "all"));
      return;
    }

    if (newTopics.length === 0) {
      onTopicFilterChange([]);
      return;
    }

    onTopicFilterChange(newTopics);
  };

  // Standard width for all filters
  const filterWidth = "w-full md:w-50";

  return (
    <div className="flex flex-wrap gap-2 flex-1 md:flex-initial">
      {/* Lists (authenticated only) */}
      {isAuthenticated && lists.length > 0 && (
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
          placeholder="All Lists"
          className={cn(
            filterWidth,
            "h-10 text-sm",
            !isCompact &&
              listFilter !== "all" &&
              "border-primary/50 bg-primary/5"
          )}
          renderSelected={(option) => {
            const list = lists.find((l) => l.id === option.value);
            return (
              <DlesBadge
                text={option.label}
                color={option.color || "brand"}
                count={option.value !== "all" ? list?.games.length : undefined}
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
                count={option.value !== "all" ? list?.games.length : undefined}
                size="sm"
              />
            );
          }}
        />
      )}

      {/* Topics */}
      <DlesSelect
        multi
        topics
        value={topicFilter.length === 0 ? ["all"] : topicFilter}
        onChange={handleTopicChange}
        placeholder="All Topics"
        className={cn(
          filterWidth,
          "h-10",
          !isCompact &&
            topicFilter.length > 0 &&
            !topicFilter.includes("all") &&
            "border-primary/50 bg-primary/5"
        )}
      />

      {/* Sort */}
      <Select
        value={sortBy}
        onValueChange={(v) => onSortChange(v as SortOption)}
      >
        <SelectTrigger
          size="lg"
          className={cn(
            filterWidth,
            "text-xs h-10 bg-muted/40 border-border/40 hover:border-border hover:bg-muted/60",
            !isCompact &&
              sortBy !== "playCount" &&
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
