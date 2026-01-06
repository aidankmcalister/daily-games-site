"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Clock, Check, SkipForward, ExternalLink } from "lucide-react";
import { DlesTopic } from "@/components/design/dles-topic";
import { cn } from "@/lib/utils";
import { formatDuration } from "@/components/features/race/race-utils";
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
  myParticipantId?: string;
}

export function ResultsList({
  sortedGames,
  participantsWithSplits,
  sortedParticipants,
  myParticipantId,
}: ResultsListProps) {
  // Identify "Me" and "Opponent(s)"
  // If myParticipantId is missing (spectator), treat 1st as p1, 2nd as p2 etc.
  // But usually we want to pivot around "Me".

  return (
    <div className="space-y-4">
      {/* Header Label */}
      <div className="px-1 flex items-center justify-between mb-2">
        <span className="text-micro text-muted-foreground/60">Breakdown</span>
      </div>

      <Card className="border-border/60 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="divide-y divide-border/30">
            {sortedGames.map((game) => {
              const mySplitComp = myParticipantId
                ? participantsWithSplits.find((p) => p.id === myParticipantId)
                : participantsWithSplits[0];

              const mySplit = mySplitComp?.splits.find((s) => s.id === game.id);

              const oppSplitComp = myParticipantId
                ? participantsWithSplits.find((p) => p.id !== myParticipantId)
                : participantsWithSplits[1];

              const oppSplit = oppSplitComp?.splits.find(
                (s) => s.id === game.id
              );

              const isMySuccess = mySplit && !mySplit.skipped;
              const isMyFailure = mySplit && mySplit.skipped;

              return (
                <div
                  key={game.id}
                  className="flex items-center justify-between p-3 px-4 hover:bg-muted/5 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <a
                      href={game.game.link}
                      target="_blank"
                      className="text-body font-bold tracking-tight hover:underline underline-offset-4 decoration-muted-foreground/30"
                    >
                      {game.game.title}
                    </a>
                    <DlesTopic topic={game.game.topic} size="xs" />
                  </div>

                  <div className="flex items-center gap-3 font-mono text-sm tabular-nums">
                    <span
                      className={cn(
                        "font-bold",
                        isMyFailure
                          ? "text-rose-600 dark:text-rose-400"
                          : isMySuccess
                          ? "text-green-600 dark:text-green-400"
                          : "text-muted-foreground"
                      )}
                    >
                      {mySplit?.skipped
                        ? "Lost"
                        : formatDuration(mySplit?.duration || null)}
                    </span>

                    {oppSplitComp && (
                      <>
                        <span className="text-muted-foreground/20 text-xs">
                          /
                        </span>
                        <span
                          className={cn(
                            "text-muted-foreground",
                            oppSplit?.skipped && "text-rose-500/70"
                          )}
                        >
                          {oppSplit?.skipped
                            ? "Lost"
                            : formatDuration(oppSplit?.duration || null)}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Total Row */}
            <div className="p-3 px-4 bg-muted/5 border-t border-border/40 flex items-center justify-between">
              <span className="text-micro text-muted-foreground">Total</span>
              <div className="flex items-center gap-4">
                {sortedParticipants.map((p, idx) => {
                  const isMe = myParticipantId
                    ? p.id === myParticipantId
                    : idx === 0;
                  return (
                    <span
                      key={p.id}
                      className={cn(
                        "font-mono font-bold tabular-nums",
                        isMe ? "text-foreground" : "text-muted-foreground"
                      )}
                    >
                      {formatDuration(p.totalTime)}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
