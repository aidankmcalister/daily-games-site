"use client";

import { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  coowner: "Co-owner",
  admin: "Admin",
  member: "Member",
};

export function UsersTab({ canManageUsers }: { canManageUsers: boolean }) {
  const { effectiveRole } = useImpersonation();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search and filter states
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState<Role | "all">("all");
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

  const canChangeUserRole = (targetRole: Role): boolean => {
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
          userRoleFilter === "all" || user.role === userRoleFilter;
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
          <Select
            value={userRoleFilter}
            onValueChange={(value) => setUserRoleFilter(value as Role | "all")}
          >
            <SelectTrigger
              size="lg"
              className="w-full sm:w-[140px] text-xs border-primary/20 hover:border-primary/50 hover:bg-primary/5"
            >
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              {ROLES.map((role) => (
                <SelectItem key={role} value={role} className="capitalize">
                  {ROLE_LABELS[role]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
                    canChangeRole={canChangeUserRole}
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
