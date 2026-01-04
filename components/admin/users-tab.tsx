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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useImpersonation } from "@/components/impersonation-provider";
import { cn } from "@/lib/utils";
import { Trash2, Loader2, Shield } from "lucide-react";
import type { Role } from "@/app/generated/prisma/client";

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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-lg font-semibold">
          All Users ({filteredUsers.length})
        </h2>
      </div>

      {/* User search and filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search users..."
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
            className="max-w-md"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Select
            value={userRoleFilter}
            onValueChange={(value) => setUserRoleFilter(value as Role | "all")}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by role" />
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
            <SelectTrigger className="w-[200px]">
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
              <SelectItem value="createdAt-asc">Oldest First</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border">
        <div className="divide-y">
          {filteredUsers.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No users found matching your criteria.
            </div>
          ) : (
            filteredUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between px-4 py-2.5 hover:bg-muted/50"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{user.name}</span>
                      <Badge
                        className={cn(
                          "capitalize text-xs",
                          ROLE_COLORS[user.role]
                        )}
                      >
                        {ROLE_LABELS[user.role]}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {user.email}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {canChangeUserRole(user.role) && (
                    <Select
                      value={user.role}
                      onValueChange={(val) =>
                        handleUpdateRole(user.id, val as Role)
                      }
                    >
                      <SelectTrigger className="h-8 w-[130px] capitalize">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {getAssignableRoles().map((role) => (
                          <SelectItem
                            key={role}
                            value={role}
                            className="capitalize"
                          >
                            {ROLE_LABELS[role]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  {canDeleteUser(user.role) && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete User?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete {user.name}? This
                            action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
