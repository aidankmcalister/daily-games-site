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
import { TOPICS } from "@/lib/constants";
import type { Topic } from "@/app/generated/prisma/client";

interface GamesSearchFilterProps {
  search: string;
  onSearchChange: (value: string) => void;
  topicFilter: Topic | "all";
  onTopicFilterChange: (value: Topic | "all") => void;
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
        <Select
          value={topicFilter}
          onValueChange={(value) => onTopicFilterChange(value as Topic | "all")}
        >
          <SelectTrigger className="w-[140px] h-9 text-xs">
            <SelectValue placeholder="Topic" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Topics</SelectItem>
            {TOPICS.map((topic) => (
              <SelectItem key={topic} value={topic} className="capitalize">
                {topic}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
