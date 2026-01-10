"use client";

import React from "react";
import { cn, formatTopic } from "@/lib/utils";
import { DlesBadge } from "@/components/design/dles-badge";
import { Check, SkipForward, Clock, Trophy, Zap, Layers } from "lucide-react";
import { Participant } from "@/app/race/[id]/page";

// Extended types for results processing
export interface Split {
  id: string; // game id
  duration: number | null; // null if skipped or not reached
  skipped: boolean;
  cumulative: number | null;
}

export interface ParticipantWithSplits extends Participant {
  splits: Split[];
}

export interface RaceGameWithGame {
  id: string;
  game: {
    title: string;
    topic: string;
  };
}

interface ResultsListProps {
  sortedGames: RaceGameWithGame[];
  participantsWithSplits: ParticipantWithSplits[];
  sortedParticipants: ParticipantWithSplits[]; // Assuming we might want leaderboards later
  myParticipantId: string | undefined;
}

// Helper for Avatar
function ParticipantAvatar({
  participant,
  className,
}: {
  participant: ParticipantWithSplits | undefined;
  className?: string;
}) {
  if (!participant)
    return (
      <div className={cn("h-8 w-8 rounded-full bg-zinc-800", className)} />
    );

  const name = participant.user?.name || participant.guestName || "Player";
  const image = participant.user?.image;

  return (
    <div
      className={cn(
        "h-8 w-8 shrink-0 rounded-full bg-zinc-800 overflow-hidden border border-white/10 flex items-center justify-center",
        className
      )}
      title={name}
    >
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt={name} className="h-full w-full object-cover" />
      ) : (
        <span className="text-[10px] font-bold text-white/40">
          {name[0].toUpperCase()}
        </span>
      )}
    </div>
  );
}

export function ResultsList({
  sortedGames,
  sortedParticipants,
  myParticipantId,
}: ResultsListProps) {
  const myResults = sortedParticipants.find((p) => p.id === myParticipantId);
  const mySplits = myResults?.splits || [];

  const formatTime = (seconds: number | null) => {
    if (seconds === null) return "--:--";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const opponent = sortedParticipants.find((p) => p.id !== myParticipantId);
  const opponentName =
    opponent?.user?.name || opponent?.guestName || "Opponent";

  return (
    <div
      className="space-y-2 animate-in slide-in-from-bottom-8 duration-700 fade-in"
      style={{ animationDelay: "200ms" }}
    >
      {/* Column Headers (Desktop) */}
      <div className="hidden md:grid grid-cols-2 gap-4 px-1 mb-2">
        <div className="flex items-center gap-2 pl-2">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            You
          </span>
        </div>
        <div className="flex items-center justify-end gap-2 pr-2">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider text-right">
            {opponentName}
          </span>
        </div>
      </div>

      <div className="relative space-y-2">
        {/* Center Divider for Desktop - Absolute to the list container */}
        <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-white/5 -translate-x-1/2 z-0" />

        {sortedGames.map((rg, idx) => {
          // My Stats
          const split = mySplits.find((s) => s.id === rg.id);
          const isSkipped = split?.skipped;
          const isCompleted =
            !!split && split.duration !== null && !split.skipped;

          // Opponent Stats (assuming 1v1 for now)
          const oppSplit = opponent?.splits.find((s) => s.id === rg.id);
          const oppSkipped = oppSplit?.skipped;
          const oppCompleted =
            !!oppSplit && oppSplit.duration !== null && !oppSplit.skipped;

          // Determine Encounter Winner
          let encounterWinnerId = null;
          let isTie = false;

          if (isCompleted && oppCompleted) {
            if (split!.duration === oppSplit!.duration) {
              isTie = true;
            } else {
              encounterWinnerId =
                split!.duration! < oppSplit!.duration!
                  ? myParticipantId
                  : opponent?.id;
            }
          } else if (isCompleted && !oppCompleted) {
            encounterWinnerId = myParticipantId;
          } else if (!isCompleted && oppCompleted) {
            encounterWinnerId = opponent?.id;
          }

          const iWonEncounter = encounterWinnerId === myParticipantId;
          const oppWonEncounter = encounterWinnerId === opponent?.id;

          return (
            <div
              key={rg.id}
              className="group relative grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {/* LEFT SIDE (ME) */}
              <div
                className={cn(
                  "relative flex items-center gap-4 min-w-0 p-4 rounded-2xl border-2 transition-all h-full z-10",
                  isSkipped
                    ? "bg-rose-500/5 border-rose-500/10"
                    : isCompleted
                    ? "bg-emerald-500/5 border-emerald-500/10"
                    : "bg-zinc-900/30 border-white/5",
                  oppWonEncounter ? "opacity-50" : "opacity-100"
                )}
              >
                {/* Avatar with Angled Trophy Overlay */}
                <div className="relative shrink-0 overflow-visible">
                  <ParticipantAvatar
                    participant={myResults}
                    className="h-10 w-10 border-2 border-white/5"
                  />
                  {iWonEncounter && (
                    <Trophy
                      className="absolute -top-3 -right-3 h-6 w-6 text-emerald-400 drop-shadow-[0_0_12px_rgba(52,211,153,0.8)] rotate-12 z-20 fill-emerald-950/50"
                      strokeWidth={2.5}
                    />
                  )}
                </div>

                {/* Time (Hero) */}
                <div className="flex flex-col justify-center min-w-16">
                  <span
                    className={cn(
                      "font-mono font-black text-xl leading-none tracking-tight",
                      isSkipped
                        ? "text-rose-400"
                        : isCompleted
                        ? "text-white"
                        : "text-white/20"
                    )}
                  >
                    {isSkipped ? "--:--" : formatTime(split?.duration || null)}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mt-1">
                    {isSkipped ? "Skipped" : isCompleted ? "Time" : "---"}
                  </span>
                </div>

                {/* Vertical Divider */}
                <div className="h-8 w-px bg-white/5 mx-2" />

                {/* Game Info */}
                <div className="flex flex-col min-w-0 flex-1 w-0">
                  <span
                    className={cn(
                      "truncate max-w-full font-bold text-sm",
                      isCompleted ? "text-white" : "text-zinc-500"
                    )}
                  >
                    {rg.game.title}
                  </span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <DlesBadge
                      text={formatTopic(rg.game.topic)}
                      color={rg.game.topic}
                      size="xs"
                      className="opacity-50 scale-90 origin-left"
                    />
                  </div>
                </div>
              </div>

              {/* RIGHT SIDE (OPPONENT) */}
              {opponent ? (
                <div
                  className={cn(
                    "relative flex items-center gap-4 min-w-0 p-4 rounded-2xl border-2 transition-all h-full justify-end text-right flex-row md:flex-row-reverse z-10",
                    oppSkipped
                      ? "bg-rose-500/5 border-rose-500/10"
                      : oppCompleted
                      ? "bg-emerald-500/5 border-emerald-500/10"
                      : "bg-zinc-900/30 border-white/5",
                    iWonEncounter ? "opacity-50" : "opacity-100"
                  )}
                >
                  {/* Avatar with Angled Trophy Overlay */}
                  <div className="relative shrink-0 overflow-visible">
                    <ParticipantAvatar
                      participant={opponent}
                      className="h-10 w-10 border-2 border-white/5"
                    />
                    {oppWonEncounter && (
                      <Trophy
                        className="absolute -top-3 -left-3 h-6 w-6 text-red-400 drop-shadow-[0_0_12px_rgba(250,0,21,0.8)] -rotate-12 z-20 fill-red-950/50"
                        strokeWidth={2.5}
                      />
                    )}
                  </div>

                  {/* Time (Hero) */}
                  <div className="flex flex-col justify-center items-end min-w-16">
                    <span
                      className={cn(
                        "font-mono font-black text-xl leading-none tracking-tight",
                        oppSkipped
                          ? "text-rose-400"
                          : oppCompleted
                          ? "text-white"
                          : "text-white/20"
                      )}
                    >
                      {oppSkipped
                        ? "--:--"
                        : formatTime(oppSplit?.duration || null)}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mt-1">
                      {oppSkipped ? "Skipped" : oppCompleted ? "Time" : "---"}
                    </span>
                  </div>

                  {/* Vertical Divider */}
                  <div className="h-8 w-px bg-white/5 mx-2" />

                  {/* Game Info */}
                  <div className="flex flex-col min-w-0 flex-1 w-0 items-end">
                    <span
                      className={cn(
                        "truncate max-w-full font-bold text-sm",
                        oppCompleted ? "text-white" : "text-zinc-500"
                      )}
                    >
                      {rg.game.title}
                    </span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <DlesBadge
                        text={formatTopic(rg.game.topic)}
                        color={rg.game.topic}
                        size="xs"
                        className="opacity-50 scale-90 origin-right"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="hidden md:flex items-center justify-center text-muted-foreground/30 text-xs italic bg-zinc-900/10 border-2 border-dashed border-zinc-800 rounded-2xl z-10">
                  Waiting for opponent...
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
