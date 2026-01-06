"use client";

import { Badge } from "@/components/ui/badge";
import { UserButton } from "@/components/layout/user-button";
import { useImpersonation } from "@/components/impersonation-provider";
import { PageHeader } from "@/components/layout/page-header";
import { cn } from "@/lib/utils";
import type { Role } from "@/app/generated/prisma/client";

const ROLE_COLORS: Record<Role, string> = {
  owner: "bg-amber-500/20 text-amber-700 dark:text-amber-300",
  coowner: "bg-violet-500/20 text-violet-700 dark:text-violet-300",
  admin: "bg-blue-500/20 text-blue-700 dark:text-blue-300",
  member: "bg-gray-500/20 text-gray-700 dark:text-gray-300",
};

const ROLE_LABELS: Record<Role, string> = {
  owner: "Owner",
  coowner: "Co-owner",
  admin: "Admin",
  member: "Member",
};

export function AdminHeader({ canManageUsers }: { canManageUsers: boolean }) {
  const { effectiveRole, viewAsRole } = useImpersonation();

  return (
    <div className="flex items-start justify-between">
      <PageHeader
        title="Admin Dashboard"
        subtitle={`Manage games${canManageUsers ? " and users" : ""}.`}
        backHref="/"
      >
        <Badge
          className={cn(
            "capitalize text-xs",
            ROLE_COLORS[effectiveRole || "member"],
            viewAsRole && "ring-2 ring-amber-500/50"
          )}
        >
          {viewAsRole && "Viewing as "}
          {ROLE_LABELS[effectiveRole || "member"]}
        </Badge>
      </PageHeader>
      <div className="flex items-center gap-2">
        <UserButton />
      </div>
    </div>
  );
}
