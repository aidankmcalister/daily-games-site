"use client";

import { useMemo } from "react";
import { useSession } from "@/lib/auth-client";
import { format } from "date-fns";
import {
  Trophy,
  Swords,
  ArrowRight,
  Zap,
  Clock,
  Calendar,
  Eye,
  Target,
} from "lucide-react";
import { DlesButton } from "@/components/design/dles-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface RaceStatsClientProps {
  playedCount: number;
  totalGames: number;
  playedDates: string[];
  categoryData: { name: string; count: number }[];
  hiddenGames: { id: string; title: string; topic: string }[];
  races: any[]; // Prisma structure
}

export function RaceStatsClient({
  playedCount,
  totalGames,
  playedDates,
  categoryData,
  hiddenGames,
  races,
}: RaceStatsClientProps) {
  const { data: session } = useSession();

  const stats = useMemo(() => {
    if (!session?.user || !races.length) return null;
    const userId = session.user.id;

    let wins = 0;
    let losses = 0;

    // Streak calc
    let currentStreak = 0;
    let bestStreak = 0;
    let tempStreak = 0;

    // Time calc
    let totalTime = 0;
    let timeCount = 0;
    let fastestRaceTime = Number.MAX_SAFE_INTEGER;
    let fastestRaceOpponent = "";

    // Rival calc
    const rivals: Record<
      string,
      { name: string; wins: number; losses: number; games: number }
    > = {};

    // Game calc (Frequency/Performance)
    const gameStats: Record<
      string,
      {
        count: number;
        wins: number;
        name: string;
        topic: string;
        totalSplit: number;
        bestSplit: number;
        playCount: number;
      }
    > = {};

    // Sort races by date asc for streak calc
    const sortedRaces = [...races].sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    sortedRaces.forEach((race) => {
      const myP = race.participants.find((p: any) => p.userId === userId);
      const oppP = race.participants.find((p: any) => p.userId !== userId);

      if (!myP || !oppP) return;

      // Rivals
      const oppKey = oppP.userId || oppP.guestName || "Guest";
      const oppName = oppP.user?.name || oppP.guestName || "Guest";
      if (!rivals[oppKey])
        rivals[oppKey] = { name: oppName, wins: 0, losses: 0, games: 0 };
      rivals[oppKey].games++;

      // Result logic
      const myScore = {
        completed: myP.completions?.filter((c: any) => !c.skipped).length || 0,
        time: myP.totalTime || Number.MAX_SAFE_INTEGER,
      };
      const oppScore = {
        completed: oppP.completions?.filter((c: any) => !c.skipped).length || 0,
        time: oppP.totalTime || Number.MAX_SAFE_INTEGER,
      };

      let isWin = false;
      if (myScore.completed > oppScore.completed) isWin = true;
      else if (
        myScore.completed === oppScore.completed &&
        myScore.time <= oppScore.time
      )
        isWin = true;

      if (isWin) {
        wins++;
        tempStreak++;
        if (tempStreak > bestStreak) bestStreak = tempStreak;
        currentStreak = tempStreak; // Since we are iterating chrono, current IS temp at end

        rivals[oppKey].losses++; // Opponent lost

        // Track Wins per Game Topic/Name
        race.raceGames.forEach((rg: any) => {
          const gid = rg.game.id;
          if (!gameStats[gid])
            gameStats[gid] = {
              count: 0,
              wins: 0,
              name: rg.game.title,
              topic: rg.game.topic || "other",
              totalSplit: 0,
              bestSplit: Number.MAX_SAFE_INTEGER,
              playCount: 0,
            };
          gameStats[gid].count++;
          gameStats[gid].wins++; // Count wins involving this game
        });
      } else {
        losses++;
        tempStreak = 0;
        currentStreak = 0;
        rivals[oppKey].wins++; // Opponent won

        // Track Games Played (even if lost)
        race.raceGames.forEach((rg: any) => {
          const gid = rg.game.id;
          if (!gameStats[gid])
            gameStats[gid] = {
              count: 0,
              wins: 0,
              name: rg.game.title,
              topic: rg.game.topic || "other",
              totalSplit: 0,
              bestSplit: Number.MAX_SAFE_INTEGER,
              playCount: 0,
            };
          gameStats[gid].count++;
        });
      }

      // Time Stats
      if (myP.totalTime) {
        totalTime += myP.totalTime;
        timeCount++;
        if (myP.totalTime < fastestRaceTime) {
          fastestRaceTime = myP.totalTime;
          fastestRaceOpponent = oppName;
        }
      }

      // Game Mastery (Splits)
      const myCompletions = myP.completions || [];
      const raceGamesSorted = [...race.raceGames].sort(
        (a: any, b: any) => a.order - b.order
      );

      let previousTime = 0;
      raceGamesSorted.forEach((rg: any) => {
        const completion = myCompletions.find(
          (c: any) => c.raceGameId === rg.id
        );
        if (completion && !completion.skipped) {
          const splitTime = completion.timeToComplete - previousTime;
          previousTime = completion.timeToComplete;

          const gid = rg.game.id;
          if (!gameStats[gid]) {
            gameStats[gid] = {
              count: 0,
              wins: 0,
              name: rg.game.title,
              topic: rg.game.topic || "other",
              totalSplit: 0,
              bestSplit: Number.MAX_SAFE_INTEGER,
              playCount: 0,
            };
          }
          gameStats[gid].playCount++;
          gameStats[gid].totalSplit += splitTime;
          if (splitTime < gameStats[gid].bestSplit) {
            gameStats[gid].bestSplit = splitTime;
          }
        }
      });
    });

    const winRate =
      races.length > 0 ? Math.round((wins / races.length) * 100) : 0;
    const avgTime = timeCount > 0 ? Math.round(totalTime / timeCount) : 0;

    // Process Rivals
    const rivalList = Object.values(rivals)
      .sort((a, b) => b.games - a.games)
      .slice(0, 3);

    // Process Games
    const gameMastery = Object.values(gameStats)
      .filter((g) => g.playCount > 0)
      .sort((a, b) => b.playCount - a.playCount); // Sort by plays

    return {
      wins,
      losses,
      total: races.length,
      winRate,
      currentStreak,
      bestStreak,
      avgTime,
      totalTime,
      fastestRaceTime:
        fastestRaceTime === Number.MAX_SAFE_INTEGER ? 0 : fastestRaceTime,
      fastestRaceOpponent,
      rivalList,
      gameMastery,
    };
  }, [races, session?.user?.id]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-8 mt-6">
      {/* 1. COMPREHENSIVE TRACKER DASHBOARD */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* A. PERFORMANCE MATRIX */}
        <Card className="lg:col-span-2 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <Trophy className="h-64 w-64 rotate-12" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Swords className="h-4 w-4" /> Performance Matrix
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-8 items-center sm:items-start">
              {/* Circle Gauge */}
              <div className="relative shrink-0">
                <div className="h-32 w-32 relative">
                  <svg
                    className="h-full w-full -rotate-90"
                    viewBox="0 0 100 100"
                  >
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      strokeWidth="8"
                      className="stroke-muted/20"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      strokeWidth="8"
                      className={cn(
                        "stroke-primary transition-all duration-1000 ease-out",
                        stats && stats.winRate > 50
                          ? "stroke-emerald-500"
                          : "stroke-amber-500"
                      )}
                      strokeDasharray={`${(stats?.winRate || 0) * 2.83} 283`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold tracking-tighter">
                      {stats?.winRate || 0}%
                    </span>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground">
                      Win Rate
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="flex-1 grid grid-cols-2 gap-y-6 gap-x-12 w-full">
                <div>
                  <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">
                    Career Record
                  </p>
                  <div className="text-3xl font-bold tracking-tight">
                    {stats?.wins} - {stats?.losses}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Total Races: {stats?.total}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">
                    Current Streak
                  </p>
                  <div className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    {stats?.currentStreak}{" "}
                    <Zap
                      className={cn(
                        "h-5 w-5",
                        stats?.currentStreak
                          ? "text-amber-500 fill-amber-500"
                          : "text-muted"
                      )}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Best: {stats?.bestStreak}
                  </p>
                </div>
                <div className="col-span-2 border-t pt-4 flex gap-8">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">
                      Avg Pace
                    </p>
                    <div className="text-2xl font-mono font-bold">
                      {stats ? formatTime(stats.avgTime) : "—"}
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">
                      Fastest Race
                    </p>
                    <div className="text-2xl font-mono font-bold text-emerald-500">
                      {stats ? formatTime(stats.fastestRaceTime) : "—"}
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      vs {stats?.fastestRaceOpponent || "—"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* B. RIVALS LEADERBOARD */}
        <Card className="flex flex-col">
          <CardHeader className="pb-4">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Target className="h-4 w-4" /> Top Rivals
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            {stats?.rivalList.length ? (
              <div className="space-y-4">
                {stats.rivalList.map((rival, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center font-bold text-xs">
                        {rival.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold leading-none">
                          {rival.name}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {rival.games} races
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-mono font-bold text-emerald-500">
                        {rival.wins}W
                      </span>
                      <span className="text-xs font-mono text-muted-foreground mx-1">
                        -
                      </span>
                      <span className="text-sm font-mono font-bold text-rose-500">
                        {rival.losses}L
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground text-center p-4">
                <p className="text-sm">No rivals yet.</p>
                <p className="text-xs opacity-60">Race to build history!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 2. GAME MASTERY */}
      {stats?.gameMastery.length ? (
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" /> Game Mastery
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
              {stats.gameMastery.slice(0, 12).map((game) => (
                <div
                  key={game.name}
                  className="bg-muted/30 rounded-md p-3 border border-border/50 flex flex-col justify-between gap-2"
                >
                  <div>
                    <p className="text-xs font-bold truncate" title={game.name}>
                      {game.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {game.playCount} plays
                    </p>
                  </div>
                  <div>
                    <div className="text-lg font-mono font-bold tracking-tight">
                      {formatTime(game.totalSplit / game.playCount)}
                    </div>
                    <p className="text-[10px] text-emerald-500 font-mono">
                      Best: {formatTime(game.bestSplit)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* 2. HISTORY LOG */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-baseline gap-3">
            <h3 className="text-lg font-bold tracking-tight">Race History</h3>
            <p className="font-mono text-xs text-muted-foreground hidden sm:inline-block">
              {races.length} races
            </p>
          </div>
          <DlesButton
            href="/race/new"
            size="sm"
            className="h-8 text-xs font-bold uppercase tracking-wider"
          >
            <Swords className="mr-2 h-3 w-3" />
            Start New Race
          </DlesButton>
        </div>

        <div className="rounded-md border bg-card overflow-hidden shadow-sm">
          {races.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground text-sm">
              No completed races found. Start a race to build your history!
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              <div className="grid grid-cols-12 gap-4 p-3 bg-muted/30 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/50">
                <div className="col-span-2 sm:col-span-1">Result</div>
                <div className="col-span-5 sm:col-span-4">Opponent</div>
                <div className="col-span-3 sm:col-span-2">Date</div>
                <div className="col-span-2 sm:col-span-2 text-right">Time</div>
                <div className="hidden sm:block sm:col-span-2 text-right">
                  Games
                </div>
                <div className="hidden sm:block sm:col-span-1"></div>
              </div>
              {races.map((race) => {
                const myP = race.participants.find(
                  (p: any) => p.userId === session?.user?.id
                );
                const oppP = race.participants.find(
                  (p: any) => p.userId !== session?.user?.id
                );
                const oppName =
                  oppP?.user?.name || oppP?.guestName || "Unknown";

                const myScore = {
                  completed:
                    myP?.completions?.filter((c: any) => !c.skipped).length ||
                    0,
                  time: myP?.totalTime || 0,
                };
                const oppScore = {
                  completed:
                    oppP?.completions?.filter((c: any) => !c.skipped).length ||
                    0,
                  time: oppP?.totalTime || 0,
                };

                let result = "LOST";
                if (myScore.completed > oppScore.completed) result = "WON";
                else if (
                  myScore.completed === oppScore.completed &&
                  myScore.time <= oppScore.time
                )
                  result = "WON";

                return (
                  <div
                    key={race.id}
                    className="grid grid-cols-12 gap-4 p-3 items-center hover:bg-muted/30 transition-colors group text-sm"
                  >
                    <div className="col-span-2 sm:col-span-1">
                      <Badge
                        variant="secondary"
                        className={cn(
                          "text-[10px] h-5 px-1.5 rounded-sm font-bold justify-center w-fit",
                          result === "WON"
                            ? "bg-emerald-500/10 text-emerald-500"
                            : "bg-rose-500/10 text-rose-500"
                        )}
                      >
                        {result}
                      </Badge>
                    </div>
                    <div className="col-span-5 sm:col-span-4 font-medium truncate">
                      vs {oppName}
                    </div>
                    <div className="col-span-3 sm:col-span-2 text-muted-foreground text-xs truncate">
                      {format(new Date(race.createdAt), "MMM d")}
                    </div>
                    <div className="col-span-2 sm:col-span-2 text-right font-mono text-xs">
                      {Math.floor(myScore.time / 60)}:
                      {(myScore.time % 60).toString().padStart(2, "0")}
                    </div>
                    <div className="hidden sm:block sm:col-span-2 text-right text-xs text-muted-foreground">
                      {race.raceGames.length}
                    </div>
                    <div className="hidden sm:block sm:col-span-1 text-right">
                      <DlesButton
                        href={`/race/${race.id}`}
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <ArrowRight className="h-3 w-3" />
                      </DlesButton>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* HIDDEN GAMES */}
      {hiddenGames.length > 0 && (
        <div className="rounded-md border bg-card p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Eye className="h-4 w-4" /> Hidden Games
            </h3>
            <Badge variant="secondary">{hiddenGames.length}</Badge>
          </div>
          <div className="divide-y border rounded-md">
            {hiddenGames.map((game) => (
              <div
                key={game.id}
                className="flex items-center justify-between p-3 py-2 text-sm"
              >
                <span>{game.title}</span>
                <button
                  className="text-primary hover:underline text-xs"
                  onClick={() => {
                    fetch(`/api/user-games/${game.id}`, {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ hidden: false }),
                    }).then(() => window.location.reload());
                  }}
                >
                  Unhide
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
