"use client";

import { useState, useEffect } from "react";
import { getCurrentStreak, getLongestStreak } from "@/lib/streaks";
import { TOPIC_COLORS } from "@/lib/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Calendar, Clock, Star, Eye, Swords, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";

import { RaceHistory } from "@/components/dashboard/race-history";

interface HiddenGame {
  id: string;
  title: string;
  topic: string;
}

interface DashboardClientProps {
  playedCount: number;
  totalGames: number;
  playedDates: string[];
  categoryData: { name: string; count: number }[];
  hiddenGames: HiddenGame[];
}

export function DashboardClient({
  playedCount,
  totalGames,
  playedDates,
  categoryData,
  hiddenGames: initialHiddenGames,
}: DashboardClientProps) {
  const router = useRouter();
  const { data: session } = useSession();
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

  const sortedCategories = [...categoryData].sort((a, b) => b.count - a.count);
  const topCategory = sortedCategories[0] || null;

  return (
    <div className="space-y-6">
      {/* Activity Cards - Top Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Most Active Day */}
        <Card className="border-border/50 bg-card">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
                <Calendar className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-lg font-bold leading-none">
                  {enhancedStats?.insights?.busiestDay || "—"}
                </p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                  Most Active
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Peak Time */}
        <Card className="border-border/50 bg-card">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-md bg-amber-500/10 flex items-center justify-center">
                <Clock className="h-4 w-4 text-amber-500" />
              </div>
              <div>
                <p className="text-lg font-bold leading-none">
                  {enhancedStats?.insights?.favoriteTime || "—"}
                </p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                  Peak Time
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Favorite Category */}
        <Card className="border-border/50 bg-card">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-md bg-emerald-500/10 flex items-center justify-center">
                <Star className="h-4 w-4 text-emerald-500" />
              </div>
              <div>
                {topCategory ? (
                  <>
                    <Badge
                      variant="secondary"
                      className={cn(
                        "text-xs capitalize",
                        TOPIC_COLORS[topCategory.name]
                      )}
                    >
                      {topCategory.name}
                    </Badge>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                      Favorite
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-lg font-bold leading-none">—</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                      Favorite
                    </p>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      {sortedCategories.length > 0 && (
        <Card className="border-border/50 bg-card">
          <CardHeader className="pb-2 pt-3 px-4">
            <CardTitle className="text-sm font-semibold">Categories</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <div className="space-y-2">
              {sortedCategories.slice(0, 6).map(({ name, count }) => (
                <div
                  key={name}
                  className="flex items-center justify-between py-1.5 border-b border-border/30 last:border-0"
                >
                  <Badge
                    variant="secondary"
                    className={cn("capitalize text-xs", TOPIC_COLORS[name])}
                  >
                    {name}
                  </Badge>
                  <span className="text-xs font-medium text-muted-foreground">
                    {count} played
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Race History */}
      {session?.user && <RaceHistory />}

      {/* Hidden Games */}
      {hiddenGames.length > 0 && (
        <Card className="border-border/50 bg-card">
          <CardHeader className="pb-2 pt-3 px-4">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              Hidden Games
              <Badge variant="secondary" className="text-[10px]">
                {hiddenGames.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <div className="space-y-1">
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
                    className="flex items-center justify-between py-1.5 border-b border-border/30 last:border-0"
                  >
                    <div>
                      <p className="font-medium text-sm">{game.title}</p>
                      <p className="text-[10px] text-muted-foreground capitalize">
                        {game.topic}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleUnhide}
                      className="h-7 text-xs gap-1"
                    >
                      <Eye className="h-3 w-3" />
                      Show
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
