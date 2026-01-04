"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Game } from "@/app/generated/prisma/client";
import canvasConfetti from "canvas-confetti";
import { GameCard } from "@/components/game-card";
import { TOPIC_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { ArrowRight, Loader2, Sparkles, Trophy, Star } from "lucide-react";

interface FeelingLuckyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  games: Game[];
  onPlay: (id: string) => void;
  playedIds: Set<string>;
}

export function FeelingLuckyModal({
  open,
  onOpenChange,
  games,
  onPlay,
  playedIds,
}: FeelingLuckyModalProps) {
  const [currentGame, setCurrentGame] = useState<Game | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<Game | null>(null);

  // Ref to track animation frame to cancel it if closed
  const timeoutRef = useRef<NodeJS.Timeout>(null);

  const spin = useCallback(() => {
    if (games.length === 0) return;

    setIsSpinning(true);
    setWinner(null);
    setCurrentGame(null);

    // Filter unplayed games to prefer them, but fallback to all if needed
    const unplayedGames = games.filter((g) => !playedIds.has(g.id));
    const pool = unplayedGames.length > 0 ? unplayedGames : games;

    // Pick a winner upfront
    const winningGame = pool[Math.floor(Math.random() * pool.length)];

    let speed = 50; // Initial speed (ms per tick)
    let elapsed = 0;
    const totalDuration = 3000 + Math.random() * 1000; // 3-4 seconds

    const tick = () => {
      // Pick a random game to show for "spinning" effect
      const randomShow = games[Math.floor(Math.random() * games.length)];
      setCurrentGame(randomShow);

      elapsed += speed;
      // Exponentially increase delay to simulate slowing down
      speed = speed * 1.1;

      if (elapsed < totalDuration) {
        timeoutRef.current = setTimeout(tick, speed);
      } else {
        // Land on winner
        setCurrentGame(winningGame);
        setWinner(winningGame);
        setIsSpinning(false);
        fireConfetti();
        const audio = new Audio("/airhorn.mp3");
        audio.play().catch((e) => console.error("Audio play failed:", e));
      }
    };

    tick();
  }, [games, playedIds]);

  useEffect(() => {
    if (open) {
      spin();
    } else {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setIsSpinning(false);
      setWinner(null);
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [open, spin]);

  const fireConfetti = () => {
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      canvasConfetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ["#22c55e", "#3b82f6", "#f59e0b", "#ef4444"],
      });
      canvasConfetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ["#22c55e", "#3b82f6", "#f59e0b", "#ef4444"],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();
  };

  const handlePlayWinner = () => {
    if (winner) {
      onPlay(winner.id);
      window.open(winner.link, "_blank", "noopener,noreferrer");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-linear-to-b from-zinc-900 via-zinc-900 to-black border-4 border-yellow-500/50 shadow-[0_0_50px_rgba(234,179,8,0.3)] overflow-hidden">
        <DialogHeader className="text-center pb-2 relative z-10">
          <DialogTitle className="flex flex-col items-center justify-center gap-2">
            {isSpinning ? (
              <>
                <Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
                <span className="text-xl font-bold bg-clip-text text-transparent bg-linear-to-r from-yellow-400 to-orange-500 animate-pulse">
                  SEARCHING FOR WINNER...
                </span>
              </>
            ) : (
              <>
                <div className="absolute inset-0 bg-yellow-500/20 blur-3xl animate-pulse -z-10" />
                <div className="text-sm font-bold tracking-[0.2em] text-yellow-500 animate-bounce">
                  ★ CONGRATULATIONS ★
                </div>
                <span className="text-4xl md:text-5xl font-black italic tracking-tighter text-transparent bg-clip-text bg-linear-to-r from-yellow-300 via-orange-400 to-yellow-300 animate-shimmer drop-shadow-sm">
                  YOU WON!
                </span>
                <span className="text-xs text-muted-foreground font-mono">
                  (Woah!)
                </span>
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center py-8 min-h-[320px] relative">
          {/* Background Effects */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-yellow-500/10 via-transparent to-transparent animate-pulse" />

          {currentGame && (
            <div
              className={cn(
                "relative w-full max-w-[280px] transition-all duration-100 perspective-1000",
                isSpinning
                  ? "scale-90 blur-[2px] opacity-70 rotate-1"
                  : "scale-110 opacity-100 z-10 rotate-0"
              )}
            >
              {winner && (
                <div className="absolute -top-6 -right-6 z-20 animate-bounce">
                  <div className="relative">
                    <span className="absolute inset-0 bg-red-600 rounded-full blur-md animate-ping" />
                    <span className="relative bg-linear-to-r from-red-600 to-red-500 text-white px-4 py-2 rounded-full text-sm font-black shadow-xl border-2 border-white flex items-center gap-1 uppercase tracking-widest rotate-12">
                      <Trophy className="h-4 w-4" /> #1 PICK
                    </span>
                  </div>
                </div>
              )}

              <div
                className={cn(
                  "pointer-events-none transform transition-all",
                  !isSpinning &&
                    "ring-4 ring-yellow-400 ring-offset-4 ring-offset-zinc-900 rounded-xl shadow-[0_0_30px_rgba(234,179,8,0.4)]"
                )}
              >
                <GameCard
                  id={currentGame.id}
                  title={currentGame.title}
                  link={currentGame.link}
                  topic={currentGame.topic}
                  playCount={currentGame.playCount || 0}
                  isPlayed={false}
                  onPlay={() => {}}
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 relative z-10">
          {!isSpinning && winner ? (
            <>
              <Button
                onClick={handlePlayWinner}
                size="lg"
                className="w-full h-16 text-xl font-black uppercase tracking-widest bg-linear-to-r from-green-600 via-green-500 to-green-600 hover:from-green-500 hover:to-green-500 border-b-4 border-green-800 active:border-b-0 active:translate-y-1 transition-all shadow-green-900/50 shadow-xl animate-pulse"
              >
                <span className="flex items-center gap-2 drop-shadow-md">
                  PLAY GAME NOW
                </span>
              </Button>
              <div className="text-center">
                <button
                  onClick={() => spin()}
                  className="text-xs text-muted-foreground hover:text-white underline decoration-dotted hover:decoration-solid transition-colors"
                >
                  No thanks, I'll take another risk
                </button>
              </div>
            </>
          ) : (
            <Button
              disabled
              variant="secondary"
              className="w-full h-12 text-lg font-bold tracking-widest bg-zinc-800/50 text-zinc-500 border-2 border-zinc-800"
            >
              CALCULATING ODDS...
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
