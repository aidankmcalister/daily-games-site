"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DlesTopic } from "@/components/design/dles-topic";
import { MicroLabel } from "@/components/design/micro-label";
import { Race, Participant, RaceGame } from "@/app/race/[id]/page";
import {
  Check,
  ExternalLink,
  Timer,
  Trophy,
  User,
  Loader2,
  SkipForward,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { TOPIC_COLORS } from "@/lib/constants";

interface RaceActiveProps {
  race: Race;
  currentUser: { id: string; name: string } | null;
  onRefresh: () => void;
}

export function RaceActive({ race, currentUser, onRefresh }: RaceActiveProps) {
  const [time, setTime] = useState(0);
  const [guestId, setGuestId] = useState<string | null>(null);

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

  const getCompletionForUser = (
    raceGameId: string,
    participantId: string | undefined
  ) => {
    if (!participantId) return null;
    const participant = race.participants.find((p) => p.id === participantId);
    return participant?.completions?.find((c) => c.raceGameId === raceGameId);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 md:px-8 space-y-8">
      {/* Header - 3 Equal Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
        {/* Your Progress */}
        <Card className="border-border/50 bg-card/50 shadow-sm flex">
          <CardContent className="flex-1 flex flex-col items-center justify-center text-center gap-2 p-6">
            <MicroLabel>You</MicroLabel>

            <div className="text-3xl font-black tracking-tight tabular-nums leading-none">
              <span className="text-primary">
                {myParticipant?.completions.length}
              </span>
              <span className="text-muted-foreground/30 mx-1">/</span>
              <span className="text-muted-foreground/50">
                {race.raceGames.length}
              </span>
            </div>

            <MicroLabel className="font-bold text-muted-foreground/50">
              Completed
            </MicroLabel>
          </CardContent>
        </Card>

        {/* Opponent Progress */}
        <Card className="border-border/50 bg-card/50 shadow-sm flex">
          <CardContent className="flex-1 flex flex-col items-center justify-center text-center gap-2 p-6">
            <MicroLabel>Opponent</MicroLabel>

            <div className="text-3xl font-black tracking-tight tabular-nums leading-none">
              <span className="text-primary">
                {opponent?.completions?.length || 0}
              </span>
              <span className="text-muted-foreground/30 mx-1">/</span>
              <span className="text-muted-foreground/50">
                {race.raceGames.length}
              </span>
            </div>

            <MicroLabel className="font-bold text-muted-foreground/50">
              Completed
            </MicroLabel>
          </CardContent>
        </Card>

        {/* Timer Card */}
        <Card className="border-primary/20 bg-primary/5 shadow-sm flex">
          <CardContent className="flex-1 flex flex-col items-center justify-center text-center gap-2 p-6">
            <div className="flex items-center justify-center gap-2 text-primary leading-none">
              <Timer className="h-4 w-4 shrink-0" />
              <span className="text-3xl font-black tracking-tight tabular-nums">
                {formatTime(time)}
              </span>
            </div>

            <MicroLabel className="font-bold text-primary/60">
              Race Time
            </MicroLabel>
          </CardContent>
        </Card>
      </div>

      {/* Games List - Vertical Stack */}
      <div className="space-y-4">
        {race.raceGames.map((rg, index) => {
          const myCompletion = getCompletionForUser(rg.id, myParticipant?.id);
          const opponentCompletion = getCompletionForUser(rg.id, opponent?.id);

          // Check if previous game is completed by current user
          const isLocked =
            index > 0 &&
            !getCompletionForUser(
              race.raceGames[index - 1].id,
              myParticipant?.id
            );

          return (
            <Card
              key={rg.id}
              className={cn(
                "overflow-hidden transition-all duration-300 border bg-card/50",
                myCompletion
                  ? myCompletion.skipped
                    ? "border-rose-500/20 bg-rose-500/5"
                    : "border-green-500/20 bg-green-500/5"
                  : "border-border/40 hover:border-primary/20 hover:bg-card",
                isLocked && "opacity-50 pointer-events-none grayscale"
              )}
            >
              <CardContent>
                <div className="space-y-3">
                  {/* Header Row: Title & Link */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-start">
                      <h3 className="text-xl font-black tracking-tight">
                        {rg.game.title}
                      </h3>
                      <DlesTopic topic={rg.game.topic} size="sm" />
                    </div>
                    <a
                      href={rg.game.link}
                      target="_blank"
                      rel="noopener noreferrer text-muted-foreground hover:underline decoration-muted-foreground/30 underline-offset-4 text-sm"
                      className="text-xs text-muted-foreground flex items-center gap-1 hover:text-primary transition-colors w-fit"
                    >
                      {rg.game.link.replace(/^https?:\/\//, "")}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>

                  <div className="h-px bg-border/40" />

                  {/* Status Section - Side by Side */}
                  <div className="grid grid-cols-2 gap-2">
                    {/* You Status */}
                    <div className="space-y-1.5">
                      <MicroLabel>You</MicroLabel>
                      {myCompletion ? (
                        myCompletion.skipped ? (
                          <div className="flex items-center gap-2 text-rose-500">
                            <SkipForward className="h-4 w-4" />
                            <span className="font-bold text-sm">Lost</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-green-500">
                            <Check className="h-4 w-4" />
                            <span className="font-bold tabular-nums text-sm">
                              {formatTime(myCompletion.timeToComplete)}
                            </span>
                          </div>
                        )
                      ) : (
                        <div className="flex items-center gap-2 text-muted-foreground/60">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          <span className="text-xs font-medium">Racing...</span>
                        </div>
                      )}
                    </div>

                    {/* Opponent Status */}
                    <div className="space-y-1.5 border-l pl-4 border-border/40">
                      <MicroLabel>Opponent</MicroLabel>
                      {opponentCompletion ? (
                        opponentCompletion.skipped ? (
                          <div className="flex items-center gap-2 text-rose-500">
                            <SkipForward className="h-4 w-4" />
                            <span className="font-bold text-sm">Lost</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-primary">
                            <Check className="h-4 w-4" />
                            <span className="font-bold tabular-nums text-sm">
                              {formatTime(opponentCompletion.timeToComplete)}
                            </span>
                          </div>
                        )
                      ) : (
                        <div className="flex items-center gap-2 text-muted-foreground/60">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          <span className="text-xs font-medium">Racing...</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="h-px bg-border/40" />

                  {/* Actions Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                    <Button
                      variant="outline"
                      className="h-10 rounded-xl text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      asChild
                    >
                      <a
                        href={rg.game.link}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-3.5 w-3.5 mr-2" />
                        Play Game
                      </a>
                    </Button>

                    {!myCompletion && (
                      <>
                        <Button
                          className="h-10 rounded-xl text-xs font-black uppercase tracking-widest bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-900/10 order-first sm:order-0"
                          onClick={() => handleCompleteGame(rg.id, false)}
                        >
                          <Check className="h-3.5 w-3.5 mr-2" />
                          Done
                        </Button>
                        <Button
                          variant="outline"
                          className="h-10 rounded-xl text-xs font-black uppercase tracking-widest border-rose-500/30 text-rose-600 hover:bg-rose-500/10 hover:border-rose-500/50"
                          onClick={() => handleCompleteGame(rg.id, true)}
                        >
                          <SkipForward className="h-3.5 w-3.5 mr-2" />
                          Lost
                        </Button>
                      </>
                    )}

                    {myCompletion && (
                      <div
                        className={cn(
                          "col-span-2 sm:col-span-2 flex items-center justify-center h-10 rounded-xl font-bold text-xs uppercase tracking-widest border",
                          myCompletion.skipped
                            ? "bg-rose-500/10 text-rose-600 border-rose-500/20"
                            : "bg-green-500/10 text-green-600 border-green-500/20"
                        )}
                      >
                        {myCompletion.skipped ? (
                          <>
                            <SkipForward className="h-3.5 w-3.5 mr-2" /> Lost
                          </>
                        ) : (
                          <>
                            <Check className="h-3.5 w-3.5 mr-2" /> Completed
                          </>
                        )}
                      </div>
                    )}
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
