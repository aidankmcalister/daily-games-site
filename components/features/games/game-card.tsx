"use client";

import React from "react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { cn, formatTopic } from "@/lib/utils";
import { TOPIC_COLORS, TOPIC_SHADOWS, extractDomain } from "@/lib/constants";
import {
  ExternalLink,
  EyeOff,
  Check,
  Copy,
  CheckCircle,
  ListPlus,
} from "lucide-react";
import { ListsDropdown } from "../lists/lists-dropdown";
import { DlesBadge } from "@/components/design/dles-badge";
import { toast } from "sonner";

/**
 * Check if a date is within the last N minutes
 */
function isWithinMinutes(date: Date, minutes: number): boolean {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  return diff < minutes * 60 * 1000;
}

/**
 * Format relative time for display
 */
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return `${Math.floor(diffDays / 30)} months ago`;
}

export interface GameCardProps {
  id: string;
  title: string;
  description?: string;
  link: string;
  topic: string;
  playCount: number;
  isPlayed: boolean;
  onPlay: (id: string) => void;
  onHide?: (id: string) => void;
  onMarkPlayed?: (id: string) => void;
  onUnmarkPlayed?: (id: string) => void;
  createdAt?: Date;
  index?: number;
  minimal?: boolean;
  newGameMinutes?: number;
  embedSupported?: boolean;
  // Stats for tooltip
  lastPlayed?: Date | null;
  totalPlays?: number;
}

export const GameCard = React.memo(function GameCard({
  id,
  title,
  description,
  link,
  topic,
  isPlayed,
  onPlay,
  onHide,
  onMarkPlayed,
  onUnmarkPlayed,
  createdAt,
  index = 0,
  minimal = false,
  newGameMinutes = 10080, // Default 7 days
  embedSupported = true,
  lastPlayed,
  totalPlays,
}: GameCardProps) {
  const handleClick = () => {
    if (minimal) return;
    onPlay(id);
  };

  const handleHide = (e: React.MouseEvent) => {
    e.stopPropagation();
    onHide?.(id);
  };

  const isNew =
    createdAt && isWithinMinutes(new Date(createdAt), newGameMinutes);

  const cardContent = (
    <Card
      onClick={handleClick}
      role={minimal ? undefined : "button"}
      tabIndex={minimal ? undefined : 0}
      onKeyDown={
        minimal
          ? undefined
          : (e: React.KeyboardEvent) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleClick();
              }
            }
      }
      aria-label={
        minimal
          ? undefined
          : `Play ${title}${isPlayed ? ", already played today" : ""}`
      }
      style={{
        animationDelay: `${index * 30}ms`,
        animationFillMode: "both",
      }}
      className={cn(
        "cursor-pointer transition-all duration-200 ease-out group relative overflow-hidden border-border h-full flex flex-col justify-center",
        "animate-in fade-in slide-in-from-bottom-2 duration-200",
        "hover:-translate-y-0.5",
        !minimal &&
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none",
        isPlayed
          ? "bg-muted/40 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 border-dashed"
          : cn("bg-card hover:bg-card", TOPIC_COLORS[topic]) // Apply specific topic color style
      )}
    >
      {/* Corner NEW ribbon */}
      {isNew && !isPlayed && (
        <div
          className={cn(
            "absolute top-1 -right-8 w-24 h-4 text-white text-[8px] font-bold flex items-center justify-center rotate-45",
            TOPIC_COLORS[topic]
          )}
        >
          NEW
        </div>
      )}

      <CardHeader className="p-2 py-1 h-full flex flex-col justify-evenly overflow-hidden">
        {/* Title row */}
        <div className="flex items-center justify-between w-full">
          <span className="inline-flex items-center gap-1 min-w-0">
            <CardTitle
              className="text-xs font-semibold leading-tight truncate"
              title={title}
            >
              {title}
            </CardTitle>
            {isPlayed && (
              <Check className="h-3 w-3 p-0.5 rounded-full bg-emerald-500/80 text-white shrink-0" />
            )}
            {embedSupported === false && (
              <ExternalLink className="h-2.5 w-2.5 shrink-0 text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-all" />
            )}
          </span>
        </div>

        {/* Link row */}
        <CardDescription className="truncate font-mono text-[9px]">
          {extractDomain(link)}
        </CardDescription>

        {/* Badge and actions row */}
        <div className="flex items-center gap-0.5 justify-between w-full">
          <DlesBadge text={formatTopic(topic)} color={topic} size="xs" />
          {/* Actions */}
          {!minimal && (
            <div
              className="flex items-center gap-0.5"
              onClick={(e) => e.stopPropagation()}
            >
              <ListsDropdown
                gameId={id}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </div>
          )}
        </div>
      </CardHeader>
    </Card>
  );

  // Removed tooltip as requested

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(link);
    toast.success("URL copied", { description: link });
  };

  const handleMarkPlayed = () => {
    if (onMarkPlayed && !isPlayed) {
      onMarkPlayed(id);
      toast.success("Marked as played", { description: title });
    }
  };

  const handleUnmarkPlayed = () => {
    if (onUnmarkPlayed && isPlayed) {
      onUnmarkPlayed(id);
      toast.info("Unmarked as played", { description: title });
    }
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div>{cardContent}</div>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        {!isPlayed && onMarkPlayed && (
          <ContextMenuItem className="text-xs" onClick={handleMarkPlayed}>
            <CheckCircle className="h-2 w-2 mr-2" />
            Mark as Played
          </ContextMenuItem>
        )}
        {isPlayed && onUnmarkPlayed && (
          <ContextMenuItem className="text-xs" onClick={handleUnmarkPlayed}>
            <CheckCircle className="h-2 w-2 mr-2 opacity-50" />
            Unmark as Played
          </ContextMenuItem>
        )}
        <ContextMenuItem className="text-xs" onClick={handleCopyUrl}>
          <Copy className="h-2 w-2 mr-2" />
          Copy URL
        </ContextMenuItem>
        {onHide && (
          <>
            <ContextMenuSeparator />
            <ContextMenuItem className="text-xs" onClick={() => onHide(id)}>
              <EyeOff className="h-2 w-2 mr-2" />
              {isPlayed ? "Hide Game" : "Hide Game"}
            </ContextMenuItem>
          </>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
});
