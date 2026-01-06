"use client";

import { useEffect } from "react";
import { Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import confetti from "canvas-confetti";
import { Participant } from "@/app/race/[id]/page";

// Participant from page already includes user
type ParticipantWithUser = Participant;

interface WinnerCardProps {
  winner: ParticipantWithUser | undefined;
  isWinner: boolean;
}

export function WinnerCard({ winner, isWinner }: WinnerCardProps) {
  useEffect(() => {
    if (isWinner) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#FFD700", "#FFA500", "#FFFFFF", "#4F46E5"],
      });
    }
  }, [isWinner]);

  if (!winner) return null;

  return (
    <div
      className={cn(
        "rounded-2xl p-6 text-center shadow-lg transition-all dark:shadow-none border",
        isWinner
          ? "bg-yellow-500/5 border-yellow-500/20"
          : "bg-rose-500/5 border-rose-500/20"
      )}
    >
      <div className="flex flex-col items-center gap-4">
        <div
          className={cn(
            "h-16 w-16 rounded-full flex items-center justify-center shadow-sm",
            isWinner
              ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600"
              : "bg-rose-100 dark:bg-rose-900/30 text-rose-600"
          )}
        >
          <Trophy className="h-8 w-8" />
        </div>
        <div>
          <h2 className="text-heading-page">
            {isWinner ? "Victory" : "Defeat"}
          </h2>
          <p className="text-body text-muted-foreground">
            {isWinner
              ? "You finished first"
              : `${
                  winner.user?.name ?? winner.guestName ?? "Opponent"
                } finished first`}
          </p>
        </div>
      </div>
    </div>
  );
}
