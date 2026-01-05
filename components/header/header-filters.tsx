"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TOPICS } from "@/lib/constants";
import { Tag, Library, ArrowDownAZ, LayoutGrid, Clock } from "lucide-react";
import { GameList } from "@/lib/use-lists";

type SortOption = "title" | "topic" | "played";

interface HeaderFiltersProps {
  topicFilter: string;
  onTopicFilterChange: (topic: string) => void;
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
  return (
    <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
      {isAuthenticated && lists.length > 0 && (
        <Select value={listFilter} onValueChange={onListFilterChange}>
          <SelectTrigger
            size="lg"
            className={`w-[160px] h-10 text-sm ${
              !isCompact && listFilter !== "all"
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

      <Select value={topicFilter} onValueChange={onTopicFilterChange}>
        <SelectTrigger
          size="lg"
          className={`w-[160px] h-10 text-sm ${
            !isCompact && topicFilter !== "all"
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
            !isCompact && sortBy !== "title"
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
  );
}
