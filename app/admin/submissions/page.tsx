"use client";

import { SubmissionsTab } from "@/components/admin/submissions-tab";
import { useImpersonation } from "@/components/impersonation-provider";

export default function AdminSubmissionsPage() {
  const { canManageGames } = useImpersonation();
  return <SubmissionsTab canManageGames={canManageGames} />;
}
