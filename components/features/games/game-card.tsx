"use client";

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
}

export function GameCard({
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
}: GameCardProps) {
  const handleClick = () => {
    if (minimal) return;
    onPlay(id);
    window.open(link, "_blank", "noopener,noreferrer");
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
            "absolute top-2 -right-11 w-32 h-6 text-white text-xs font-bold flex items-center justify-center rotate-45",
            TOPIC_COLORS[topic]
          )}
        >
          NEW
        </div>
      )}

      <CardHeader className="p-3 pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-0.5 flex-1 min-w-0">
            <CardTitle className="flex items-center gap-2 pr-2 text-heading-card leading-tight justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <span className="truncate">{title}</span>
                <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-all" />
              </div>
            </CardTitle>
            <CardDescription className="truncate font-mono text-xs">
              {extractDomain(link)}
            </CardDescription>
          </div>
        </div>

        <div className="pt-1.5 flex items-center justify-between gap-2 min-h-[26px]">
          <div className="flex items-center gap-2">
            <DlesBadge text={formatTopic(topic)} color={topic} size="sm" />
            {isPlayed && (
              <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-green-600 dark:text-green-400">
                <Check className="h-3 w-3" />
                Played Today
              </div>
            )}
          </div>

          {/* Actions moved to bottom right */}
          {!minimal && (
            <div
              className="flex items-center gap-1"
              onClick={(e) => e.stopPropagation()}
            >
              <ListsDropdown
                gameId={id}
                className="opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity"
              />
              {onHide && (
                <TooltipProvider delayDuration={200}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={handleHide}
                        className={cn(
                          "p-1 rounded-md text-muted-foreground shrink-0",
                          "opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity",
                          "hover:bg-muted hover:text-foreground"
                        )}
                      >
                        <EyeOff className="h-3.5 w-3.5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs">
                      Hide game
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          )}
        </div>
      </CardHeader>
    </Card>
  );

  return cardContent;
}
