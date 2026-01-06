"use client";

import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { User, Check, Loader2 } from "lucide-react";
import { Race } from "@/app/race/[id]/page";
import { cn } from "@/lib/utils";

interface ParticipantListProps {
  race: Race;
}

export function ParticipantList({ race }: ParticipantListProps) {
  return (
    <div className="space-y-3">
      <Label className="text-micro text-muted-foreground/60">Players</Label>

      <div className="space-y-2">
        {/* Participant 1 */}
        <div className="flex items-center justify-between p-3 rounded-xl border border-border/50 bg-muted/20">
          <div className="flex items-center gap-3">
            {race.participants[0]?.user?.image ? (
              <img
                src={race.participants[0].user.image}
                alt={race.participants[0].user.name}
                className="h-9 w-9 rounded-full object-cover border border-primary/20"
              />
            ) : (
              <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                <User className="h-5 w-5 text-primary" />
              </div>
            )}
            <div>
              <p className="text-body-small font-bold">
                {race.participants[0]?.user?.name ??
                  race.participants[0]?.guestName ??
                  "Unknown"}
              </p>
              <p className="text-micro-xs text-muted-foreground">
                {race.createdBy === race.participants[0]?.userId
                  ? "Host"
                  : "Opponent"}
              </p>
            </div>
          </div>
          <Badge
            variant="secondary"
            className="bg-emerald-500/10 text-emerald-400 border-none text-micro-xs px-2 py-0.5"
          >
            <Check className="h-3 w-3 mr-1" /> Joined
          </Badge>
        </div>

        {/* Participant 2 or Waiting */}
        {race.participants[1] ? (
          <div className="flex items-center justify-between p-3 rounded-xl border border-border/50 bg-muted/20">
            <div className="flex items-center gap-3">
              {race.participants[1]?.user?.image ? (
                <img
                  src={race.participants[1].user.image}
                  alt={race.participants[1].user.name}
                  className="h-9 w-9 rounded-full object-cover border border-primary/20"
                />
              ) : (
                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                  <User className="h-5 w-5 text-primary" />
                </div>
              )}
              <div>
                <p className="text-body-small font-bold">
                  {race.participants[1]?.user?.name ??
                    race.participants[1]?.guestName ??
                    "Unknown"}
                </p>
                <p className="text-micro-xs text-muted-foreground">Opponent</p>
              </div>
            </div>
            <Badge
              variant="secondary"
              className="bg-emerald-500/10 text-emerald-400 border-none text-micro-xs px-2 py-0.5"
            >
              <Check className="h-3 w-3 mr-1" /> Joined
            </Badge>
          </div>
        ) : (
          <div className="flex items-center justify-between p-3 rounded-xl border border-dashed border-border/40 bg-muted/5 text-muted-foreground">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-muted/20 flex items-center justify-center">
                <Loader2 className="h-4 w-4 animate-spin opacity-40 text-muted-foreground" />
              </div>
              <div>
                <p className="text-body-small font-bold text-muted-foreground/60">
                  Waiting for opponent...
                </p>
                <p className="text-micro-xs opacity-30">
                  Invite someone to race!
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
