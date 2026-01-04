"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
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
import { Badge } from "@/components/ui/badge";
import { Field, FieldLabel } from "@/components/ui/field";
import { UserButton } from "@/components/user-button";
import { useImpersonation } from "@/components/impersonation-provider";
import { TOPICS, TOPIC_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import {
  Pencil,
  Trash2,
  Plus,
  Users,
  Gamepad2,
  ArrowLeft,
  Shield,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import type { Topic, Role } from "@/app/generated/prisma/client";

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

interface Game {
  id: string;
  title: string;
  link: string;
  topic: string;
  createdAt: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: Role;
  emailVerified: boolean;
  createdAt: string;
}

interface CurrentUser {
  id: string;
  role: Role;
}

export default function AdminPage() {
  const router = useRouter();
  const {
    currentUser,
    effectiveRole,
    isActualOwner,
    viewAsRole,
    isLoading: impersonationLoading,
  } = useImpersonation();
  const [games, setGames] = useState<Game[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState<"games" | "users">("games");
  const [isLoading, setIsLoading] = useState(true);

  // Game form state
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [formLink, setFormLink] = useState("");
  const [formTopic, setFormTopic] = useState<Topic>("puzzle");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Permission checks (based on effective role for impersonation)
  const canAccessAdmin =
    effectiveRole && ["owner", "coowner", "admin"].includes(effectiveRole);
  const canManageGames =
    effectiveRole && ["owner", "coowner", "admin"].includes(effectiveRole);
  const canManageUsers =
    effectiveRole && ["owner", "coowner"].includes(effectiveRole);
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
    if (!impersonationLoading) {
      if (!currentUser) {
        router.push("/");
        return;
      }
      if (!canAccessAdmin) {
        router.push("/");
        return;
      }

      fetchGames();
      if (canManageUsers) {
        fetchUsers();
      }
    }
  }, [
    impersonationLoading,
    currentUser,
    canAccessAdmin,
    canManageUsers,
    router,
  ]);

  const fetchGames = async () => {
    try {
      const res = await fetch("/api/games");
      const data = await res.json();
      setGames(data);
    } catch (error) {
      console.error("Failed to fetch games:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  };

  const handleAddGame = async () => {
    if (!formTitle || !formLink) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/games", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formTitle,
          link: formLink,
          topic: formTopic,
        }),
      });
      if (res.ok) {
        resetForm();
        setShowAddDialog(false);
        fetchGames();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateGame = async () => {
    if (!editingGame || !formTitle || !formLink) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/games/${editingGame.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formTitle,
          link: formLink,
          topic: formTopic,
        }),
      });
      if (res.ok) {
        resetForm();
        setEditingGame(null);
        fetchGames();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteGame = async (id: string) => {
    try {
      const res = await fetch(`/api/games/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchGames();
      }
    } catch (error) {
      console.error("Failed to delete game:", error);
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

  const startEditing = (game: Game) => {
    setEditingGame(game);
    setFormTitle(game.title);
    setFormLink(game.link);
    setFormTopic(game.topic as Topic);
  };

  const resetForm = () => {
    setFormTitle("");
    setFormLink("");
    setFormTopic("puzzle");
    setEditingGame(null);
  };

  // Loading state
  // Loading state
  if (impersonationLoading || isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </main>
    );
  }

  // Access denied
  if (!canAccessAdmin) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-4">
        <Shield className="h-16 w-16 text-muted-foreground" />
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="text-muted-foreground">
          You don't have permission to view this page.
        </p>
        <Link href="/">
          <Button>Go Home</Button>
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-8 md:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
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

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={activeTab === "games" ? "default" : "outline"}
            onClick={() => setActiveTab("games")}
            className="gap-2"
          >
            <Gamepad2 className="h-4 w-4" />
            Games ({games.length})
          </Button>
          {canManageUsers && (
            <Button
              variant={activeTab === "users" ? "default" : "outline"}
              onClick={() => setActiveTab("users")}
              className="gap-2"
            >
              <Users className="h-4 w-4" />
              Users ({users.length})
            </Button>
          )}
        </div>

        {/* Games Tab */}
        {activeTab === "games" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">All Games</h2>
              {canManageGames && (
                <AlertDialog
                  open={showAddDialog}
                  onOpenChange={setShowAddDialog}
                >
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 gap-1.5">
                      <Plus className="h-3.5 w-3.5" />
                      Add Game
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Add Custom Game</AlertDialogTitle>
                      <AlertDialogDescription>
                        Add a new game to your collection.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="space-y-4 py-4">
                      <Field>
                        <FieldLabel htmlFor="game-title">Title</FieldLabel>
                        <Input
                          id="game-title"
                          placeholder="Game name"
                          value={formTitle}
                          onChange={(e) => setFormTitle(e.target.value)}
                        />
                      </Field>
                      <Field>
                        <FieldLabel htmlFor="game-link">Link</FieldLabel>
                        <Input
                          id="game-link"
                          placeholder="https://example.com/game"
                          value={formLink}
                          onChange={(e) => setFormLink(e.target.value)}
                        />
                      </Field>
                      <Field>
                        <FieldLabel htmlFor="game-topic">Category</FieldLabel>
                        <Select
                          value={formTopic}
                          onValueChange={(v) => setFormTopic(v as Topic)}
                        >
                          <SelectTrigger
                            id="game-topic"
                            className="w-full capitalize"
                          >
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {TOPICS.map((t) => (
                              <SelectItem
                                key={t}
                                value={t}
                                className="capitalize"
                              >
                                {t}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Field>
                    </div>
                    <AlertDialogFooter>
                      <AlertDialogCancel onClick={resetForm}>
                        Cancel
                      </AlertDialogCancel>
                      <Button
                        onClick={handleAddGame}
                        disabled={
                          isSubmitting || !formTitle.trim() || !formLink.trim()
                        }
                      >
                        {isSubmitting ? "Adding..." : "Add Game"}
                      </Button>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>

            {isLoading ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : (
              <div className="divide-y rounded-lg border">
                {games.map((game) => (
                  <div
                    key={game.id}
                    className="flex items-center justify-between px-4 py-2.5 hover:bg-muted/50"
                  >
                    {editingGame?.id === game.id ? (
                      <div className="flex-1 flex items-center gap-2">
                        <Input
                          value={formTitle}
                          onChange={(e) => setFormTitle(e.target.value)}
                          className="h-8 flex-1"
                          placeholder="Title"
                        />
                        <Input
                          value={formLink}
                          onChange={(e) => setFormLink(e.target.value)}
                          className="h-8 flex-1"
                          placeholder="Link"
                        />
                        <Select
                          value={formTopic}
                          onValueChange={(v) => setFormTopic(v as Topic)}
                        >
                          <SelectTrigger className="h-8 w-[120px] capitalize">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {TOPICS.map((t) => (
                              <SelectItem
                                key={t}
                                value={t}
                                className="capitalize"
                              >
                                {t}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          size="sm"
                          className="h-8"
                          onClick={handleUpdateGame}
                          disabled={isSubmitting}
                        >
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8"
                          onClick={resetForm}
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="font-medium whitespace-nowrap">
                            {game.title}
                          </span>
                          <Badge
                            className={cn(
                              "capitalize text-xs",
                              TOPIC_COLORS[game.topic]
                            )}
                          >
                            {game.topic}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {game.link}
                          </span>
                        </div>
                        {canManageGames && (
                          <div className="flex items-center gap-1 ml-4">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7"
                              onClick={() => startEditing(game)}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-7 w-7 text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Delete {game.title}?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteGame(game.id)}
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && canManageUsers && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">All Users</h2>
            {users.length === 0 ? (
              <p className="text-muted-foreground">No users yet.</p>
            ) : (
              <div className="divide-y rounded-lg border">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-4 px-4 py-3 hover:bg-muted/50"
                  >
                    {user.image ? (
                      <img
                        src={user.image}
                        alt={user.name}
                        className="h-8 w-8 rounded-full"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                        <Users className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                    {canChangeUserRole(user.role) &&
                    user.id !== currentUser?.id ? (
                      <Select
                        value={user.role}
                        onValueChange={(newRole: Role) =>
                          handleUpdateRole(user.id, newRole)
                        }
                      >
                        <SelectTrigger
                          className={cn(
                            "h-8 w-[110px] text-xs",
                            ROLE_COLORS[user.role]
                          )}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {getAssignableRoles()
                            .filter(
                              (r) => canChangeUserRole(r) || r === user.role
                            )
                            .map((r) => (
                              <SelectItem key={r} value={r}>
                                {ROLE_LABELS[r]}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge
                        className={cn(
                          "capitalize text-xs",
                          ROLE_COLORS[user.role]
                        )}
                      >
                        {ROLE_LABELS[user.role]}
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      Joined {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                    {canDeleteUser(user.role) &&
                      user.id !== currentUser?.id && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Delete {user.name}?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete this user and their
                                data.
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
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
