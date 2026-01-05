"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MultiSelect } from "@/components/ui/multi-select";
import { DlesTopic } from "@/components/dles-topic";
import { TOPICS } from "@/lib/constants";
import { cn, formatTopic } from "@/lib/utils";
import type { Topic } from "@/app/generated/prisma/client";
import { ArrowDownAZ, Clock, LayoutGrid, Archive } from "lucide-react";
import { DlesButton } from "@/components/ui/dles-button";

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
    <div className="flex flex-col sm:flex-row gap-2">
      <div className="flex-1 flex gap-2">
        <Input
          placeholder="Search games..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="flex-1 h-10 text-xs border-primary/20 hover:border-primary/50 focus:border-primary/50"
        />
        <DlesButton isActive={showArchived} onClick={onShowArchivedToggle}>
          <Archive className="h-3.5 w-3.5" />
          {showArchived ? "Hide Archived" : "Show Archived"}
        </DlesButton>
      </div>
      <div className="flex gap-2">
        <MultiSelect
          options={[
            { value: "all", label: "All Topics" },
            ...TOPICS.map((t) => ({ value: t, label: formatTopic(t) })),
          ]}
          value={topicFilter.length === 0 ? ["all"] : topicFilter}
          onChange={(newTopics) => {
            // Normalize: treat empty topicFilter as ["all"] for comparison
            const effectiveCurrentTopics =
              topicFilter.length === 0 ? ["all"] : topicFilter;

            // If "all" is newly selected (wasn't in previous filter), clear others
            if (
              newTopics.includes("all") &&
              !effectiveCurrentTopics.includes("all")
            ) {
              onTopicFilterChange([]);
              return;
            }

            // If "all" was present and we selected something else, remove "all"
            if (
              effectiveCurrentTopics.includes("all") &&
              newTopics.length > 1
            ) {
              onTopicFilterChange(newTopics.filter((t) => t !== "all"));
              return;
            }

            // If we deselected everything, revert to empty (which displays as "all")
            if (newTopics.length === 0) {
              onTopicFilterChange([]);
              return;
            }

            onTopicFilterChange(newTopics);
          }}
          placeholder="Topic"
          className="w-[160px] h-10"
          renderLabel={(option) => (
            <DlesTopic
              topic={option.value}
              className="text-[10px] px-1.5 h-5 pointer-events-none"
            />
          )}
          renderSelectedItem={(option) => (
            <DlesTopic topic={option.value} className="text-[9px] px-1 h-4" />
          )}
        />
        <Select
          value={sortBy}
          onValueChange={(v) => onSortChange(v, sortOrder)}
        >
          <SelectTrigger
            size="lg"
            className={cn(
              "w-[140px] h-10 text-xs border-primary/20 hover:border-primary/50 hover:bg-primary/5",
              sortBy !== "title" && "bg-primary/5"
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
    </div>
  );
}
