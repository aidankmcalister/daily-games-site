"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { TOPIC_COLORS, extractDomain } from "@/lib/constants";
import { ExternalLink } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const TOPIC_SHADOWS: Record<string, string> = {
  words: "hover:shadow-blue-500/25 dark:hover:shadow-blue-500/10",
  puzzle: "hover:shadow-purple-500/25 dark:hover:shadow-purple-500/10",
  geography: "hover:shadow-green-500/25 dark:hover:shadow-green-500/10",
  trivia: "hover:shadow-yellow-500/25 dark:hover:shadow-yellow-500/10",
  entertainment: "hover:shadow-pink-500/25 dark:hover:shadow-pink-500/10",
  gaming: "hover:shadow-red-500/25 dark:hover:shadow-red-500/10",
  nature: "hover:shadow-emerald-500/25 dark:hover:shadow-emerald-500/10",
  food: "hover:shadow-orange-500/25 dark:hover:shadow-orange-500/10",
  sports: "hover:shadow-cyan-500/25 dark:hover:shadow-cyan-500/10",
};

export interface GameCardProps {
  id: string;
  title: string;
  link: string;
  topic: string;
  playCount: number;
  isPlayed: boolean;
  onPlay: (id: string) => void;
  index?: number;
}

export function GameCard({
  id,
  title,
  link,
  topic,
  playCount,
  isPlayed,
  onPlay,
  index = 0,
}: GameCardProps) {
  const handleClick = () => {
    onPlay(id);
    window.open(link, "_blank", "noopener,noreferrer");
  };

  return (
    <Card
      onClick={handleClick}
      style={{
        animationDelay: `${index * 50}ms`,
        animationFillMode: "both",
      }}
      className={cn(
        "cursor-pointer transition-all duration-75 group relative overflow-hidden border-muted h-full flex flex-col justify-center",
        "animate-in fade-in slide-in-from-bottom-4 duration-100",
        "hover:shadow-lg hover:-translate-y-0.5 hover:border-border",
        TOPIC_SHADOWS[topic],
        isPlayed ? "bg-muted/40 opacity-60 grayscale" : "bg-card"
      )}
    >
      <CardHeader className="p-4 pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1.5 flex-1 min-w-0">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg leading-tight">
              <span className="truncate">{title}</span>
              <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
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

        <div className="pt-3 flex items-center gap-2">
          <Badge
            variant="secondary"
            className={cn("capitalize font-normal", TOPIC_COLORS[topic])}
          >
            {topic}
          </Badge>
        </div>
      </CardHeader>
    </Card>
  );
}
