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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn, formatTopic } from "@/lib/utils";
import { TOPIC_COLORS, TOPIC_SHADOWS, extractDomain } from "@/lib/constants";
import { ExternalLink, EyeOff, Check } from "lucide-react";
import { ListsDropdown } from "../lists/lists-dropdown";
import { DlesBadge } from "@/components/design/dles-badge";

/**
 * Check if a date is within the last N minutes
 */
function isWithinMinutes(date: Date, minutes: number): boolean {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  return diff < minutes * 60 * 1000;
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
  createdAt?: Date;
  index?: number;
  minimal?: boolean;
  newGameMinutes?: number;
  embedSupported?: boolean;
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
  createdAt,
  index = 0,
  minimal = false,
  newGameMinutes = 10080, // Default 7 days
  embedSupported = true,
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
      style={{
        animationDelay: `${index * 30}ms`,
        animationFillMode: "both",
      }}
      className={cn(
        "cursor-pointer transition-all duration-200 ease-out group relative overflow-hidden border-border h-full flex flex-col justify-center",
        "animate-in fade-in slide-in-from-bottom-2 duration-200",
        "hover:-translate-y-0.5",
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
            {embedSupported === false && (
              <ExternalLink className="h-2.5 w-2.5 shrink-0 text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-all" />
            )}
          </span>
          {isPlayed && (
            <span className="flex items-center text-muted-foreground shrink-0">
              <Check className="h-2.5 w-2.5" />
            </span>
          )}
        </div>

        {/* Link row */}
        <CardDescription className="truncate font-mono text-[9px]">
          {extractDomain(link)}
        </CardDescription>

        {/* Badge and actions row */}
        <div className="flex items-center justify-between gap-0.5">
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
              {onHide && (
                <button
                  onClick={handleHide}
                  className={cn(
                    "p-0.5 rounded-md text-muted-foreground shrink-0",
                    "opacity-0 group-hover:opacity-100 transition-opacity",
                    "hover:bg-muted hover:text-foreground"
                  )}
                >
                  <EyeOff className="h-2.5 w-2.5" />
                </button>
              )}
            </div>
          )}
        </div>
      </CardHeader>
    </Card>
  );

  return cardContent;
});
