"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Game } from "@/app/generated/prisma/client";
import { cn } from "@/lib/utils";
import { Dices } from "lucide-react";
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-zinc-950 border-border/50 p-6 flex flex-col justify-between min-h-[520px]">
        <DialogHeader className="pb-4 border-b border-border/50 shrink-0">
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold tracking-tight">
            <Dices className="h-4 w-4 text-primary" />
            Feeling Lucky
          </DialogTitle>
        </DialogHeader>

        <div className="pt-6 flex-1 flex flex-col justify-center">
          {!isSpinning && winner ? (
            <FeelingLuckyWinner
              winner={winner}
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
