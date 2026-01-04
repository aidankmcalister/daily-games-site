"use client";

import { useImpersonation } from "@/components/impersonation-provider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye } from "lucide-react";
import type { Role } from "@/app/generated/prisma/client";

const ROLES: Role[] = ["owner", "coowner", "admin", "member"];
const ROLE_LABELS: Record<Role, string> = {
  owner: "Owner",
  coowner: "Co-owner",
  admin: "Admin",
  member: "Member",
};

export function ViewAsDropdown() {
  const { isActualOwner, viewAsRole, setViewAsRole } = useImpersonation();

  if (!isActualOwner) return null;

  return (
    <div className="flex items-center gap-2 px-2.5 h-8 rounded-md bg-amber-500/10 border border-amber-500/20">
      <Eye className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
      <span className="text-xs font-bold text-amber-600/70 dark:text-amber-400/70 uppercase tracking-wider">
        View as
      </span>
      <Select
        value={viewAsRole || "owner"}
        onValueChange={(v) => setViewAsRole(v === "owner" ? null : (v as Role))}
      >
        <SelectTrigger className="h-5 text-xs bg-transparent border-none shadow-none focus:ring-0 focus:ring-offset-0 text-amber-700 dark:text-amber-400 font-bold">
          <SelectValue />
        </SelectTrigger>
        <SelectContent align="end">
          {ROLES.map((r) => (
            <SelectItem key={r} value={r} className="text-xs">
              {ROLE_LABELS[r]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
