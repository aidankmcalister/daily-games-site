"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import type { Game } from "@/app/generated/prisma/client";
import { cn } from "@/lib/utils";
import { TOPIC_THEMES } from "./feeling-lucky/themes";
import { useFeelingLucky } from "./feeling-lucky/use-feeling-lucky";
import { FeelingLuckyWinner } from "./feeling-lucky/feeling-lucky-winner";
import { FeelingLuckySpinner } from "./feeling-lucky/feeling-lucky-spinner";

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
  const { currentGame, isSpinning, winner, spin } = useFeelingLucky(
    games,
    playedIds,
    open
  );

  const handlePlayWinner = () => {
    if (winner) {
      onPlay(winner.id);
      window.open(winner.link, "_blank", "noopener,noreferrer");
      onOpenChange(false);
    }
  };

  const activeTheme =
    !isSpinning && winner && winner.topic
      ? TOPIC_THEMES[winner.topic] || TOPIC_THEMES["trivia"]
      : TOPIC_THEMES["trivia"];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "sm:max-w-md bg-linear-to-b from-zinc-900 via-zinc-900 to-black border-4 overflow-hidden transition-colors duration-500",
          activeTheme.border,
          activeTheme.shadow
        )}
      >
        <DialogHeader className="text-center pb-2 relative z-10">
          <DialogTitle className="flex flex-col items-center justify-center gap-2">
            {isSpinning ? (
              <>
                <Loader2
                  className={cn(
                    "h-8 w-8 animate-spin",
                    activeTheme.spinnerInit
                  )}
                />
                <span
                  className={cn(
                    "text-xl font-bold bg-clip-text text-transparent bg-linear-to-r animate-pulse",
                    activeTheme.spinnerText
                  )}
                >
                  SEARCHING FOR WINNER...
                </span>
              </>
            ) : (
              <>
                <div
                  className={cn(
                    "absolute inset-0 blur-3xl animate-pulse -z-10",
                    activeTheme.glow
                  )}
                />
                <div
                  className={cn(
                    "text-sm font-bold tracking-[0.2em] animate-bounce",
                    activeTheme.congratsText
                  )}
                >
                  ★ CONGRATULATIONS ★
                </div>
                <span
                  className={cn(
                    "text-4xl md:text-5xl font-black italic tracking-tighter text-transparent bg-clip-text bg-linear-to-r animate-shimmer drop-shadow-sm",
                    activeTheme.winnerText
                  )}
                >
                  YOU WON!
                </span>
                <span className="text-xs text-muted-foreground font-mono">
                  (Woah!)
                </span>
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="relative">
          {!isSpinning && winner ? (
            <FeelingLuckyWinner
              winner={winner}
              theme={activeTheme}
              onPlay={handlePlayWinner}
              onSpinAgain={spin}
            />
          ) : (
            <FeelingLuckySpinner currentGame={currentGame} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
