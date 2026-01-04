"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flame, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { TOPIC_COLORS } from "@/lib/constants";

interface HeroStatsProps {
  playedCount: number;
  totalGames: number;
  completionPercent: number;
  currentStreak: number;
  longestStreak: number;
  topCategory: { name: string; count: number } | null;
}

export function HeroStats({
  playedCount,
  totalGames,
  completionPercent,
  currentStreak,
  longestStreak,
  topCategory,
}: HeroStatsProps) {
  // Circular progress math
  const radius = 120; // Larger
  const stroke = 22; // Thicker "chunkier" look
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset =
    circumference - (completionPercent / 100) * circumference;

  return (
    <Card className="p-8 mb-8 relative overflow-hidden bg-linear-to-b from-background to-muted/20 border-border/50 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8 md:gap-12">
        {/* Left: Circular Progress */}
        <div className="flex flex-col items-center justify-center shrink-0 w-full md:w-auto">
          <div className="relative group">
            <svg
              height={radius * 2}
              width={radius * 2}
              className="transform -rotate-90 drop-shadow-xl"
            >
              <circle
                stroke="currentColor"
                fill="transparent"
                strokeWidth={stroke}
                strokeDasharray={circumference + " " + circumference}
                style={{ strokeDashoffset: 0 }}
                r={normalizedRadius}
                cx={radius}
                cy={radius}
                className="text-muted/10"
              />
              <circle
                stroke="currentColor"
                fill="transparent"
                strokeWidth={stroke}
                strokeDasharray={circumference + " " + circumference}
                style={{ strokeDashoffset }}
                strokeLinecap="round"
                r={normalizedRadius}
                cx={radius}
                cy={radius}
                className="text-primary transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
              <span className="text-4xl font-extrabold tracking-tighter">
                {playedCount}
                <span className="text-muted-foreground/60 text-2xl font-bold">
                  /{totalGames}
                </span>
              </span>
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mt-1">
                Played Today
              </span>
            </div>
          </div>
        </div>

        {/* Right: Detailed Stats */}
        <div className="space-y-6 flex-1 w-full text-center md:text-left">
          <div className="space-y-1">
            <h2 className="text-3xl font-bold tracking-tight">
              {completionPercent}% Complete
            </h2>
            <p className="text-muted-foreground font-medium">
              You&apos;re doing great! Keep it up.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col items-center md:items-start p-4 rounded-lg bg-orange-500/5 border border-orange-500/10">
              <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 font-bold mb-1">
                <Flame className="h-4 w-4 fill-current" />
                <span>Current Streak</span>
              </div>
              <span className="text-2xl font-bold">{currentStreak} Days</span>
            </div>
            <div className="flex flex-col items-center md:items-start p-4 rounded-lg bg-yellow-500/5 border border-yellow-500/10">
              <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400 font-bold mb-1">
                <Trophy className="h-4 w-4 fill-current" />
                <span>Best Streak</span>
              </div>
              <span className="text-2xl font-bold">{longestStreak} Days</span>
            </div>
          </div>

          {topCategory && (
            <div className="pt-4 md:pt-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">
                Most Played Category
              </span>
              <div className="flex items-center justify-center md:justify-start gap-3">
                <Badge
                  variant="secondary"
                  className={cn(
                    "capitalize text-base font-medium pointer-events-none px-3 py-1 rounded-full border-0 h-auto",
                    TOPIC_COLORS[topCategory.name]
                  )}
                >
                  {topCategory.name}
                </Badge>
                <span className="text-sm font-medium text-muted-foreground">
                  {topCategory.count} games
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
