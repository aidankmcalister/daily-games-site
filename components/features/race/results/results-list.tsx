"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { List, Trophy, Clock } from "lucide-react";
import { DlesTopic } from "@/components/design/dles-topic";
import { cn } from "@/lib/utils";
import {
  formatDuration,
  getAvatarColor,
  getInitials,
} from "@/components/features/race/race-utils";
import { RaceGame, Participant } from "@/app/race/[id]/page";

// Types
export interface ParticipantSplit {
  id: string; // raceGameId
  duration: number | null;
  skipped: boolean;
  cumulative: number | null;
}

export type ParticipantWithSplits = Participant & {
  splits: ParticipantSplit[];
};

export type RaceGameWithGame = RaceGame;

interface ResultsListProps {
  sortedGames: RaceGameWithGame[];
  participantsWithSplits: ParticipantWithSplits[];
  sortedParticipants: ParticipantWithSplits[];
}

export function ResultsList({
  sortedGames,
  participantsWithSplits,
  sortedParticipants,
}: ResultsListProps) {
  return (
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
              .map((p: ParticipantWithSplits) => {
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
                              alt={p.user.name ?? ""}
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
                              {getInitials(p.user?.name ?? p.guestName ?? "G")}
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
                <div key={p.id} className="flex items-center gap-2 text-right">
                  <div
                    className={cn(
                      "h-6 w-6 rounded-full overflow-hidden shrink-0 border bg-muted",
                      isFirst && "ring-2 ring-yellow-500/50"
                    )}
                  >
                    {p.user?.image ? (
                      <img
                        src={p.user.image}
                        alt={p.user.name ?? ""}
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
  );
}
