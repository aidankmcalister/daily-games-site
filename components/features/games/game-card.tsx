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
import { TOPIC_COLORS, extractDomain } from "@/lib/constants";
import { ExternalLink, EyeOff } from "lucide-react";
import { ListsDropdown } from "../lists/lists-dropdown";
import { DlesTopic } from "@/components/design/dles-topic";

const TOPIC_SHADOWS: Record<string, string> = {
  words: "hover:shadow-blue-500/25 dark:hover:shadow-blue-500/10",
  geography: "hover:shadow-green-500/25 dark:hover:shadow-green-500/10",
  trivia: "hover:shadow-yellow-500/25 dark:hover:shadow-yellow-500/10",
  nature: "hover:shadow-emerald-500/25 dark:hover:shadow-emerald-500/10",
  food: "hover:shadow-orange-500/25 dark:hover:shadow-orange-500/10",
  sports: "hover:shadow-cyan-500/25 dark:hover:shadow-cyan-500/10",
  colors: "hover:shadow-indigo-500/25 dark:hover:shadow-indigo-500/10",
  estimation: "hover:shadow-teal-500/25 dark:hover:shadow-teal-500/10",
  logic: "hover:shadow-slate-500/25 dark:hover:shadow-slate-500/10",
  history: "hover:shadow-amber-500/25 dark:hover:shadow-amber-500/10",
  movies_tv: "hover:shadow-violet-500/25 dark:hover:shadow-violet-500/10",
  music: "hover:shadow-rose-500/25 dark:hover:shadow-rose-500/10",
  shapes: "hover:shadow-lime-500/25 dark:hover:shadow-lime-500/10",
  video_games: "hover:shadow-sky-500/25 dark:hover:shadow-sky-500/10",
  board_games: "hover:shadow-fuchsia-500/25 dark:hover:shadow-fuchsia-500/10",
};

/**
 * Check if a date is within the last N days
 */
function isWithinDays(date: Date, days: number): boolean {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  return diff < days * 24 * 60 * 60 * 1000;
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

  const isNew = createdAt && isWithinDays(new Date(createdAt), 7);

  const cardContent = (
    <Card
      onClick={handleClick}
      style={{
        animationDelay: `${index * 30}ms`,
        animationFillMode: "both",
      }}
      className={cn(
        "cursor-pointer transition-all duration-200 ease-out group relative overflow-hidden border-muted h-full flex flex-col justify-center",
        "animate-in fade-in slide-in-from-bottom-2 duration-200",
        "hover:shadow-md hover:-translate-y-0.5 hover:border-primary/50 hover:scale-[1.01]",
        TOPIC_SHADOWS[topic],
        isPlayed
          ? "bg-muted/40 opacity-60 grayscale hover:grayscale-0 hover:opacity-100"
          : "bg-card"
      )}
    >
      {/* Corner NEW ribbon */}
      {isNew && !isPlayed && (
        <div
          className={cn(
            "absolute top-2 -right-11 w-32 h-5 text-white text-[9px] font-bold flex items-center justify-center rotate-45",
            TOPIC_COLORS[topic]
          )}
        >
          NEW
        </div>
      )}

      <CardHeader className="p-4 pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1.5 flex-1 min-w-0">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg leading-tight justify-between">
              <div className="flex items-center gap-2">
                <span className="truncate">{title}</span>
                <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </div>
              {/* Hide button inline with title */}
              {!minimal && (
                <div
                  className="flex items-center gap-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ListsDropdown gameId={id} />
                  {onHide && (
                    <TooltipProvider delayDuration={200}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={handleHide}
                            className={cn(
                              "p-1 rounded-md text-muted-foreground shrink-0",
                              "opacity-0 group-hover:opacity-100 transition-opacity",
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
            </CardTitle>
            <CardDescription className="truncate font-mono text-xs">
              {extractDomain(link)}
            </CardDescription>
          </div>
          {isPlayed && (
            <Badge
              variant="outline"
              className="shrink-0 border-green-500/30 text-green-600 bg-green-500/10 dark:text-green-400 dark:bg-green-500/20"
            >
              Played
            </Badge>
          )}
        </div>

        <div className="pt-3 flex items-center justify-between gap-2">
          <DlesTopic topic={topic} />
        </div>
      </CardHeader>
    </Card>
  );

  return cardContent;
}
