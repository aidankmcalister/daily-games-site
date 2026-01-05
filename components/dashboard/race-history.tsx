"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DlesButton } from "@/components/ui/dles-button";
import {
  Trophy,
  Calendar,
  Clock,
  ArrowRight,
  Loader2,
  Swords,
  Plus,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Race, Participant } from "@/app/race/[id]/page";
import { cn } from "@/lib/utils";
import { useSession } from "@/lib/auth-client";

interface RaceHistoryProps {
  initialRaces?: Race[];
  initialLoading?: boolean;
}

export function RaceHistory({
  initialRaces,
  initialLoading,
}: RaceHistoryProps) {
  const { data: session } = useSession();
  const [races, setRaces] = useState<Race[]>(initialRaces || []);
  const [loading, setLoading] = useState(
    initialLoading !== undefined ? initialLoading : true
  );

  useEffect(() => {
    if (initialRaces) {
      setRaces(initialRaces);
    }
  }, [initialRaces]);

  useEffect(() => {
    if (initialLoading !== undefined) {
      setLoading(initialLoading);
    }
  }, [initialLoading]);

  useEffect(() => {
    if (session?.user && !initialRaces) {
      fetch("/api/user/races")
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) setRaces(data);
        })
        .catch((err) => console.error("Failed to fetch races", err))
        .finally(() => setLoading(false));
    }
  }, [session?.user, initialRaces]);

  if (!session?.user) return null;

  // Calculate stats (excluding pending)
  const stats = races.reduce(
    (acc, race) => {
      const myParticipant = race.participants.find(
        (p) => p.userId === session.user.id
      );
      const opponent = race.participants.find(
        (p) => p.userId !== session.user.id
      );

      if (!myParticipant) return acc;

      // Skip incomplete races
      if (!opponent || race.status !== "completed") {
        return acc;
      }

      acc.total++;

      const getScore = (p: Participant) => {
        const completed = p.completions.filter((c) => !c.skipped).length;
        const time = p.totalTime ?? Number.MAX_SAFE_INTEGER;
        return { completed, time };
      };

      const myScore = getScore(myParticipant);
      const oppScore = getScore(opponent);

      if (myScore.completed > oppScore.completed) {
        acc.won++;
      } else if (myScore.completed < oppScore.completed) {
        acc.lost++;
      } else {
        if (myScore.time < oppScore.time) acc.won++;
        else if (myScore.time > oppScore.time) acc.lost++;
        else acc.won++; // tie counts as win
      }

      return acc;
    },
    { total: 0, won: 0, lost: 0 }
  );

  // Filter to only show completed races
  const completedRaces = races.filter((race) => {
    const opponent = race.participants.find(
      (p) => p.userId !== session.user.id
    );
    return opponent && race.status === "completed";
  });

  if (loading && races.length === 0) {
    return (
      <Card className="border-border/50 bg-card">
        <CardContent className="p-8 text-center text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
          Loading...
        </CardContent>
      </Card>
    );
  }

  if (completedRaces.length === 0) {
    return (
      <Card className="border-border/50 bg-card">
        <CardHeader className="pb-2 px-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Swords className="h-4 w-4" />
              Race History
            </CardTitle>
            <DlesButton className="h-7 text-xs" href="/race/new">
              <Plus className="h-3.5 w-3.5" />
              New Race
            </DlesButton>
          </div>
        </CardHeader>
        <CardContent className="px-4">
          <p className="text-sm text-muted-foreground text-center py-6">
            No completed races yet. Start one to see your history!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50 bg-card">
      <CardHeader className="pb-2 px-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Swords className="h-4 w-4" />
            Race History
          </CardTitle>
          <DlesButton className="h-7 text-xs" href="/race/new">
            <Plus className="h-3.5 w-3.5" />
            New Race
          </DlesButton>
        </div>
      </CardHeader>
      <CardContent className="px-4 space-y-4">
        {/* Quick Stats - Inline Summary with separators */}
        <div className="flex items-center gap-3 text-sm">
          <span className="font-semibold">{stats.total} Races</span>
          <span className="w-px h-4 bg-border" />
          <span className="text-emerald-500 font-medium">{stats.won} Wins</span>
          <span className="w-px h-4 bg-border" />
          <span className="text-rose-500 font-medium">{stats.lost} Losses</span>
          <span className="w-px h-4 bg-border" />
          <span
            className={cn(
              "font-medium",
              stats.total > 0 &&
                stats.won / stats.total >= 0.5 &&
                "text-emerald-500",
              stats.total > 0 &&
                stats.won / stats.total >= 0.25 &&
                stats.won / stats.total < 0.5 &&
                "text-amber-500",
              (stats.total === 0 || stats.won / stats.total < 0.25) &&
                "text-rose-500"
            )}
          >
            {stats.total > 0 ? Math.round((stats.won / stats.total) * 100) : 0}%
            WR
          </span>
        </div>

        {/* Recent Races */}
        <div className="space-y-2">
          {completedRaces.slice(0, 5).map((race) => {
            const myParticipant = race.participants.find(
              (p) => p.userId === session.user.id
            );
            const opponent = race.participants.find(
              (p) => p.userId !== session.user.id
            );

            const getScore = (p: Participant) => {
              const completed = p.completions.filter((c) => !c.skipped).length;
              const time = p.totalTime ?? Number.MAX_SAFE_INTEGER;
              return { completed, time };
            };

            const myScore = myParticipant
              ? getScore(myParticipant)
              : { completed: 0, time: 0 };
            const oppScore = opponent
              ? getScore(opponent)
              : { completed: 0, time: 0 };

            // Determine result
            let result: "won" | "lost" = "lost";
            if (myScore.completed > oppScore.completed) result = "won";
            else if (myScore.completed < oppScore.completed) result = "lost";
            else {
              if (myScore.time <= oppScore.time) result = "won";
              else result = "lost";
            }

            return (
              <div
                key={race.id}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "h-8 w-8 rounded-full flex items-center justify-center",
                      result === "won" && "bg-emerald-500/10 text-emerald-500",
                      result === "lost" && "bg-rose-500/10 text-rose-500"
                    )}
                  >
                    <Trophy className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className={cn(
                          "text-xs capitalize",
                          result === "won" &&
                            "bg-emerald-500/10 text-emerald-500",
                          result === "lost" && "bg-rose-500/10 text-rose-500"
                        )}
                      >
                        {result}
                      </Badge>
                      <span className="text-sm font-medium">
                        vs{" "}
                        {opponent?.user?.name ??
                          opponent?.guestName ??
                          "Unknown"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDistanceToNow(new Date(race.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                      <span className="w-px h-3 bg-border" />
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {race.raceGames.length} games
                      </span>
                    </div>
                  </div>
                </div>
                <DlesButton
                  variant="ghost"
                  size="icon"
                  href={`/race/${race.id}`}
                >
                  <ArrowRight className="h-4 w-4" />
                </DlesButton>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
