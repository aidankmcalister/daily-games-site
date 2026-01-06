"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { getPusherClient } from "@/lib/pusher";
import { RaceLobby } from "@/components/race/race-lobby";
import { RaceActive } from "@/components/race/race-active";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Race, RaceStatus, Participant } from "@/app/race/[id]/page";

export default function RaceLobbyPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
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

    return () => {
      pusher.unsubscribe(`race-${id}`);
    };
  }, [id]);

  // Redirect based on race status
  useEffect(() => {
    if (!race) return;

    if (race.status === "active") {
      router.replace(`/race/${id}`);
    } else if (race.status === "completed") {
      router.replace(`/race/${id}/results`);
    }
  }, [race, id, router]);

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
        <h1 className="text-heading-page">Race not found</h1>
        <p className="mt-2 text-body text-muted-foreground">
          Make sure you have the correct link.
        </p>
      </div>
    );
  }

  // Redirect if not in lobby state
  if (race.status !== "waiting" && race.status !== "ready") {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const currentUser = session?.user ?? null;

  return (
    <RaceLobby race={race} currentUser={currentUser} onRefresh={fetchRace} />
  );
}
