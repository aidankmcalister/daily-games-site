"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Clock, CalendarDays, Crosshair } from "lucide-react";
import { cn } from "@/lib/utils";

interface InsightsProps {
  data: {
    busiestDay: string;
    favoriteTime: string;
    completionRate: number;
    uniqueGamesPlayed: number;
  };
  className?: string;
}

export function StatsInsights({ data, className }: InsightsProps) {
  return (
    <Card className={cn("w-full", className)}>
      <CardContent className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Play Patterns Column */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Play Patterns
          </h3>
          <ul className="space-y-4 text-sm">
            <li className="flex items-start gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <CalendarDays className="h-4 w-4" />
              </span>
              <div className="space-y-1">
                <p className="font-medium leading-none">Busiest Day</p>
                <p className="text-muted-foreground">
                  You play most often on{" "}
                  <span className="font-semibold text-foreground">
                    {data.busiestDay || "..."}
                  </span>
                  .
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Clock className="h-4 w-4" />
              </span>
              <div className="space-y-1">
                <p className="font-medium leading-none">Peak Hour</p>
                <p className="text-muted-foreground">
                  Your favorite time to play is around{" "}
                  <span className="font-semibold text-foreground">
                    {data.favoriteTime || "..."}
                  </span>
                  .
                </p>
              </div>
            </li>
          </ul>
        </div>

        {/* Progress Column */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Your Progress
          </h3>
          <ul className="space-y-4 text-sm">
            <li className="flex items-start gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Crosshair className="h-4 w-4" />
              </span>
              <div className="space-y-1">
                <p className="font-medium leading-none">Completion Rate</p>
                <p className="text-muted-foreground">
                  You&apos;ve completed{" "}
                  <span className="font-semibold text-foreground">
                    {data.completionRate}%
                  </span>{" "}
                  of the available library.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Trophy className="h-4 w-4" />
              </span>
              <div className="space-y-1">
                <p className="font-medium leading-none">Unique Masters</p>
                <p className="text-muted-foreground">
                  You&apos;ve played{" "}
                  <span className="font-semibold text-foreground">
                    {data.uniqueGamesPlayed}
                  </span>{" "}
                  distinct titles.
                </p>
              </div>
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
