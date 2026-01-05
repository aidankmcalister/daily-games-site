"use client";

import { cn } from "@/lib/utils";
import { GameCard } from "@/components/features/games/game-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import type { Game } from "@/app/generated/prisma/client";

interface FeelingLuckySpinnerProps {
  currentGame: Game | null;
}

export function FeelingLuckySpinner({ currentGame }: FeelingLuckySpinnerProps) {
  return (
    <div className="flex flex-col gap-6 w-full h-full justify-center">
      <div className="flex flex-col items-center justify-center flex-1 min-h-[250px] relative">
        {currentGame && (
          // Disable hover effects on the spinning card
          <div className="relative w-full max-w-[280px] transition-all duration-100 scale-90 blur-[2px] opacity-70 pointer-events-none select-none">
            <GameCard
              id={currentGame.id}
              title={currentGame.title}
              link={currentGame.link}
              topic={currentGame.topic}
              playCount={currentGame.playCount || 0}
              isPlayed={false}
              onPlay={() => {}}
              minimal={true}
            />
          </div>
        )}
      </div>

      <div className="flex justify-center">
        <Button
          disabled
          variant="outline"
          className="animate-pulse gap-1.5 p-2 font-normal"
        >
          <Loader2 className="h-3 w-3 animate-spin" />
          Finding your next game...
        </Button>
      </div>
    </div>
  );
}
