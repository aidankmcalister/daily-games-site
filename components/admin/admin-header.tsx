"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { UserButton } from "@/components/user-button";
import { useImpersonation } from "@/components/impersonation-provider";
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
    <header className="mb-8 flex items-start justify-between">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <Link
            href="/"
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Admin Dashboard
          </h1>
          <Badge
            className={cn(
              "capitalize text-xs",
              ROLE_COLORS[effectiveRole || "member"],
              viewAsRole && "ring-2 ring-amber-500/50"
            )}
          >
            {viewAsRole && "👁 "}
            {ROLE_LABELS[effectiveRole || "member"]}
          </Badge>
        </div>
        <p className="text-muted-foreground">
          Manage games{canManageUsers && " and users"}.
        </p>
      </div>
      <div className="flex items-center gap-2">
        <UserButton />
      </div>
    </header>
  );
}
