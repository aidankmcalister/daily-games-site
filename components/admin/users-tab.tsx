"use client";

import { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DlesSelect } from "@/components/design/dles-select";
import { useImpersonation } from "@/components/impersonation-provider";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Role } from "@/app/generated/prisma/client";
import { UserItem } from "./user-item";

interface User {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: Role;
  emailVerified: boolean;
  createdAt: string;
}

const ROLES: Role[] = ["owner", "coowner", "admin", "member"];

const ROLE_LABELS: Record<Role, string> = {
  owner: "Owner",
  coowner: "Co-Owner",
  admin: "Admin",
  member: "Member",
};

const ROLE_COLORS: Record<Role, string> = {
  owner:
    "bg-amber-500/5 text-amber-700 dark:text-amber-300 border-amber-500/20 border",
  coowner:
    "bg-violet-500/5 text-violet-700 dark:text-violet-300 border-violet-500/20 border",
  admin:
    "bg-blue-500/5 text-blue-700 dark:text-blue-300 border-blue-500/20 border",
  member:
    "bg-zinc-500/5 text-zinc-700 dark:text-zinc-300 border-zinc-500/20 border",
};

export function UsersTab({ canManageUsers }: { canManageUsers: boolean }) {
  const { effectiveRole, currentUser } = useImpersonation();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search and filter states
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState<string[]>(["all"]);
  const [userSortBy, setUserSortBy] = useState<
    "name" | "email" | "role" | "createdAt"
  >("name");
  const [userSortOrder, setUserSortOrder] = useState<"asc" | "desc">("asc");

  const isOwner = effectiveRole === "owner";
  const isCoowner = effectiveRole === "coowner";

  const getAssignableRoles = (): Role[] => {
    if (isOwner) return ["owner", "coowner", "admin", "member"];
    if (isCoowner) return ["admin", "member"];
    return [];
  };

  const canChangeUserRole = (
    targetRole: Role,
    targetUserId: string
  ): boolean => {
    if (currentUser?.id === targetUserId && targetRole === "owner")
      return false;
    if (isOwner) return true;
    if (isCoowner) return ["member", "admin"].includes(targetRole);
    return false;
  };

  const canDeleteUser = (targetRole: Role): boolean => {
    if (!effectiveRole) return false;
    // Owner can delete everyone except other owners
    if (isOwner) return targetRole !== "owner";
    // Co-owner can delete admin and member
    if (isCoowner) return ["admin", "member"].includes(targetRole);
    // Admin can delete member
    if (effectiveRole === "admin") return targetRole === "member";
    return false;
  };

  useEffect(() => {
    if (canManageUsers) {
      fetchUsers();
    }
  }, [canManageUsers]);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateRole = async (userId: string, role: Role) => {
    try {
      await fetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role }),
      });
      fetchUsers();
    } catch (error) {
      console.error("Failed to update role:", error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const res = await fetch(`/api/users?userId=${userId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchUsers();
      }
    } catch (error) {
      console.error("Failed to delete user:", error);
    }
  };

  const filteredUsers = useMemo(() => {
    const q = userSearch.trim().toLowerCase();

    return users
      .filter((user) => {
        const matchesSearch =
          q.length === 0 ||
          (user.name || "").toLowerCase().includes(q) ||
          user.email.toLowerCase().includes(q);
        const matchesRole =
          userRoleFilter.includes("all") || userRoleFilter.includes(user.role);
        return matchesSearch && matchesRole;
      })
      .sort((a, b) => {
        let comparison = 0;

        if (userSortBy === "name") {
          comparison = (a.name || "").localeCompare(b.name || "");
        } else if (userSortBy === "email") {
          comparison = a.email.localeCompare(b.email);
        } else if (userSortBy === "role") {
          comparison = a.role.localeCompare(b.role);
        } else {
          comparison =
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }

        return userSortOrder === "asc" ? comparison : -comparison;
      });
  }, [users, userSearch, userRoleFilter, userSortBy, userSortOrder]);

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 min-h-8">
        <h2 className="text-heading-section">
          All Users ({filteredUsers.length})
        </h2>
      </div>

      {/* User search and filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="flex-1">
          <Input
            placeholder="Search users..."
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
            className="flex-1 h-9 text-xs text-muted-foreground bg-background border-border/40 hover:border-border hover:bg-muted/10 focus:bg-background focus:border-brand transition-all font-mono"
          />
        </div>
        <div className="flex gap-2">
          <DlesSelect
            multi
            value={userRoleFilter}
            onChange={(val) => setUserRoleFilter(val)}
            options={[
              { value: "all", label: "All Roles" },
              ...ROLES.map((role) => ({
                value: role,
                label: ROLE_LABELS[role],
              })),
            ]}
            className="w-[140px] h-9 text-xs font-mono"
            renderOption={(option) => {
              if (option.value === "all")
                return (
                  <span className="font-mono text-xs">{option.label}</span>
                );
              return (
                <Badge
                  variant="outline"
                  className={cn(
                    "capitalize rounded-sm text-micro-xs px-1.5 h-5 font-mono",
                    ROLE_COLORS[option.value as Role]
                  )}
                >
                  {option.label}
                </Badge>
              );
            }}
            renderSelected={(option) => {
              if (option.value === "all")
                return (
                  <span className="font-mono text-xs">{option.label}</span>
                );
              return (
                <Badge
                  variant="outline"
                  className={cn(
                    "capitalize rounded-sm text-[10px] px-1.5 h-4 font-mono",
                    ROLE_COLORS[option.value as Role]
                  )}
                >
                  {option.label}
                </Badge>
              );
            }}
          />
          <Select
            value={`${userSortBy}-${userSortOrder}`}
            onValueChange={(value) => {
              const [sortBy, order] = value.split("-") as [
                "name" | "email" | "role" | "createdAt",
                "asc" | "desc"
              ];
              setUserSortBy(sortBy);
              setUserSortOrder(order);
            }}
          >
            <SelectTrigger className="w-[140px] h-9 text-xs bg-background border-border/40 hover:border-border hover:bg-muted/10 transition-all focus:border-brand font-mono">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name-asc">Name (A-Z)</SelectItem>
              <SelectItem value="name-desc">Name (Z-A)</SelectItem>
              <SelectItem value="email-asc">Email (A-Z)</SelectItem>
              <SelectItem value="email-desc">Email (Z-A)</SelectItem>
              <SelectItem value="role-asc">Role (Asc)</SelectItem>
              <SelectItem value="role-desc">Role (Desc)</SelectItem>
              <SelectItem value="createdAt-desc">Newest First</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border border-border/40 bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <div className="grid grid-cols-[auto_1fr] md:grid-cols-[1fr_150px_minmax(0,1.5fr)_130px_50px] gap-4 items-center px-4 py-3 border-b border-border/40 bg-muted/20 text-micro text-muted-foreground sticky top-0 z-10 backdrop-blur-sm">
            <div className="pl-12 md:pl-0">USER IDENTITY</div>
            <div className="hidden md:block">ROLE</div>
            <div className="hidden md:block">EMAIL</div>
            <div className="hidden md:block text-right pr-4">CREATED</div>
            <div className="text-right">ACTION</div>
          </div>
          <div className="divide-y divide-border/30 px-0">
            {filteredUsers.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-body font-mono border-b border-border/20">
                &gt; No users found.
              </div>
            ) : (
              filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="px-4 py-3 hover:bg-muted/5 transition-colors"
                >
                  <UserItem
                    user={user}
                    currentUserRole={effectiveRole as Role}
                    assignableRoles={getAssignableRoles()}
                    canChangeRole={(role) => canChangeUserRole(role, user.id)}
                    canDelete={canDeleteUser}
                    onUpdateRole={handleUpdateRole}
                    onDelete={handleDeleteUser}
                  />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
