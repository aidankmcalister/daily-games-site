"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MultiSelect } from "@/components/ui/multi-select";
import { DlesTopic } from "@/components/design/dles-topic";
import { TOPICS } from "@/lib/constants";
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
          <Select value={listFilter} onValueChange={onListFilterChange}>
            <SelectTrigger
              size="lg"
              className={cn(
                "w-full md:w-[160px] h-10 text-sm border-primary/20 hover:border-primary/50 hover:bg-primary/5",
                !isCompact && listFilter !== "all" && "bg-primary/5"
              )}
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
        </div>
      )}

      <MultiSelect
        options={topicOptions}
        value={topicFilter.length === 0 ? ["all"] : topicFilter}
        onChange={handleTopicChange}
        placeholder="Category"
        className={cn(
          "w-full md:w-[160px] lg:w-[220px]",
          !isCompact && topicFilter.length > 0 && !topicFilter.includes("all")
            ? "bg-primary/5"
            : ""
        )}
        renderLabel={(option) => (
          <DlesTopic
            topic={option.value}
            className="text-[10px] px-1.5 h-5 pointer-events-none"
          />
        )}
        renderSelectedItem={(option, onUnselect) => (
          <DlesTopic topic={option.value} className="gap-1 pointer-events-auto">
            {option.value !== "all" && (
              <button
                type="button"
                className="h-3 w-3 flex items-center justify-center opacity-60 hover:opacity-100 cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onUnselect();
                }}
              >
                <X className="size-2" />
              </button>
            )}
          </DlesTopic>
        )}
      />

      <Select
        value={sortBy}
        onValueChange={(v) => onSortChange(v as SortOption)}
      >
        <SelectTrigger
          size="lg"
          className={cn(
            "w-full md:w-[140px] text-xs h-10 border-primary/20 hover:border-primary/50 hover:bg-primary/5",
            !isCompact && sortBy !== "title" && "bg-primary/5"
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
