"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Flag } from "lucide-react";
import { toast } from "sonner";
import { Race, RaceGame } from "@/app/race/[id]/page";
import { DropResult } from "@hello-pangea/dnd";

// Extracted Components
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
  const [localGuestId, setLocalGuestId] = useState<string | null>(null);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(`race_guest_${race.id}`);
      if (stored) setLocalGuestId(stored);
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
    <div className="max-w-7xl mx-auto px-4 py-8 md:px-8 lg:px-12 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-32">
      <LobbyHeader race={race} />

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Invite, Players, Actions */}
        <div className="lg:col-span-4 space-y-6">
          <InviteLink race={race} />
          <ParticipantList race={race} />

          {/* Action Button Section */}
          <div className="space-y-3">
            {canJoin && !currentUser && (
              <Input
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="Enter your name to join..."
                className="h-12 text-sm font-medium bg-muted border-border focus:border-primary/30 rounded-xl px-4"
              />
            )}

            {canJoin ? (
              <Button
                className="w-full h-14 text-sm font-black uppercase tracking-widest rounded-xl transition-all shadow-none"
                onClick={handleJoin}
                disabled={isJoining || (!currentUser && !guestName.trim())}
              >
                {isJoining ? (
                  <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                ) : (
                  <Flag className="mr-3 h-4 w-4" />
                )}
                {currentUser ? "Join Race" : "Join as Guest"}
              </Button>
            ) : canStart ? (
              <Button
                className="w-full h-14 text-sm font-black uppercase tracking-widest rounded-xl transition-all shadow-none bg-emerald-500 hover:bg-emerald-600 text-white"
                onClick={handleStart}
                disabled={isStarting}
              >
                {isStarting ? (
                  <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                ) : (
                  <Flag className="mr-3 h-4 w-4" />
                )}
                Start Race
              </Button>
            ) : isParticipant ? (
              <Button
                className="w-full h-14 text-sm font-black uppercase tracking-widest rounded-xl transition-all shadow-none bg-muted text-muted-foreground cursor-not-allowed border border-border"
                disabled
              >
                <Loader2 className="mr-3 h-4 w-4 animate-spin" />
                Waiting for Opponent...
              </Button>
            ) : (
              <Button
                className="w-full h-14 text-sm font-black uppercase tracking-widest rounded-xl transition-all shadow-none bg-muted text-muted-foreground cursor-not-allowed border border-border"
                disabled
              >
                Race not started yet
              </Button>
            )}
          </div>
        </div>

        {/* Right Column: Games */}
        <div className="lg:col-span-8 h-full">
          <RaceConfig
            race={race}
            orderedGames={orderedGames}
            isCreator={isCreator ?? false}
            onReorder={handleReorder}
          />
        </div>
      </div>
    </div>
  );
}
