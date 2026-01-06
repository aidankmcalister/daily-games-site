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
  owner: "bg-amber-500/20 text-amber-700 dark:text-amber-300",
  coowner: "bg-violet-500/20 text-violet-700 dark:text-violet-300",
  admin: "bg-blue-500/20 text-blue-700 dark:text-blue-300",
  member: "bg-zinc-500/20 text-zinc-700 dark:text-zinc-300",
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
        <h2 className="text-lg font-semibold">
          All Users ({filteredUsers.length})
        </h2>
      </div>

      {/* User search and filters */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <Input
          placeholder="Search users..."
          value={userSearch}
          onChange={(e) => setUserSearch(e.target.value)}
          className="h-10 text-base md:text-xs border-primary/20 hover:border-primary/50 focus:border-primary/50 w-full md:flex-1 md:w-auto"
        />
        <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center md:w-auto">
          <DlesSelect
            multi
            value={userRoleFilter}
            onChange={(val) => {
              // Enforce "All" exclusivity logic if DlesSelect doesn't catch it or for extra safety
              // If "all" was just selected (not present before), clear others.
              // If "all" was present and something else selected, remove "all".
              // For now, trust the incoming value but ensure logical consistency if needed.
              setUserRoleFilter(val);
            }}
            options={[
              { value: "all", label: "All Roles" },
              ...ROLES.map((role) => ({
                value: role,
                label: ROLE_LABELS[role],
              })),
            ]}
            className="w-full sm:w-[140px]"
            renderOption={(option) => {
              if (option.value === "all") return <span>{option.label}</span>;
              return (
                <Badge
                  variant="secondary"
                  className={`capitalize rounded-full text-xs px-2.5 h-6 gap-1 shrink-0 ${
                    ROLE_COLORS[option.value as Role]
                  }`}
                >
                  {option.label}
                </Badge>
              );
            }}
            renderSelected={(option) => {
              if (option.value === "all") return <span>{option.label}</span>;
              return (
                <Badge
                  variant="secondary"
                  className={`capitalize rounded-md px-2 h-6 font-medium border-primary/20 gap-1 shrink-0 ${
                    ROLE_COLORS[option.value as Role]
                  }`}
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
            <SelectTrigger
              size="lg"
              className="w-full sm:w-[140px] text-xs border-primary/20 hover:border-primary/50 hover:bg-primary/5"
            >
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

      <div className="rounded-md border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <div className="divide-y">
            {filteredUsers.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-sm">
                No users found.
              </div>
            ) : (
              filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="px-4 py-3 hover:bg-muted/40 transition-colors"
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
