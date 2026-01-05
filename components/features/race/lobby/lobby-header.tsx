"use client";

import { PageHeader } from "@/components/layout/page-header";
import { UserButton } from "@/components/layout/user-button";
import { Race } from "@/app/race/[id]/page";

interface LobbyHeaderProps {
  race: Race;
}

export function LobbyHeader({ race }: LobbyHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <PageHeader
        title={race.name}
        subtitle={
          race.status === "waiting"
            ? "Share the link below with your opponent to begin"
            : "Both players have joined. Ready to race?"
        }
        backHref="/"
      />
      <UserButton />
    </div>
  );
}
