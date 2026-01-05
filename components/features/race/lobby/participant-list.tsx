"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, User, Check, Loader2 } from "lucide-react";
import { Race } from "@/app/race/[id]/page";

interface ParticipantListProps {
  race: Race;
}

export function ParticipantList({ race }: ParticipantListProps) {
  return (
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
                <p className="font-bold text-sm">Waiting for opponent...</p>
                <p className="text-[10px] uppercase tracking-widest font-black opacity-40">
                  Invite someone to race!
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
