import { DlesSelect } from "@/components/design/dles-select";
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
import { DlesButton } from "@/components/design/dles-button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Trash } from "lucide-react";
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

interface UserItemProps {
  user: User;
  currentUserRole: Role | null;
  assignableRoles: Role[];
  canChangeRole: (targetRole: Role) => boolean;
  canDelete: (targetRole: Role) => boolean;
  onUpdateRole: (userId: string, role: Role) => Promise<void>;
  onDelete: (userId: string) => Promise<void>;
}

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

const ROLE_LABELS: Record<Role, string> = {
  owner: "Owner",
  coowner: "Co-Owner",
  admin: "Admin",
  member: "Member",
};

export function UserItem({
  user,
  assignableRoles,
  canChangeRole,
  canDelete,
  onUpdateRole,
  onDelete,
}: UserItemProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full p-3 sm:p-0 border sm:border-0 rounded-lg sm:rounded-none bg-card sm:bg-transparent">
      <div className="grid grid-cols-[1fr_50px] md:grid-cols-[1fr_150px_minmax(0,1.5fr)_130px_50px] gap-4 items-center w-full">
        {/* User Identity */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-8 w-8 rounded-full bg-muted/40 border border-border/40 flex items-center justify-center shrink-0 overflow-hidden">
            {user.image ? (
              <img
                src={user.image}
                alt={user.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-xs font-medium text-muted-foreground">
                {user.name
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase() || "?"}
              </span>
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-medium truncate" title={user.name}>
              {user.name}
            </span>
            {/* Mobile-only email */}
            <span className="text-[10px] text-muted-foreground truncate font-mono md:hidden">
              {user.email}
            </span>
          </div>
        </div>

        {/* Role */}
        <div className="hidden md:flex items-center">
          {canChangeRole(user.role) ? (
            <DlesSelect
              value={user.role}
              onChange={(val) => onUpdateRole(user.id, val as Role)}
              options={assignableRoles.map((role) => ({
                value: role,
                label: ROLE_LABELS[role],
              }))}
              className="w-full"
              renderOption={(option) => (
                <Badge
                  variant="secondary"
                  className={cn(
                    "capitalize rounded-full text-[10px] px-2 h-5 gap-1 shrink-0",
                    ROLE_COLORS[option.value as Role]
                  )}
                >
                  {option.label}
                </Badge>
              )}
              renderSelected={(option) => (
                <Badge
                  variant="secondary"
                  className={cn(
                    "capitalize rounded-full text-[10px] px-2 h-5 gap-1 shrink-0",
                    ROLE_COLORS[option.value as Role]
                  )}
                >
                  {option.label}
                </Badge>
              )}
            />
          ) : (
            <Badge
              className={cn(
                "capitalize text-[10px] h-5 px-2 shrink-0",
                ROLE_COLORS[user.role]
              )}
              variant="secondary"
            >
              {ROLE_LABELS[user.role]}
            </Badge>
          )}
        </div>

        {/* Email */}
        <div className="hidden md:block truncate">
          <span
            className="text-xs text-muted-foreground truncate font-mono"
            title={user.email}
          >
            {user.email}
          </span>
        </div>

        {/* Date */}
        <div className="hidden md:block text-right pr-4">
          <span className="text-[10px] text-muted-foreground font-mono">
            {new Date(user.createdAt).toLocaleDateString()}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-center">
          {canDelete(user.role) && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <DlesButton
                  size="icon-sm"
                  variant="ghost"
                  className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 w-8"
                >
                  <Trash className="h-3.5 w-3.5" />
                </DlesButton>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete User?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete {user.name}? This action
                    cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onDelete(user.id)}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>
    </div>
  );
}
