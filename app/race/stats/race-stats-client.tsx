"use client";

import { useMemo } from "react";
import { useSession } from "@/lib/auth-client";
import { format } from "date-fns";
import { Swords, ArrowRight, Zap, Clock, Eye, Users } from "lucide-react";
import { DlesButton } from "@/components/design/dles-button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface RaceStatsClientProps {
  playedCount: number;
  totalGames: number;
  playedDates: string[];
  categoryData: { name: string; count: number }[];
  hiddenGames: { id: string; title: string; topic: string }[];
  races: any[];
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
    let currentStreak = 0;
    let bestStreak = 0;
    let tempStreak = 0;
    let totalTime = 0;
    let timeCount = 0;
    let fastestRaceTime = Number.MAX_SAFE_INTEGER;
    let fastestRaceOpponent = "";

    const rivals: Record<
      string,
      { name: string; wins: number; losses: number; games: number }
    > = {};

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

    const sortedRaces = [...races].sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    sortedRaces.forEach((race) => {
      const myP = race.participants.find((p: any) => p.userId === userId);
      const oppP = race.participants.find((p: any) => p.userId !== userId);

      if (!myP || !oppP) return;

      const oppKey = oppP.userId || oppP.guestName || "Guest";
      const oppName = oppP.user?.name || oppP.guestName || "Guest";
      if (!rivals[oppKey])
        rivals[oppKey] = { name: oppName, wins: 0, losses: 0, games: 0 };
      rivals[oppKey].games++;

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
        currentStreak = tempStreak;
        rivals[oppKey].losses++;

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
          gameStats[gid].wins++;
        });
      } else {
        losses++;
        tempStreak = 0;
        currentStreak = 0;
        rivals[oppKey].wins++;

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

      if (myP.totalTime) {
        totalTime += myP.totalTime;
        timeCount++;
        if (myP.totalTime < fastestRaceTime) {
          fastestRaceTime = myP.totalTime;
          fastestRaceOpponent = oppName;
        }
      }

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

    const rivalList = Object.values(rivals)
      .sort((a, b) => b.games - a.games)
      .slice(0, 3);

    const gameMastery = Object.values(gameStats)
      .filter((g) => g.playCount > 0)
      .sort((a, b) => b.playCount - a.playCount);

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
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-6 mt-6">
      {/* Stats Overview Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl border border-border/40 bg-card p-4">
          <p className="text-micro text-muted-foreground/60">Record</p>
          <p className="text-2xl font-bold tracking-tight mt-1">
            {stats?.wins ?? 0} - {stats?.losses ?? 0}
          </p>
        </div>
        <div className="rounded-xl border border-border/40 bg-card p-4">
          <p className="text-micro text-muted-foreground/60">Win Rate</p>
          <p className="text-2xl font-bold tracking-tight mt-1">
            {stats?.winRate ?? 0}%
          </p>
        </div>
        <div className="rounded-xl border border-border/40 bg-card p-4">
          <p className="text-micro text-muted-foreground/60">Current Streak</p>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-2xl font-bold tracking-tight">
              {stats?.currentStreak ?? 0}
            </p>
            {(stats?.currentStreak ?? 0) > 0 && (
              <Zap className="h-4 w-4 text-amber-500 fill-amber-500" />
            )}
          </div>
        </div>
        <div className="rounded-xl border border-border/40 bg-card p-4">
          <p className="text-micro text-muted-foreground/60">Avg Time</p>
          <p className="text-2xl font-bold tracking-tight tabular-nums mt-1">
            {stats ? formatTime(stats.avgTime) : "—"}
          </p>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Rivals */}
        <div className="rounded-xl border border-border/40 bg-card p-4">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-heading-card">Top Rivals</h3>
          </div>
          {stats?.rivalList.length ? (
            <div className="space-y-3">
              {stats.rivalList.map((rival, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-muted/50 flex items-center justify-center text-body-small font-bold">
                      {rival.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-body font-medium">{rival.name}</p>
                      <p className="text-micro text-muted-foreground/60">
                        {rival.games} races
                      </p>
                    </div>
                  </div>
                  <div className="text-body-small tabular-nums">
                    <span className="text-emerald-500 font-bold">
                      {rival.wins}W
                    </span>
                    <span className="text-muted-foreground mx-1">-</span>
                    <span className="text-rose-500 font-bold">
                      {rival.losses}L
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-body-small text-muted-foreground text-center py-6">
              No rivals yet. Start racing!
            </p>
          )}
        </div>

        {/* Best Times */}
        <div className="rounded-xl border border-border/40 bg-card p-4">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-heading-card">Best Times</h3>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-micro text-muted-foreground/60">
                Fastest Race
              </p>
              <p className="text-2xl font-bold tabular-nums text-emerald-500 mt-1">
                {stats ? formatTime(stats.fastestRaceTime) : "—"}
              </p>
              {stats?.fastestRaceOpponent && (
                <p className="text-micro text-muted-foreground/60 mt-0.5">
                  vs {stats.fastestRaceOpponent}
                </p>
              )}
            </div>
            <div className="border-t border-border/20 pt-4">
              <p className="text-micro text-muted-foreground/60">Best Streak</p>
              <p className="text-2xl font-bold tracking-tight mt-1">
                {stats?.bestStreak ?? 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Game Mastery */}
      {stats?.gameMastery.length ? (
        <div className="rounded-xl border border-border/40 bg-card p-4">
          <div className="flex items-center gap-2 mb-4">
            <Swords className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-heading-card">Game Mastery</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {stats.gameMastery.slice(0, 12).map((game) => (
              <div
                key={game.name}
                className="rounded-lg border border-border/30 p-3 bg-muted/20"
              >
                <p
                  className="text-body-small font-medium truncate"
                  title={game.name}
                >
                  {game.name}
                </p>
                <p className="text-micro text-muted-foreground/60">
                  {game.playCount} plays
                </p>
                <p className="text-lg font-bold tabular-nums mt-2">
                  {formatTime(Math.round(game.totalSplit / game.playCount))}
                </p>
                <p className="text-micro text-emerald-500 tabular-nums">
                  Best: {formatTime(game.bestSplit)}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Race History */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-3">
            <h3 className="text-heading-section">Race History</h3>
            <span className="text-body-small text-muted-foreground/60 tabular-nums">
              {races.length} races
            </span>
          </div>
          <DlesButton href="/race/new" size="sm">
            <Swords className="mr-2 h-3.5 w-3.5" />
            Start Race
          </DlesButton>
        </div>

        <div className="rounded-xl border border-border/40 bg-card overflow-hidden">
          {races.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-body text-muted-foreground">
                No completed races yet. Start a race to build your history!
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border/30">
              {/* Header */}
              <div className="grid grid-cols-12 gap-4 p-3 bg-muted/30 text-micro text-muted-foreground/60">
                <div className="col-span-2 sm:col-span-1">Result</div>
                <div className="col-span-5 sm:col-span-4">Opponent</div>
                <div className="col-span-3 sm:col-span-2">Date</div>
                <div className="col-span-2 sm:col-span-2 text-right">Time</div>
                <div className="hidden sm:block sm:col-span-2 text-right">
                  Games
                </div>
                <div className="hidden sm:block sm:col-span-1"></div>
              </div>
              {/* Rows */}
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
                    className="grid grid-cols-12 gap-4 p-3 items-center hover:bg-muted/20 transition-colors group"
                  >
                    <div className="col-span-2 sm:col-span-1">
                      <Badge
                        variant="secondary"
                        className={cn(
                          "text-[9px] font-bold h-5 px-1.5 rounded",
                          result === "WON"
                            ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                            : "bg-rose-500/10 text-rose-500 border-rose-500/20"
                        )}
                      >
                        {result}
                      </Badge>
                    </div>
                    <div className="col-span-5 sm:col-span-4 text-body font-medium truncate">
                      vs {oppName}
                    </div>
                    <div className="col-span-3 sm:col-span-2 text-body-small text-muted-foreground truncate">
                      {format(new Date(race.createdAt), "MMM d")}
                    </div>
                    <div className="col-span-2 sm:col-span-2 text-right text-body-small tabular-nums">
                      {Math.floor(myScore.time / 60)}:
                      {(myScore.time % 60).toString().padStart(2, "0")}
                    </div>
                    <div className="hidden sm:block sm:col-span-2 text-right text-body-small text-muted-foreground">
                      {race.raceGames.length}
                    </div>
                    <div className="hidden sm:block sm:col-span-1 text-right">
                      <DlesButton
                        href={`/race/${race.id}/results`}
                        variant="ghost"
                        size="icon-sm"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100"
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

      {/* Hidden Games */}
      {hiddenGames.length > 0 && (
        <div className="rounded-xl border border-border/40 bg-card p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-heading-card">Hidden Games</h3>
            </div>
            <Badge variant="secondary" className="text-micro">
              {hiddenGames.length}
            </Badge>
          </div>
          <div className="divide-y divide-border/30 rounded-lg border border-border/30">
            {hiddenGames.map((game) => (
              <div
                key={game.id}
                className="flex items-center justify-between p-3"
              >
                <span className="text-body">{game.title}</span>
                <button
                  className="text-body-small text-primary hover:underline"
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
