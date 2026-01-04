"use client";

import { GamesTab } from "@/components/admin/games-tab";
import { useImpersonation } from "@/components/impersonation-provider";

export default function AdminGamesPage() {
  const { canManageGames } = useImpersonation();
  return <GamesTab canManageGames={canManageGames} />;
}
