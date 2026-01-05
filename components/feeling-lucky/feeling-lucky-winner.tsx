import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import { GameCard } from "@/components/game-card";
import { Button } from "@/components/ui/button";
import type { Game } from "@/app/generated/prisma/client";

interface FeelingLuckyWinnerProps {
  winner: Game;
  onPlay: () => void;
  onSpinAgain: () => void;
}

export function FeelingLuckyWinner({
  winner,
  onPlay,
  onSpinAgain,
}: FeelingLuckyWinnerProps) {
  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in zoom-in-95 duration-500 ease-out">
      <div className="flex flex-col items-center justify-center flex-1 min-h-[250px] gap-6">
        <div className="relative w-full max-w-[280px]">
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
        {winner.description && (
          <div className="w-full max-w-[320px] text-center">
            <p className="text-sm text-muted-foreground leading-relaxed animate-in fade-in slide-in-from-bottom-3 duration-700 delay-200 fill-mode-both">
              {winner.description}
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 mt-auto pt-2">
        <Button onClick={onPlay} className="w-full h-11 shadow-sm gap-2">
          Play Game
          <ArrowRight className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          onClick={onSpinAgain}
          className="text-muted-foreground hover:text-foreground text-xs"
        >
          Spin again
        </Button>
      </div>
    </div>
  );
}
