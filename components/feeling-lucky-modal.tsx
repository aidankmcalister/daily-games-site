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
              <div className="flex flex-col items-center gap-3 py-8">
                <Loader2
                  className={cn("h-8 w-8 animate-spin", activeTheme.spinnerInit)}
                />
                <span
                  className={cn(
                    "text-lg font-medium",
                    activeTheme.spinnerText
                  )}
                >
                  Finding your next game...
                </span>
              </div>
            ) : (
              <>
                <div
                  className={cn(
                    "text-sm font-bold tracking-[0.2em] opacity-90",
                    activeTheme.congratsText
                  )}
                >
                  CONGRATULATIONS
                </div>
                <span
                  className={cn(
                    "text-4xl font-bold tracking-tight",
                    activeTheme.winnerText
                  )}
                >
                  YOU WON!
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
