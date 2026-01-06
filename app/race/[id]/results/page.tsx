"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { DlesButton } from "@/components/design/dles-button";
import { Race } from "@/app/race/[id]/page";
import { Home, RotateCcw, Loader2 } from "lucide-react";
import { ResultsHeader } from "@/components/features/race/results/results-header";
import { WinnerCard } from "@/components/features/race/results/winner-card";
import {
  ResultsList,
  ParticipantWithSplits,
  RaceGameWithGame,
} from "@/components/features/race/results/results-list";
import { toast } from "sonner";

export default function RaceResultsPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { data: session, isPending: sessionLoading } = useSession();
  const [race, setRace] = useState<Race | null>(null);
  const [loading, setLoading] = useState(true);
  const [guestId, setGuestId] = useState<string | null>(null);

  const fetchRace = useCallback(async () => {
    try {
      const res = await fetch(`/api/race/${id}`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        // Redirect to race page if not completed
        if (data.status !== "completed") {
          router.replace(`/race/${id}`);
          return;
        }
        setRace(data);
      } else {
        toast.error("Failed to load race");
      }
    } catch (error) {
      console.error("Failed to fetch race:", error);
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    fetchRace();
  }, [fetchRace]);

  useEffect(() => {
    if (typeof window !== "undefined" && id) {
      const stored = localStorage.getItem(`race_guest_${id}`);
      if (stored) setGuestId(stored);
    }
  }, [id]);

  // 1. Sort Games by Order
  const sortedGames = useMemo(
    () => (race ? [...race.raceGames].sort((a, b) => a.order - b.order) : []),
    [race]
  ) as RaceGameWithGame[];

  // 2. Calculate Durations (Splits) per Participant
  const participantsWithSplits = useMemo(() => {
    if (!race) return [];
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
  }, [race, sortedGames]) as ParticipantWithSplits[];

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
  const currentUser = session?.user ?? null;
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

  if (loading || sessionLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!race) {
    return (
      <div className="container py-20 text-center">
        <h1 className="text-2xl font-bold">Race not found</h1>
        <p className="mt-2 text-muted-foreground">
          Make sure you have the correct link.
        </p>
      </div>
    );
  }

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
