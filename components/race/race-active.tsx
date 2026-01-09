"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DlesBadge } from "@/components/design/dles-badge";
import { formatTopic } from "@/lib/utils";
import { GameModal } from "@/components/features/games/game-modal";
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

  // Replace expanded ID with modal state
  const [activeGameId, setActiveGameId] = useState<string | null>(null);

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
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, "0")}:${s
        .toString()
        .padStart(2, "0")}`;
    }
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

  // Auto-select first playable game on load if none selected
  useEffect(() => {
    if (!activeGameId && race.status === "active") {
      const firstNext = race.raceGames.find((rg, index) => {
        const myCompletion = getCompletionForUser(rg.id, myParticipant?.id);
        const isLocked =
          index > 0 &&
          !getCompletionForUser(
            race.raceGames[index - 1].id,
            myParticipant?.id
          );
        return !myCompletion && !isLocked;
      });
      if (firstNext) setActiveGameId(firstNext.id);
    }
  }, [race.raceGames, activeGameId, race.status, myParticipant?.id]);

  const handleCompleteGame = async (
    raceGameId: string,
    skipped: boolean = false
  ) => {
    try {
      // Optimistic update for immediate UI response
      const nextGameIndex =
        race.raceGames.findIndex((g) => g.id === raceGameId) + 1;
      const nextGame = race.raceGames[nextGameIndex];

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

        // Auto-advance logic
        if (nextGame) {
          setActiveGameId(nextGame.id);
        } else {
          setActiveGameId(null);
        }

        onRefresh();
      } else {
        toast.error("Failed to complete game");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred");
    }
  };

  const activeGame = race.raceGames.find((rg) => rg.id === activeGameId);

  // Mark unsupported handler - no-op for races since game embed status
  // doesn't need to persist from race context
  const handleMarkUnsupported = async (_id: string) => {
    // No-op for races
  };

  const isAllFinished =
    myParticipant?.completions?.length === race.raceGames.length;

  return (
    <div className="h-screen bg-black flex items-center justify-center overflow-hidden p-6">
      {/* Main Content Area - constrained height (approx 90vh due to padding) */}
      <div className="flex w-full max-w-[1800px] h-[92vh] gap-6">
        {isAllFinished && race.status === "active" ? (
          // Waiting Screen - Centered floating card
          <div className="flex-1 flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-500 rounded-3xl border border-white/10 bg-zinc-900/50 backdrop-blur-md shadow-2xl">
            <div className="relative mb-12">
              <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full animate-pulse" />
              <div className="relative bg-black/40 border border-white/10 p-10 rounded-3xl shadow-2xl flex flex-col items-center gap-6 min-w-[380px] backdrop-blur-md">
                <Loader2 className="h-16 w-16 text-primary animate-spin" />
                <h2 className="text-3xl font-bold mt-2 text-center text-white">
                  Waiting on{" "}
                  {opponent?.user?.name || opponent?.guestName || "Opponent"}...
                </h2>
                <div className="text-muted-foreground font-mono text-center space-y-2">
                  <p className="text-xs uppercase tracking-widest opacity-60">
                    OPPONENT PROGRESS
                  </p>
                  <p className="text-2xl font-black text-white tracking-tight">
                    {opponent?.completions?.length || 0}
                    <span className="text-white/20 mx-2">/</span>
                    {race.raceGames.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center gap-2 mt-8 opacity-0 animate-in fade-in slide-in-from-bottom-4 delay-300 fill-mode-forwards">
              <span className="text-xs font-bold text-white/40 uppercase tracking-[0.2em]">
                Your Finish Time
              </span>
              <span className="text-7xl font-black font-mono tracking-tighter text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.3)]">
                {formatTime(
                  (myParticipant?.finishedAt
                    ? new Date(myParticipant.finishedAt).getTime()
                    : Date.now()) /
                    1000 -
                    new Date(race.startedAt || Date.now()).getTime() / 1000
                )}
              </span>
            </div>
          </div>
        ) : (
          <>
            {/* Left: GameContainer (Iframe) */}
            <div className="flex-1 relative flex flex-col min-w-0 rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/10 bg-zinc-900/50 backdrop-blur-sm">
              {activeGame ? (
                <>
                  <iframe
                    src={activeGame.game.link}
                    title={activeGame.game.title}
                    className="absolute inset-0 w-full h-full border-0"
                    sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  />
                  {/* Overlay Action Bar */}
                  <div className="absolute bottom-6 right-6 flex items-center gap-3">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-10 px-5 text-xs font-bold border-white/5 text-rose-400 bg-black/80 backdrop-blur-md hover:bg-rose-500/10 hover:text-rose-300 hover:border-rose-500/30 transition-all uppercase tracking-wider rounded-xl shadow-lg"
                      onClick={() => handleCompleteGame(activeGame.id, true)}
                    >
                      <SkipForward className="h-3.5 w-3.5 mr-2" />
                      Skip
                    </Button>
                    <Button
                      size="sm"
                      className="h-10 px-6 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white backdrop-blur-md shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all uppercase tracking-wider border-0 rounded-xl"
                      onClick={() => handleCompleteGame(activeGame.id, false)}
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Done
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8 text-center space-y-6">
                  <div className="p-6 rounded-full bg-white/5 border border-white/10 shadow-inner">
                    <SkipForward className="h-10 w-10 opacity-40" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-white">
                      Select a game to start
                    </h3>
                    <p className="text-white/40">
                      Choose an available game from the list on the right.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Right: InfoBox (Sidebar) */}
            <div className="flex-none w-[340px] flex flex-col rounded-3xl ring-1 ring-white/10 bg-zinc-900/50 backdrop-blur-sm overflow-hidden shadow-2xl">
              {/* Sidebar Header: Stats & Timer */}
              <div className="p-6 pb-6 space-y-6 bg-black/20">
                {/* Timer */}
                <div className="flex items-center justify-center py-5 rounded-2xl bg-black/40 border border-white/5 shadow-inner group transition-colors hover:border-white/10">
                  <Timer className="h-5 w-5 text-primary mr-3 opacity-90 group-hover:scale-110 transition-transform" />
                  <span className="text-4xl font-black tabular-nums tracking-tight text-white font-mono drop-shadow-md">
                    {formatTime(time)}
                  </span>
                </div>

                {/* Progress Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-black/20 border border-white/5 hover:bg-black/30 transition-colors">
                    <span className="text-[10px] uppercase font-bold text-white/40 mb-1.5 tracking-wider">
                      YOU
                    </span>
                    <span className="text-2xl font-black tabular-nums leading-none text-white">
                      <span className="text-primary">
                        {myParticipant?.completions?.length || 0}
                      </span>
                      <span className="text-white/10 text-lg mx-1.5">/</span>
                      <span className="text-white/30 text-lg">
                        {race.raceGames.length}
                      </span>
                    </span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-black/20 border border-white/5 hover:bg-black/30 transition-colors">
                    <span className="text-[10px] uppercase font-bold text-white/40 mb-1.5 tracking-wider truncate max-w-[90px]">
                      {(
                        opponent?.user?.name ||
                        opponent?.guestName ||
                        "OPP"
                      ).slice(0, 8)}
                    </span>
                    <span className="text-2xl font-black tabular-nums leading-none text-white">
                      <span className="text-primary">
                        {opponent?.completions?.length || 0}
                      </span>
                      <span className="text-white/10 text-lg mx-1.5">/</span>
                      <span className="text-white/30 text-lg">
                        {race.raceGames.length}
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="h-px bg-white/5 w-full" />

              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                {race.raceGames.map((rg, index) => {
                  const myCompletion = getCompletionForUser(
                    rg.id,
                    myParticipant?.id
                  );
                  const isLocked =
                    index > 0 &&
                    !getCompletionForUser(
                      race.raceGames[index - 1].id,
                      myParticipant?.id
                    );
                  const isActive = activeGameId === rg.id;
                  const canPlay = !myCompletion && !isLocked;

                  return (
                    <button
                      key={rg.id}
                      onClick={() => canPlay && setActiveGameId(rg.id)}
                      disabled={!canPlay}
                      className={cn(
                        "w-full text-left relative p-4 rounded-2xl transition-all duration-300 group border select-none",
                        isActive
                          ? "bg-primary/10 border-primary/30 shadow-[0_0_25px_-10px_rgba(var(--primary),0.3)] z-10"
                          : myCompletion
                          ? "bg-transparent border-transparent hover:bg-white/5 opacity-40 hover:opacity-100 grayscale hover:grayscale-0 scale-[0.98] hover:scale-100"
                          : "bg-transparent border-transparent opacity-20 cursor-not-allowed grayscale scale-[0.98]"
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 space-y-1.5">
                          <div className="flex items-center gap-2">
                            <DlesBadge
                              text={formatTopic(rg.game.topic)}
                              color={rg.game.topic}
                              size="xs"
                              className={cn(
                                "transition-opacity font-mono tracking-wider text-[10px] px-1.5 py-0.5 min-w-0",
                                isActive ? "opacity-100" : "opacity-60"
                              )}
                            />
                            {isActive && (
                              <span className="flex h-1.5 w-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(var(--primary),0.8)]" />
                            )}
                          </div>
                          <h4
                            className={cn(
                              "font-bold text-sm leading-snug truncate pr-2 transition-colors font-mono",
                              isActive
                                ? "text-white"
                                : "text-muted-foreground group-hover:text-white"
                            )}
                          >
                            {rg.game.title}
                          </h4>
                        </div>

                        <div className="shrink-0 flex flex-col items-end gap-1.5 pt-0.5">
                          <span className="text-[10px] font-bold text-white/20 tabular-nums font-mono">
                            #{String(index + 1).padStart(2, "0")}
                          </span>
                          {myCompletion ? (
                            myCompletion.skipped ? (
                              <SkipForward className="h-3.5 w-3.5 text-rose-500" />
                            ) : (
                              <Check className="h-3.5 w-3.5 text-emerald-500" />
                            )
                          ) : null}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
