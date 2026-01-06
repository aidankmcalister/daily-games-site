"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Flag } from "lucide-react";
import { toast } from "sonner";
import { Race } from "@/app/race/[id]/page";
import { DropResult } from "@hello-pangea/dnd";
import { LobbyHeader } from "@/components/features/race/lobby/lobby-header";
import { InviteLink } from "@/components/features/race/lobby/invite-link";
import { ParticipantList } from "@/components/features/race/lobby/participant-list";
import { RaceConfig } from "@/components/features/race/lobby/race-config";

interface RaceLobbyProps {
  race: Race;
  currentUser: { id: string; name: string } | null;
  onRefresh: () => void;
}

export function RaceLobby({ race, currentUser, onRefresh }: RaceLobbyProps) {
  const [isJoining, setIsJoining] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [localGuestId, setGuestId] = useState<string | null>(null);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(`race_guest_${race.id}`);
      if (stored) setGuestId(stored);
    }
  }, [race.id]);

  const [orderedGames, setOrderedGames] = useState(race.raceGames);
  React.useEffect(() => {
    setOrderedGames(race.raceGames);
  }, [race.raceGames]);

  const isCreator = currentUser
    ? race.createdBy === currentUser.id
    : race.participants.some((p) => p.id === localGuestId && p.guestName);

  const isParticipant = currentUser
    ? race.participants.some((p) => p.userId === currentUser.id)
    : localGuestId && race.participants.some((p) => p.id === localGuestId);

  const canJoin = !isParticipant && race.participants.length < 2;
  const canStart = race.status === "ready" && isParticipant;

  const handleJoin = async () => {
    // For guest users, require a name
    if (!currentUser && !guestName.trim()) {
      toast.error("Please enter a name to join");
      return;
    }

    setIsJoining(true);
    try {
      const res = await fetch(`/api/race/${race.id}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: currentUser
          ? undefined
          : JSON.stringify({ guestName: guestName.trim() }),
      });
      if (res.ok) {
        const updatedRace: Race = await res.json();
        if (!currentUser) {
          const myParticipant = updatedRace.participants.find(
            (p) => p.guestName === guestName.trim()
          );
          if (myParticipant) {
            localStorage.setItem(`race_guest_${race.id}`, myParticipant.id);
            setGuestId(myParticipant.id);
          }
        }
        toast.success("Joined the race!");
        onRefresh();
      } else {
        toast.error("Failed to join race");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred");
    } finally {
      setIsJoining(false);
    }
  };

  const handleStart = async () => {
    setIsStarting(true);
    try {
      const res = await fetch(`/api/race/${race.id}/start`, {
        method: "POST",
        body: JSON.stringify({ guestId: localGuestId }),
      });
      if (res.ok) {
        toast.success("Race started!");
        onRefresh();
      } else {
        toast.error("Failed to start race");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred");
    } finally {
      setIsStarting(false);
    }
  };

  const handleReorder = async (result: DropResult) => {
    if (!result.destination) return;
    // Only allow host to reorder
    if (!isCreator) return;
    if (race.status !== "waiting" && race.status !== "ready") return;

    const items = Array.from(orderedGames);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const newOrder = items.map((g) => g.id);

    // Optimistic update
    setOrderedGames(items);

    try {
      await fetch(`/api/race/${race.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          gameIds: newOrder,
          guestId: localGuestId,
        }),
      });
      toast.success("Game order updated");
    } catch (error) {
      console.error("Failed to update order", error);
      toast.error("Failed to save order");
      setOrderedGames(orderedGames);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 pb-32 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <LobbyHeader race={race} />

      <div className="space-y-10">
        <InviteLink race={race} />

        <ParticipantList race={race} />

        <RaceConfig
          race={race}
          orderedGames={orderedGames}
          isCreator={isCreator ?? false}
          onReorder={handleReorder}
        />
      </div>

      {/* Sticky Footer Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-border/40 bg-background/80 backdrop-blur-md z-40 shadow-lg">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="space-y-3">
            {canJoin && !currentUser && (
              <Input
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="Enter your name to join..."
                className="h-11 text-sm font-medium bg-muted/50 border-border/50 focus:border-primary/50 focus:bg-muted rounded-lg px-4 transition-colors"
                disabled={isJoining}
              />
            )}

            {canJoin ? (
              <Button
                className="w-full h-11 text-sm font-bold gap-2 rounded-lg transition-all shadow-sm bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={handleJoin}
                disabled={isJoining || (!currentUser && !guestName.trim())}
              >
                {isJoining ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Flag className="h-4 w-4" />
                )}
                {currentUser ? "Join Race" : "Join as Guest"}
              </Button>
            ) : canStart ? (
              <Button
                className="w-full h-11 text-sm font-bold gap-2 rounded-lg transition-all shadow-sm bg-emerald-500 hover:bg-emerald-600 text-white"
                onClick={handleStart}
                disabled={isStarting}
              >
                {isStarting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Flag className="h-4 w-4" />
                )}
                Start Race
              </Button>
            ) : isParticipant ? (
              <div className="flex flex-col items-center gap-2">
                <Button
                  className="w-full h-11 text-sm font-bold gap-2 rounded-lg bg-muted/80 text-muted-foreground cursor-not-allowed border border-border/50"
                  disabled
                >
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Waiting for Opponent...
                </Button>
                <p className="text-micro text-muted-foreground/60 italic">
                  Invite a friend with the link above
                </p>
              </div>
            ) : (
              <Button
                className="w-full h-11 text-sm font-bold gap-2 rounded-lg bg-muted/80 text-muted-foreground cursor-not-allowed border border-border/50"
                disabled
              >
                Race Busy
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
