"use client";

import { cn } from "@/lib/utils";
import { Trophy } from "lucide-react";
import { GameCard } from "@/components/game-card";
import { Button } from "@/components/ui/button";
import type { Game } from "@/app/generated/prisma/client";
import { ThemeColors } from "./themes";

interface FeelingLuckyWinnerProps {
  winner: Game;
  theme: ThemeColors;
  onPlay: () => void;
  onSpinAgain: () => void;
}

export function FeelingLuckyWinner({
  winner,
  theme,
  onPlay,
  onSpinAgain,
}: FeelingLuckyWinnerProps) {
  return (
    <div className="flex flex-col gap-6 w-full animate-in zoom-in-95 duration-500">
      <div className="flex flex-col items-center justify-center min-h-[320px] relative">
        <div
          className={cn(
            "absolute inset-0 blur-3xl animate-pulse -z-10",
            theme.glow
          )}
        />

        <div className="relative w-full max-w-[280px] transition-all duration-500 scale-110 opacity-100 z-10 rotate-0">
          <div className="absolute -top-6 -right-6 z-20 animate-bounce">
            <div className="relative">
              <span
                className={cn(
                  "absolute inset-0 rounded-full blur-md animate-ping",
                  theme.bannerPing
                )}
              />
              <span
                className={cn(
                  "relative bg-linear-to-r text-white px-4 py-2 rounded-full text-sm font-black shadow-xl border-2 border-white flex items-center gap-1 uppercase tracking-widest rotate-12",
                  theme.banner
                )}
              >
                <Trophy className="h-4 w-4" /> #1 PICK
              </span>
            </div>
          </div>

          <div
            className={cn(
              "pointer-events-none transform transition-all ring-4 ring-offset-4 ring-offset-zinc-900 rounded-xl",
              theme.ring,
              theme.shadow.replace("50px", "30px")
            )}
          >
            <GameCard
              id={winner.id}
              title={winner.title}
              link={winner.link}
              topic={winner.topic}
              playCount={winner.playCount || 0}
              isPlayed={false}
              onPlay={() => {}}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 relative z-10">
        <Button
          onClick={onPlay}
          size="lg"
          className={cn(
            "w-full h-16 text-xl font-black uppercase tracking-widest bg-linear-to-r border-b-4 active:border-b-0 active:translate-y-1 transition-all shadow-xl animate-pulse",
            theme.button
          )}
        >
          <span className="flex items-center gap-2 drop-shadow-md">
            PLAY GAME NOW
          </span>
        </Button>
        <div className="text-center">
          <button
            onClick={onSpinAgain}
            className="text-xs text-muted-foreground hover:text-white underline decoration-dotted hover:decoration-solid transition-colors"
          >
            No thanks, I'll take another risk
          </button>
        </div>
      </div>
    </div>
  );
}
