"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import { formatTopic } from "@/lib/utils";
import type { Topic } from "@/app/generated/prisma/client";

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
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="flex-1 flex gap-2">
        <Input
          placeholder="Search games..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="flex-1 h-9"
        />
        <Button
          variant={showArchived ? "secondary" : "outline"}
          size="sm"
          onClick={onShowArchivedToggle}
          className="h-9 whitespace-nowrap"
        >
          {showArchived ? "Hide Archived" : "Show Archived"}
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
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
          className="w-[180px] h-9"
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
          value={`${sortBy}-${sortOrder}`}
          onValueChange={(value) => {
            const [newSortBy, newOrder] = value.split("-") as [
              any,
              "asc" | "desc"
            ];
            onSortChange(newSortBy, newOrder);
          }}
        >
          <SelectTrigger className="w-[140px] h-9 text-xs">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="title-asc">Title (A-Z)</SelectItem>
            <SelectItem value="title-desc">Title (Z-A)</SelectItem>
            <SelectItem value="playCount-desc">Most Played</SelectItem>
            <SelectItem value="createdAt-desc">Newest First</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
