"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DlesTopic } from "@/components/dles-topic";
import { Race } from "@/app/race/[id]/page";
import { Trophy, Home, RotateCcw, Clock, List } from "lucide-react";
import Link from "next/link";
import confetti from "canvas-confetti";
import { TOPIC_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/page-header";

interface RaceResultsProps {
  race: Race;
  currentUser: { id: string; name: string } | null;
}

// Format duration helper (seconds -> m:ss)
const formatDuration = (seconds: number | null) => {
  if (seconds === null) return "--:--";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
};

// Generate a deterministic color for guest avatars based on name
const getAvatarColor = (name: string) => {
  const colors = [
    "bg-red-500",
    "bg-orange-500",
    "bg-amber-500",
    "bg-green-500",
    "bg-emerald-500",
    "bg-teal-500",
    "bg-cyan-500",
    "bg-sky-500",
    "bg-blue-500",
    "bg-indigo-500",
    "bg-violet-500",
    "bg-purple-500",
    "bg-fuchsia-500",
    "bg-pink-500",
    "bg-rose-500",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

const getInitials = (name: string) => {
  return name && name.trim().length > 0
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "G";
};

export function RaceResults({ race, currentUser }: RaceResultsProps) {
  const [guestId, setGuestId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(`race_guest_${race.id}`);
      if (stored) setGuestId(stored);
    }
  }, [race.id]);

  // 1. Sort Games by Order
  const sortedGames = useMemo(
    () => [...race.raceGames].sort((a, b) => a.order - b.order),
    [race.raceGames]
  );

  // 2. Calculate Durations (Splits) per Participant
  const participantsWithSplits = useMemo(() => {
    return race.participants.map((p) => {
      let prevTime = 0;
      const splits = sortedGames.map((rg) => {
        const c = p.completions.find((x) => x.raceGameId === rg.id);
        if (!c) {
          return {
            id: rg.id,
            duration: null,
            skipped: false,
            cumulative: null,
          };
        }
        const duration = c.timeToComplete - prevTime;
        const cumulative = c.timeToComplete;
        prevTime = cumulative;

        return { id: rg.id, duration, skipped: c.skipped, cumulative };
      });

      return { ...p, splits };
    });
  }, [race.participants, sortedGames]);

  // 3. Sort Participants by:
  //    a) Completion Count (Non-skipped) - Descending
  //    b) Final Total Time - Ascending
  const sortedParticipants = useMemo(() => {
    return [...participantsWithSplits].sort((a, b) => {
      // Count non-skipped games
      const completedA = a.splits.filter(
        (s) => s.duration !== null && !s.skipped
      ).length;
      const completedB = b.splits.filter(
        (s) => s.duration !== null && !s.skipped
      ).length;

      // Primary Sort: Most completed games wins
      if (completedA !== completedB) {
        return completedB - completedA;
      }

      // Secondary Sort: Lowest total time wins
      const timeA = a.totalTime ?? Number.MAX_SAFE_INTEGER;
      const timeB = b.totalTime ?? Number.MAX_SAFE_INTEGER;
      return timeA - timeB;
    });
  }, [participantsWithSplits]);

  const winner = sortedParticipants[0];
  const isWinner =
    winner &&
    ((currentUser && winner.userId === currentUser.id) ||
      (guestId && winner.id === guestId));

  useEffect(() => {
    if (isWinner) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#FFD700", "#FFA500", "#FFFFFF", "#4F46E5"],
      });
    }
  }, [isWinner]);

  return (
    <div className="container max-w-xl mx-auto py-8 space-y-6 px-4">
      <PageHeader title="Race Results" subtitle="Match Summary" backHref="/" />

      {/* Hero / Winner Banner */}
      <div
        className={cn(
          "rounded-2xl p-6 text-center shadow-lg transition-all dark:shadow-none border border-border/50",
          isWinner
            ? "bg-gradient-to-br from-yellow-500/10 to-transparent border-yellow-500/20"
            : "bg-card"
        )}
      >
        <div className="flex flex-col items-center gap-4">
          <div
            className={cn(
              "h-16 w-16 rounded-full flex items-center justify-center shadow-sm",
              isWinner
                ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600"
                : "bg-red-100 dark:bg-red-900/30 text-red-600"
            )}
          >
            <Trophy className="h-8 w-8" />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight">
              {isWinner ? "Victory" : "Defeat"}
            </h2>
            <p className="text-sm font-medium text-muted-foreground">
              {isWinner
                ? "You finished first"
                : `${
                    winner.user?.name ?? winner.guestName ?? "Opponent"
                  } finished first`}
            </p>
          </div>
        </div>
      </div>

      {/* Compact Breakdown */}
      <Card className="border-border/60 shadow-md gap-0">
        <CardHeader className="px-4 py-3 border-b border-primary/10">
          <CardTitle className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2.5 text-primary/80">
            <List className="h-4 w-4" />
            Split Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border/40">
            {sortedGames.map((game) => {
              // Calculate best valid duration for green highlight
              const durations = participantsWithSplits
                .map((p) => {
                  const s = p.splits.find((x) => x.id === game.id);
                  return s && !s.skipped ? s.duration : null;
                })
                .filter((d): d is number => d !== null);
              const minD = durations.length > 0 ? Math.min(...durations) : null;

              return (
                <div
                  key={game.id}
                  className="px-3 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/5 transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-[120px]">
                    <DlesTopic
                      topic={game.game.topic}
                      className="text-[10px] uppercase font-bold px-1.5 h-5 min-w-[60px] justify-center"
                    />
                    <span className="font-bold text-sm truncate max-w-[150px]">
                      {game.game.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-sm flex-1 justify-end">
                    {sortedParticipants.map((p) => {
                      const split = p.splits.find((s) => s.id === game.id);
                      const duration = split?.duration ?? null;
                      const skipped = split?.skipped ?? false;
                      const isFastest =
                        duration !== null && duration === minD && !skipped;
                      // const isMe = (currentUser && p.userId === currentUser.id) || (guestId && p.id === guestId);

                      return (
                        <div
                          key={p.id}
                          className="flex items-center gap-2 min-w-[60px] justify-end"
                        >
                          {/* Small Avatar for Context */}
                          <div className="h-5 w-5 rounded-full overflow-hidden shrink-0 bg-muted hidden sm:block">
                            {p.user?.image ? (
                              <img
                                src={p.user.image}
                                alt={p.user.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div
                                className={cn(
                                  "h-full w-full flex items-center justify-center text-[8px] font-black text-white",
                                  getAvatarColor(
                                    p.user?.name ?? p.guestName ?? "G"
                                  )
                                )}
                              >
                                {getInitials(
                                  p.user?.name ?? p.guestName ?? "G"
                                )}
                              </div>
                            )}
                          </div>

                          <span
                            className={cn(
                              "font-mono font-medium tabular-nums",
                              skipped
                                ? "text-rose-600 dark:text-rose-400"
                                : isFastest
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-muted-foreground"
                            )}
                          >
                            {skipped ? "Lost" : formatDuration(duration)}
                          </span>

                          {/* Mini Trophy for Split Winner */}
                          {isFastest && (
                            <Trophy className="h-3 w-3 text-yellow-500 sm:hidden" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Total Row */}
          <div className="px-4 pt-4 border-t border-primary/10 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
            <span className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2.5 text-primary/80">
              <Clock className="h-4 w-4" /> Total
            </span>
            <div className="flex items-center gap-6 justify-end">
              {sortedParticipants.map((p, idx) => {
                const isFirst = idx === 0;
                return (
                  <div
                    key={p.id}
                    className="flex items-center gap-2 text-right"
                  >
                    <div
                      className={cn(
                        "h-6 w-6 rounded-full overflow-hidden shrink-0 border bg-muted",
                        isFirst && "ring-2 ring-yellow-500/50"
                      )}
                    >
                      {p.user?.image ? (
                        <img
                          src={p.user.image}
                          alt={p.user.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div
                          className={cn(
                            "h-full w-full flex items-center justify-center text-[9px] font-black text-white",
                            getAvatarColor(p.user?.name ?? p.guestName ?? "G")
                          )}
                        >
                          {getInitials(p.user?.name ?? p.guestName ?? "G")}
                        </div>
                      )}
                    </div>
                    <span
                      className={cn(
                        "font-bold font-mono text-lg tabular-nums",
                        isFirst
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-muted-foreground"
                      )}
                    >
                      {formatDuration(p.totalTime)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Button
          variant="outline"
          asChild
          className="col-span-1 rounded-xl font-bold h-11"
        >
          <Link href="/race/new">
            <RotateCcw className="h-4 w-4 mr-2" /> Create New Race
          </Link>
        </Button>
        <Button
          variant="outline"
          asChild
          className="col-span-1 rounded-xl font-bold h-11"
        >
          <Link href="/">
            <Home className="h-4 w-4 mr-2" /> Home
          </Link>
        </Button>
      </div>
    </div>
  );
}
