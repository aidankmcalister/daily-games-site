"use client";

import { useState, useEffect } from "react";
import { getCurrentStreak, getLongestStreak } from "@/lib/streaks";
import { TOPIC_COLORS, TOPIC_BAR_COLORS } from "@/lib/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { BarChart3, EyeOff, Eye } from "lucide-react";
import { useRouter } from "next/navigation";

import { StatsInsights } from "./stats-insights";
import { HeroStats } from "./hero-stats";

interface HiddenGame {
  id: string;
  title: string;
  topic: string;
}

interface StatsClientProps {
  playedCount: number;
  totalGames: number;
  playedDates: string[];
  categoryData: { name: string; count: number }[];
  hiddenGames: HiddenGame[];
}

export function StatsClient({
  playedCount,
  totalGames,
  playedDates,
  categoryData,
  hiddenGames: initialHiddenGames,
}: StatsClientProps) {
  const router = useRouter();
  const [hiddenGames, setHiddenGames] = useState(initialHiddenGames);
  const [enhancedStats, setEnhancedStats] = useState<{
    heatmap: Record<string, number>;
    insights: any;
  } | null>(null);

  useEffect(() => {
    fetch("/api/stats/enhanced")
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) setEnhancedStats(data);
      })
      .catch((err) => console.error(err));
  }, []);

  const dates = playedDates.map((d) => new Date(d));
  const currentStreak = getCurrentStreak(dates);
  const longestStreak = getLongestStreak(dates);

  // Sort categories by count descending
  const sortedCategories = [...categoryData].sort((a, b) => b.count - a.count);
  const maxCount = sortedCategories[0]?.count || 1;

  const completionPercent = Math.round((playedCount / totalGames) * 100);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* 1. Hero Stats Section */}
      <HeroStats
        playedCount={playedCount}
        totalGames={totalGames}
        completionPercent={completionPercent}
        currentStreak={currentStreak}
        longestStreak={longestStreak}
        topCategory={sortedCategories[0] || null}
      />

      {/* 2. Personal Insights (Full Width) */}
      {enhancedStats && <StatsInsights data={enhancedStats.insights} />}

      {/* 3. Games by Category (Table Layout) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Category Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sortedCategories.length > 0 ? (
            <div className="relative w-full overflow-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/20">
                  <tr>
                    <th className="px-4 py-3 font-medium rounded-l-md w-[180px]">
                      Category
                    </th>
                    <th className="px-4 py-3 font-medium w-[100px] text-right">
                      Played
                    </th>
                    <th className="px-4 py-3 font-medium w-[80px] text-right">
                      %
                    </th>
                    <th className="px-4 py-3 font-medium w-full min-w-[150px] rounded-r-md">
                      Progress
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {sortedCategories.map(({ name, count }) => {
                    const percentage =
                      Math.round((count / playedCount) * 100) || 0;
                    return (
                      <tr
                        key={name}
                        className="hover:bg-muted/10 transition-colors group"
                      >
                        <td className="px-4 py-3 font-medium">
                          <Badge
                            variant="secondary"
                            className={cn(
                              "capitalize font-medium pointer-events-none px-2.5 py-0.5 rounded-full border-0",
                              TOPIC_COLORS[name]
                            )}
                          >
                            {name}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums">
                          <span className="font-semibold text-foreground">
                            {count}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                          {percentage}%
                        </td>
                        <td className="px-4 py-3 align-middle">
                          <div className="h-2 w-full bg-muted/40 rounded-full overflow-hidden">
                            <div
                              className={cn(
                                "h-full rounded-full transition-all duration-500",
                                TOPIC_BAR_COLORS[name] || "bg-primary"
                              )}
                              style={{ width: `${(count / maxCount) * 100}%` }}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 space-y-3">
              <p className="text-muted-foreground">
                Play some games to see your breakdown!
              </p>
              <Button onClick={() => router.push("/")} variant="outline">
                View All Games
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 4. Hidden Games Section */}
      {hiddenGames.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <EyeOff className="h-5 w-5" />
              Hidden ({hiddenGames.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {hiddenGames.map((game) => {
                const handleUnhide = async () => {
                  try {
                    await fetch(`/api/user-games/${game.id}`, {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ hidden: false }),
                    });
                    setHiddenGames((prev) =>
                      prev.filter((g) => g.id !== game.id)
                    );
                    router.refresh();
                  } catch (error) {
                    console.error("Failed to unhide game:", error);
                  }
                };

                return (
                  <div
                    key={game.id}
                    className="flex items-center justify-between p-2 rounded-md bg-muted/40 hover:bg-muted/60 transition-colors"
                  >
                    <span
                      className="font-medium text-sm truncate max-w-[200px]"
                      title={game.title}
                    >
                      {game.title}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleUnhide}
                      className="h-7 w-7"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
