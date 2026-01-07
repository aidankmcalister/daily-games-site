"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DlesBadge } from "@/components/design/dles-badge";
import { formatTopic } from "@/lib/utils";
import { Race } from "@/app/race/[id]/page";
import {
  Check,
  ExternalLink,
  Timer,
  Loader2,
  SkipForward,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface RaceActiveProps {
  race: Race;
  currentUser: { id: string; name: string } | null;
  onRefresh: () => void;
}

export function RaceActive({ race, currentUser, onRefresh }: RaceActiveProps) {
  const [time, setTime] = useState(0);
  const [guestId, setGuestId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(`race_guest_${race.id}`);
      if (stored) setGuestId(stored);
    }
  }, [race.id]);

  useEffect(() => {
    if (!race.startedAt) return;
    const start = new Date(race.startedAt).getTime();
    const interval = setInterval(() => {
      setTime(Math.floor((Date.now() - start) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [race.startedAt]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const myParticipant = race.participants.find(
    (p) =>
      (currentUser && p.userId === currentUser.id) ||
      (guestId && p.id === guestId)
  );
  const opponent = race.participants.find((p) => p.id !== myParticipant?.id);

  const getCompletionForUser = (
    raceGameId: string,
    participantId: string | undefined
  ) => {
    if (!participantId) return null;
    const participant = race.participants.find((p) => p.id === participantId);
    return participant?.completions?.find((c) => c.raceGameId === raceGameId);
  };

  // Find first incomplete game for auto-expand
  const firstIncompleteId = race.raceGames.find(
    (rg) => !getCompletionForUser(rg.id, myParticipant?.id)
  )?.id;

  const handleCompleteGame = async (
    raceGameId: string,
    skipped: boolean = false
  ) => {
    try {
      const res = await fetch(`/api/race/${race.id}/complete-game`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          raceGameId,
          skipped,
          participantId: myParticipant?.id,
        }),
      });
      if (res.ok) {
        toast.success(skipped ? "Game skipped!" : "Game marked as done!");
        onRefresh();
      } else {
        toast.error("Failed to complete game");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred");
    }
  };

  const isExpanded = (gameId: string) => {
    // Auto-expand first incomplete, or manually expanded
    if (expandedId === gameId) return true;
    if (expandedId === null && gameId === firstIncompleteId) return true;
    return false;
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
      {/* Compact Header Bar */}
      <div className="flex items-center justify-between gap-4 px-4 py-3 rounded-xl bg-card/60 border border-border/40 backdrop-blur-sm">
        {/* You */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground/60">
            You
          </span>
          <span className="text-lg font-black tabular-nums tracking-tight">
            <span className="text-primary">
              {myParticipant?.completions?.length || 0}
            </span>
            <span className="text-muted-foreground/30">/</span>
            <span className="text-muted-foreground/60">
              {race.raceGames.length}
            </span>
          </span>
        </div>

        {/* Timer */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
          <Timer className="h-3.5 w-3.5 text-primary" />
          <span className="text-sm font-black tabular-nums tracking-tight text-primary">
            {formatTime(time)}
          </span>
        </div>

        {/* Opponent */}
        <div className="flex items-center gap-2">
          <span className="text-lg font-black tabular-nums tracking-tight">
            <span className="text-primary">
              {opponent?.completions?.length || 0}
            </span>
            <span className="text-muted-foreground/30">/</span>
            <span className="text-muted-foreground/60">
              {race.raceGames.length}
            </span>
          </span>
          <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground/60">
            Opp
          </span>
        </div>
      </div>

      {/* Games List - Progressive Disclosure */}
      <div className="space-y-2">
        {race.raceGames.map((rg, index) => {
          const myCompletion = getCompletionForUser(rg.id, myParticipant?.id);
          const opponentCompletion = getCompletionForUser(rg.id, opponent?.id);
          const isLocked =
            index > 0 &&
            !getCompletionForUser(
              race.raceGames[index - 1].id,
              myParticipant?.id
            );
          const expanded = isExpanded(rg.id) && !myCompletion;

          return (
            <Card
              key={rg.id}
              className={cn(
                "overflow-hidden transition-all duration-200 ease-out border",
                myCompletion
                  ? myCompletion.skipped
                    ? "border-rose-500/20 bg-rose-500/5"
                    : "border-emerald-500/20 bg-emerald-500/5"
                  : expanded
                  ? "border-primary/30 bg-card shadow-lg shadow-primary/5"
                  : "border-border/30 bg-card/50 hover:border-border/50 hover:bg-card/80",
                isLocked && "opacity-40 pointer-events-none grayscale"
              )}
              onMouseEnter={() =>
                !myCompletion && !isLocked && setExpandedId(rg.id)
              }
            >
              <CardContent className="p-0">
                {/* Collapsed Row (always visible) */}
                <button
                  onClick={() =>
                    !myCompletion &&
                    !isLocked &&
                    setExpandedId(expanded ? null : rg.id)
                  }
                  className={cn(
                    "w-full flex items-center justify-between gap-3 px-4 py-3 text-left transition-colors",
                    !myCompletion && "hover:bg-muted/30 cursor-pointer"
                  )}
                >
                  {/* Left: Status Icon + Title */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {myCompletion ? (
                      myCompletion.skipped ? (
                        <div className="h-7 w-7 rounded-full bg-rose-500/10 flex items-center justify-center shrink-0">
                          <SkipForward className="h-3.5 w-3.5 text-rose-500" />
                        </div>
                      ) : (
                        <div className="h-7 w-7 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                          <Check className="h-3.5 w-3.5 text-emerald-500" />
                        </div>
                      )
                    ) : expanded ? (
                      <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Loader2 className="h-3.5 w-3.5 text-primary animate-spin" />
                      </div>
                    ) : (
                      <div className="h-7 w-7 rounded-full bg-muted/50 flex items-center justify-center shrink-0">
                        <span className="text-[10px] font-bold text-muted-foreground/50">
                          {index + 1}
                        </span>
                      </div>
                    )}

                    <span
                      className={cn(
                        "font-bold text-sm truncate",
                        myCompletion?.skipped && "text-rose-500/80",
                        myCompletion &&
                          !myCompletion.skipped &&
                          "text-emerald-600 dark:text-emerald-400",
                        !myCompletion && "text-foreground"
                      )}
                    >
                      {rg.game.title}
                    </span>
                  </div>

                  {/* Right: Times + Badge + Chevron */}
                  <div className="flex items-center gap-3 shrink-0">
                    {/* Times (compact) */}
                    <div className="hidden sm:flex items-center gap-2 text-[10px] font-mono tabular-nums text-muted-foreground/60">
                      <span
                        className={cn(
                          myCompletion &&
                            (myCompletion.skipped
                              ? "text-rose-400"
                              : "text-emerald-400")
                        )}
                      >
                        {myCompletion
                          ? myCompletion.skipped
                            ? "SKIP"
                            : formatTime(myCompletion.timeToComplete)
                          : "—:——"}
                      </span>
                      <span className="text-muted-foreground/20">|</span>
                      <span
                        className={cn(
                          opponentCompletion &&
                            (opponentCompletion.skipped
                              ? "text-rose-400"
                              : "text-primary")
                        )}
                      >
                        {opponentCompletion
                          ? opponentCompletion.skipped
                            ? "SKIP"
                            : formatTime(opponentCompletion.timeToComplete)
                          : "—:——"}
                      </span>
                    </div>

                    <DlesBadge
                      text={formatTopic(rg.game.topic)}
                      color={rg.game.topic}
                      size="xs"
                    />

                    {!myCompletion && (
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 text-muted-foreground/40 transition-transform duration-200",
                          expanded && "rotate-180"
                        )}
                      />
                    )}
                  </div>
                </button>

                {/* Expanded Content (actions) */}
                <div
                  className={cn(
                    "overflow-hidden transition-all duration-200 ease-out",
                    expanded ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
                  )}
                >
                  <div className="px-4 pb-4 pt-1 border-t border-border/30">
                    {/* Status Row */}
                    <div className="flex items-center gap-4 mb-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        <span>You: Racing...</span>
                      </div>
                      <span className="text-muted-foreground/30">•</span>
                      <div className="flex items-center gap-1.5">
                        {opponentCompletion ? (
                          opponentCompletion.skipped ? (
                            <span className="text-rose-500 font-medium">
                              Opp: Lost
                            </span>
                          ) : (
                            <span className="text-primary font-medium">
                              Opp:{" "}
                              {formatTime(opponentCompletion.timeToComplete)}
                            </span>
                          )
                        ) : (
                          <span>Opp: Racing...</span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-9 text-[10px] font-bold uppercase tracking-wider"
                        asChild
                      >
                        <a
                          href={rg.game.link}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-3 w-3 mr-1.5" />
                          Play
                        </a>
                      </Button>

                      <Button
                        size="sm"
                        className="h-9 text-[10px] font-black uppercase tracking-wider bg-emerald-600 hover:bg-emerald-500 text-white"
                        onClick={() => handleCompleteGame(rg.id, false)}
                      >
                        <Check className="h-3 w-3 mr-1.5" />
                        Done
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        className="h-9 text-[10px] font-black uppercase tracking-wider border-rose-500/30 text-rose-500 hover:bg-rose-500/10"
                        onClick={() => handleCompleteGame(rg.id, true)}
                      >
                        <SkipForward className="h-3 w-3 mr-1.5" />
                        Lost
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
