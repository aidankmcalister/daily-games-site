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

export interface GameCardProps {
  id: string;
  title: string;
  link: string;
  topic: string;
  playCount: number;
  isPlayed: boolean;
  onPlay: (id: string) => void;
}

export function GameCard({
  id,
  title,
  link,
  topic,
  playCount,
  isPlayed,
  onPlay,
}: GameCardProps) {
  const handleClick = () => {
    onPlay(id);
    window.open(link, "_blank", "noopener,noreferrer");
  };

  return (
    <Card
      onClick={handleClick}
      className={cn(
        "cursor-pointer hover:opacity-85 transition-all duration-75",
        isPlayed && "opacity-50 grayscale"
      )}
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <span className="truncate">{title}</span>
          <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        </CardTitle>
        <CardDescription className="truncate">
          {extractDomain(link)}
        </CardDescription>
        <div className="flex items-center gap-1.5 mt-2">
          <Badge
            variant="secondary"
            className={cn("capitalize", TOPIC_COLORS[topic])}
          >
            {topic}
          </Badge>
        </div>
      </CardHeader>
      <CardFooter className="pt-0">
        {isPlayed && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="ml-auto cursor-help">
                Played
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>Resets at midnight</p>
            </TooltipContent>
          </Tooltip>
        )}
      </CardFooter>
    </Card>
  );
}
