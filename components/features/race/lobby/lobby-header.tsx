"use client";

import { Label } from "@/components/ui/label";

import { Race } from "@/app/race/[id]/page";
import { Badge } from "@/components/ui/badge";

interface LobbyHeaderProps {
  race: Race;
}

export function LobbyHeader({ race }: LobbyHeaderProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-12 items-end">
      {/* Race Name */}
      <div className="md:col-span-12">
        <Label className="text-micro text-muted-foreground mb-2 block">
          RACE NAME
        </Label>
        <div className="flex items-center gap-4">
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight">
            {race.name}
          </h1>
          <Badge
            variant={race.status === "waiting" ? "secondary" : "default"}
            className="uppercase tracking-widest text-[10px] font-bold"
          >
            {race.status}
          </Badge>
        </div>
        <p className="text-muted-foreground mt-2 max-w-xl">
          {race.status === "waiting"
            ? "Waiting for opponents to join the race. Share the link below!"
            : "Everyone is here. Let the games begin!"}
        </p>
      </div>
    </div>
  );
}
