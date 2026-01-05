"use client";

import { cn } from "@/lib/utils";
import { GameCard } from "@/components/game-card";
import { Button } from "@/components/ui/button";
import type { Game } from "@/app/generated/prisma/client";

interface FeelingLuckySpinnerProps {
  currentGame: Game | null;
}

export function FeelingLuckySpinner({ currentGame }: FeelingLuckySpinnerProps) {
  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex flex-col items-center justify-center min-h-[320px] relative">
        {currentGame && (
          <div className="relative w-full max-w-[280px] transition-all duration-100 scale-90 blur-[2px] opacity-70 rotate-1 perspective-1000">
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
        )}
      </div>

      <Button
        disabled
        variant="secondary"
        className="w-full h-12 text-lg font-bold tracking-widest bg-zinc-800/50 text-zinc-500 border-2 border-zinc-800"
      >
        CALCULATING ODDS...
      </Button>
    </div>
  );
}
