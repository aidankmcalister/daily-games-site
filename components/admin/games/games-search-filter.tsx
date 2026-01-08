"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DlesSelect } from "@/components/design/dles-select";
import { TOPICS } from "@/lib/constants";
import { cn, formatTopic } from "@/lib/utils";
import type { Topic } from "@/app/generated/prisma/client";
import {
  ArrowDownAZ,
  Clock,
  LayoutGrid,
  Archive,
  TrendingUp,
} from "lucide-react";
import { DlesButton } from "@/components/design/dles-button";

interface GamesSearchFilterProps {
  search: string;
  onSearchChange: (value: string) => void;
  topicFilter: string[];
  onTopicFilterChange: (value: string[]) => void;
  sortBy: string;
  sortOrder: "asc" | "desc";
  onSortChange: (sortBy: any, sortOrder: "asc" | "desc") => void;
  showArchived: boolean;
  onShowArchivedToggle: () => void;
}

export function GamesSearchFilter({
  search,
  onSearchChange,
  topicFilter,
  onTopicFilterChange,
  sortBy,
  sortOrder,
  onSortChange,
  showArchived,
  onShowArchivedToggle,
}: GamesSearchFilterProps) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center">
      {/* Search Row */}
      <Input
        placeholder="Search games..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="h-9 text-xs bg-background/50 border-border/20 focus:border-primary/50 w-full md:flex-1 md:w-auto font-mono placeholder:text-muted-foreground/50 transition-colors hover:bg-background/80"
      />

      {/* Filters Grid */}
      <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center md:w-auto">
        <DlesSelect
          multi
          topics
          value={topicFilter.length === 0 ? ["all"] : topicFilter}
          onChange={onTopicFilterChange}
          placeholder="Topic"
          className="w-full sm:w-[160px] h-9"
        />
        <Select
          value={sortBy}
          onValueChange={(v) => onSortChange(v, sortOrder)}
        >
          <SelectTrigger
            size="lg"
            className={cn(
              "w-full sm:w-[140px] h-9 text-xs bg-background/50 border-border/20 hover:border-primary/50 hover:bg-background/80 transition-all",
              sortBy !== "title" && "border-primary/50 text-primary"
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

        <DlesButton
          isActive={showArchived}
          onClick={onShowArchivedToggle}
          className="col-span-2 sm:col-span-1 w-full sm:w-auto mt-1 sm:mt-0"
        >
          <Archive className="h-3.5 w-3.5" />
          {showArchived ? "Hide Archived" : "Show Archived"}
        </DlesButton>
      </div>
    </div>
  );
}
