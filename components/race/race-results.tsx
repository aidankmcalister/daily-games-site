"use client";

import React, { useEffect, useState, useMemo } from "react";
import { DlesButton } from "@/components/design/dles-button";
import { Race } from "@/app/race/[id]/page";
import { Home, RotateCcw } from "lucide-react";
import { ResultsHeader } from "@/components/features/race/results/results-header";
import { WinnerCard } from "@/components/features/race/results/winner-card";
import {
  ResultsList,
  ParticipantWithSplits,
  RaceGameWithGame,
} from "@/components/features/race/results/results-list";

interface RaceResultsProps {
  race: Race;
  currentUser: { id: string; name: string } | null;
}

export function RaceResults({ race, currentUser }: RaceResultsProps) {
  const [guestId, setGuestId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(`race_guest_${race.id}`);
      if (stored) setGuestId(stored);
    }
  }, [race.id]);

  // 1. Sort Games by Order
  const sortedGames = useMemo(
    () => [...race.raceGames].sort((a, b) => a.order - b.order),
    [race.raceGames]
  ) as RaceGameWithGame[];

  // 2. Calculate Durations (Splits) per Participant
  const participantsWithSplits = useMemo(() => {
    return race.participants.map((p) => {
      let prevTime = 0;
      const splits = sortedGames.map((rg) => {
        const c = p.completions.find((x) => x.raceGameId === rg.id);
        if (!c) {
          return {
            id: rg.id,
            duration: null,
            skipped: false,
            cumulative: null,
          };
        }
        const duration = c.timeToComplete - prevTime;
        const cumulative = c.timeToComplete;
        prevTime = cumulative;

        return { id: rg.id, duration, skipped: c.skipped, cumulative };
      });

      return { ...p, splits };
    });
  }, [race.participants, sortedGames]) as ParticipantWithSplits[];

  // 3. Sort Participants by:
  //    a) Completion Count (Non-skipped) - Descending
  //    b) Final Total Time - Ascending
  const sortedParticipants = useMemo(() => {
    return [...participantsWithSplits].sort((a, b) => {
      // Count non-skipped games
      const completedA = a.splits.filter(
        (s) => s.duration !== null && !s.skipped
      ).length;
      const completedB = b.splits.filter(
        (s) => s.duration !== null && !s.skipped
      ).length;

      // Primary Sort: Most completed games wins
      if (completedA !== completedB) {
        return completedB - completedA;
      }

      // Secondary Sort: Lowest total time wins
      const timeA = a.totalTime ?? Number.MAX_SAFE_INTEGER;
      const timeB = b.totalTime ?? Number.MAX_SAFE_INTEGER;
      return timeA - timeB;
    });
  }, [participantsWithSplits]);

  const winner = sortedParticipants[0];
  const isWinner =
    !!winner &&
    ((!!currentUser && winner.userId === currentUser.id) ||
      (!!guestId && winner.id === guestId));

  const myParticipantId = useMemo(() => {
    return sortedParticipants.find(
      (p) =>
        (currentUser && p.userId === currentUser.id) ||
        (guestId && p.id === guestId)
    )?.id;
  }, [sortedParticipants, currentUser, guestId]);

  return (
    <div className="container max-w-xl mx-auto py-8 space-y-6 px-4">
      <ResultsHeader />

      <WinnerCard winner={winner} isWinner={isWinner} />

      <ResultsList
        sortedGames={sortedGames}
        participantsWithSplits={participantsWithSplits}
        sortedParticipants={sortedParticipants}
        myParticipantId={myParticipantId}
      />

      {/* Actions */}
      <div className="grid grid-cols-2 gap-4">
        <DlesButton href="/race/new">
          <RotateCcw className="h-4 w-4 mr-2" /> New Race
        </DlesButton>
        <DlesButton href="/" variant="outline">
          <Home className="h-4 w-4 mr-2" /> Home
        </DlesButton>
      </div>
    </div>
  );
}
