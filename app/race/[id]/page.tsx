"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { getPusherClient } from "@/lib/pusher";
import { RaceLobby } from "@/components/race/race-lobby";
import { RaceActive } from "@/components/race/race-active";
import { RaceResults } from "@/components/race/race-results";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export type RaceStatus =
  | "waiting"
  | "ready"
  | "active"
  | "completed"
  | "cancelled";

export interface Participant {
  id: string;
  userId: string | null; // null for guest users
  guestName: string | null; // Used when userId is null
  user: {
    id: string;
    name: string;
    image: string | null;
  } | null; // null for guest users
  joinedAt: string;
  finishedAt: string | null;
  totalTime: number | null;
  completions: RaceCompletion[];
}

export interface RaceGame {
  id: string;
  gameId: string;
  order: number;
  game: {
    id: string;
    title: string;
    link: string;
    topic: string;
    description: string | null;
  };
  completions: RaceCompletion[];
}

export interface RaceCompletion {
  id: string;
  raceGameId: string;
  participantId: string;
  completedAt: string;
  timeToComplete: number;
  skipped: boolean;
}

export interface Race {
  id: string;
  name: string;
  createdBy: string;
  status: RaceStatus;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  participants: Participant[];
  raceGames: RaceGame[];
}

export default function RacePage() {
  const { id } = useParams() as { id: string };
  const { data: session, isPending: sessionLoading } = useSession();
  const [race, setRace] = useState<Race | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchRace = useCallback(async () => {
    try {
      const res = await fetch(`/api/race/${id}`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setRace(data);
      } else {
        toast.error("Failed to load race");
      }
    } catch (error) {
      console.error("Failed to fetch race:", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchRace();
  }, [fetchRace]);

  useEffect(() => {
    if (!id) return;

    const pusher = getPusherClient();
    const channel = pusher.subscribe(`race-${id}`);

    channel.bind(
      "player-joined",
      (data: { participant: Participant; status: RaceStatus }) => {
        setRace((prev) => {
          if (!prev) return prev;
          // Avoid duplicates if already present
          const exists = prev.participants.some(
            (p) => p.id === data.participant.id
          );
          if (exists) return { ...prev, status: data.status };

          return {
            ...prev,
            participants: [...prev.participants, data.participant],
            status: data.status,
          };
        });
        toast.info("A new player joined the race!");
      }
    );

    channel.bind(
      "race-started",
      (data: { status: RaceStatus; startedAt: string }) => {
        setRace((prev) =>
          prev
            ? { ...prev, status: data.status, startedAt: data.startedAt }
            : prev
        );
        toast.success("The race has started!");
      }
    );

    channel.bind(
      "game-completed",
      (data: {
        userId: string;
        participantId: string;
        raceGameId: string;
        timeToComplete: number;
        skipped: boolean;
        finishedAll: boolean;
        raceStatus: RaceStatus;
      }) => {
        setRace((prev) => {
          if (!prev) return prev;

          const updatedParticipants = prev.participants.map((p) => {
            // Match by participantId (preferred) or userId
            if (
              p.id === data.participantId ||
              (p.userId && p.userId === data.userId)
            ) {
              const newCompletion = {
                id: Math.random().toString(), // Dummy ID for UI
                participantId: p.id,
                raceGameId: data.raceGameId,
                completedAt: new Date().toISOString(),
                timeToComplete: data.timeToComplete,
                skipped: data.skipped,
              };
              return {
                ...p,
                completions: [...p.completions, newCompletion],
                finishedAt: data.finishedAll
                  ? new Date().toISOString()
                  : p.finishedAt,
                totalTime: data.finishedAll ? data.timeToComplete : p.totalTime,
              };
            }
            return p;
          });

          return {
            ...prev,
            participants: updatedParticipants,
            status: data.raceStatus,
          };
        });
      }
    );

    return () => {
      pusher.unsubscribe(`race-${id}`);
    };
  }, [id]);

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

  // Create currentUser object for both authenticated and guest scenarios
  const currentUser = session?.user ?? null;

  // Determine which view to show
  if (race.status === "completed") {
    return <RaceResults race={race} currentUser={currentUser} />;
  }

  if (race.status === "active") {
    return (
      <RaceActive race={race} currentUser={currentUser} onRefresh={fetchRace} />
    );
  }

  return (
    <RaceLobby race={race} currentUser={currentUser} onRefresh={fetchRace} />
  );
}
