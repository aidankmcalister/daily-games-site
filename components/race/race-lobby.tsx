"use client";

import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DlesTopic } from "@/components/design/dles-topic";
import { MicroLabel } from "@/components/design/micro-label";
import {
  Loader2,
  Check,
  CheckCircle2,
  Clipboard,
  User,
  Users,
  Flag,
  Link,
  Gamepad2,
  Eye,
  EyeOff,
  Trophy,
  GripVertical,
} from "lucide-react";
import { toast } from "sonner";
import { Race, Participant, RaceGame } from "@/app/race/[id]/page";
import { cn } from "@/lib/utils";
import { TOPIC_COLORS } from "@/lib/constants";
import { PageHeader } from "@/components/layout/page-header";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";

interface RaceLobbyProps {
  race: Race;
  currentUser: { id: string; name: string } | null;
  onRefresh: () => void;
}

export function RaceLobby({ race, currentUser, onRefresh }: RaceLobbyProps) {
  const [isJoining, setIsJoining] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [showLink, setShowLink] = useState(false);
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

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard!");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:px-8 lg:px-12 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-32">
      <PageHeader
        title={race.name}
        subtitle={
          race.status === "waiting"
            ? "Share the link below with your opponent to begin"
            : "Both players have joined. Ready to race?"
        }
        backHref="/"
      />

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Invite, Players, Actions */}
        <div className="lg:col-span-4 space-y-6">
          {/* Invite Link Section */}
          <Card className="border border-border shadow-none bg-card">
            <CardHeader className="border-b border-border">
              <CardTitle className="text-sm font-bold flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MicroLabel className="w-6 h-6 rounded-md bg-muted text-muted-foreground flex items-center justify-center p-0">
                    <Link className="h-3.5 w-3.5" />
                  </MicroLabel>
                  Invite Link
                </div>
                <Badge
                  variant="secondary"
                  className={cn(
                    "text-[9px] font-black uppercase tracking-widest px-3 py-1 border-none",
                    race.status === "waiting"
                      ? "bg-amber-400/10 text-amber-400"
                      : "bg-emerald-400/10 text-emerald-400"
                  )}
                >
                  {race.participants.length}/2 Players
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="flex gap-2">
                <div className="min-w-0 flex-1 h-10 px-3 rounded-lg border border-border bg-muted font-mono text-[11px] overflow-hidden flex items-center">
                  <span className="truncate">
                    {showLink
                      ? typeof window !== "undefined"
                        ? window.location.href
                        : ""
                      : "••••••••••••••••••••••••"}
                  </span>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowLink(!showLink)}
                  className="shrink-0 h-10 w-10"
                >
                  {showLink ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={copyLink}
                  className="shrink-0 h-10 w-10"
                >
                  <Clipboard className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Players Section */}
          <Card className="border border-border shadow-none bg-card">
            <CardHeader className="border-b border-border">
              <CardTitle className="text-sm font-bold flex items-center gap-3">
                <div className="flex items-center justify-center w-6 h-6 rounded-md bg-muted text-muted-foreground text-[10px] font-black">
                  <Users className="h-3.5 w-3.5" />
                </div>
                Players
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-3">
              {/* Participant 1 */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-muted/40">
                <div className="flex items-center gap-3">
                  {race.participants[0]?.user?.image ? (
                    <img
                      src={race.participants[0].user.image}
                      alt={race.participants[0].user.name}
                      className="h-10 w-10 rounded-full object-cover border border-primary/20"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-sm">
                      {race.participants[0]?.user?.name ??
                        race.participants[0]?.guestName ??
                        "Unknown"}
                    </p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">
                      {race.createdBy === race.participants[0]?.userId
                        ? "Host"
                        : "Opponent"}
                    </p>
                  </div>
                </div>
                <Badge
                  variant="secondary"
                  className="bg-emerald-500/10 text-emerald-400 border-none text-[9px] font-black uppercase tracking-widest"
                >
                  <Check className="h-3 w-3 mr-1" /> Joined
                </Badge>
              </div>

              {/* Participant 2 or Waiting */}
              {race.participants[1] ? (
                <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-muted/40">
                  <div className="flex items-center gap-3">
                    {race.participants[1]?.user?.image ? (
                      <img
                        src={race.participants[1].user.image}
                        alt={race.participants[1].user.name}
                        className="h-10 w-10 rounded-full object-cover border border-primary/20"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                    )}
                    <div>
                      <p className="font-bold text-sm">
                        {race.participants[1]?.user?.name ??
                          race.participants[1]?.guestName ??
                          "Unknown"}
                      </p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">
                        Opponent
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant="secondary"
                    className="bg-emerald-500/10 text-emerald-400 border-none text-[9px] font-black uppercase tracking-widest"
                  >
                    <Check className="h-3 w-3 mr-1" /> Joined
                  </Badge>
                </div>
              ) : (
                <div className="flex items-center justify-between p-4 rounded-xl border border-dashed border-border bg-muted/5 text-muted-foreground">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-muted/40 flex items-center justify-center">
                      <Loader2 className="h-5 w-5 animate-spin opacity-40" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">
                        Waiting for opponent...
                      </p>
                      <p className="text-[10px] uppercase tracking-widest font-black opacity-40">
                        Invite someone to race!
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

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
          <Card className="border border-border shadow-none bg-card h-full">
            <CardHeader className="border-b border-border">
              <CardTitle className="text-sm font-bold flex items-center gap-3">
                <div className="flex items-center justify-center w-6 h-6 rounded-md bg-muted text-muted-foreground text-[10px] font-black">
                  <Gamepad2 className="h-3.5 w-3.5" />
                </div>
                Games in this Race
                <Badge
                  variant="secondary"
                  className="ml-1 font-bold rounded-full px-2 py-0 border-none bg-primary/10 text-primary text-[10px]"
                >
                  {race.raceGames.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-2">
              <TooltipProvider delayDuration={200}>
                <DragDropContext
                  onDragEnd={async (result: DropResult) => {
                    if (!result.destination) return;
                    // Only allow host to reorder
                    if (!isCreator) return;
                    if (race.status !== "waiting" && race.status !== "ready")
                      return;

                    const items = Array.from(orderedGames);
                    const [reorderedItem] = items.splice(
                      result.source.index,
                      1
                    );
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
                  }}
                >
                  <Droppable droppableId="race-games">
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="max-h-[400px] overflow-y-auto"
                      >
                        {orderedGames.map((rg, index) => (
                          <Draggable
                            key={rg.id}
                            draggableId={rg.id}
                            index={index}
                            isDragDisabled={
                              !isCreator ||
                              (race.status !== "waiting" &&
                                race.status !== "ready")
                            }
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={cn(
                                  "px-4 py-3 flex items-center gap-3 border-b border-border last:border-b-0",
                                  snapshot.isDragging && "bg-muted shadow-lg"
                                )}
                              >
                                {isCreator &&
                                  (race.status === "waiting" ||
                                    race.status === "ready") && (
                                    <div
                                      {...provided.dragHandleProps}
                                      className="text-muted-foreground/50 hover:text-primary cursor-grab"
                                    >
                                      <GripVertical className="h-4 w-4" />
                                    </div>
                                  )}
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                      <span className="font-semibold text-sm truncate">
                                        {rg.game.title}
                                      </span>
                                      <DlesTopic
                                        topic={rg.game.topic}
                                        className="text-[9px] px-1.5 h-4 shrink-0"
                                      />
                                    </div>
                                  </TooltipTrigger>
                                  {rg.game.description && (
                                    <TooltipContent>
                                      <p className="max-w-xs">
                                        {rg.game.description}
                                      </p>
                                    </TooltipContent>
                                  )}
                                </Tooltip>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              </TooltipProvider>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
