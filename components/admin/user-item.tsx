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
import { DlesButton } from "@/components/ui/dles-button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Trash2 } from "lucide-react";
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
  owner: "bg-amber-500/20 text-amber-700 dark:text-amber-300",
  coowner: "bg-violet-500/20 text-violet-700 dark:text-violet-300",
  admin: "bg-blue-500/20 text-blue-700 dark:text-blue-300",
  member: "bg-zinc-500/20 text-zinc-700 dark:text-zinc-300",
};

const ROLE_LABELS: Record<Role, string> = {
  owner: "Owner",
  coowner: "Co-owner",
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
    <div className="flex items-center gap-4 w-full">
      {/* Avatar */}
      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0 overflow-hidden">
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

      <div className="grid grid-cols-1 md:grid-cols-[180px_200px_minmax(0,1fr)] gap-4 items-center flex-1 min-w-0">
        <span className="text-sm font-medium truncate" title={user.name}>
          {user.name}
        </span>

        <div className="flex items-center">
          <Badge
            className={cn(
              "capitalize text-xs shrink-0",
              ROLE_COLORS[user.role]
            )}
            variant="secondary"
          >
            {ROLE_LABELS[user.role]}
          </Badge>
        </div>

        <span
          className="text-xs text-muted-foreground truncate font-mono"
          title={user.email}
        >
          {user.email}
        </span>
      </div>

      <div className="flex items-center gap-2 shrink-0 ml-auto">
        {canChangeRole(user.role) && (
          <Select
            value={user.role}
            onValueChange={(val) => onUpdateRole(user.id, val as Role)}
          >
            <SelectTrigger className="h-8 w-[110px] sm:w-[130px] text-xs sm:text-sm capitalize">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {assignableRoles.map((role) => (
                <SelectItem key={role} value={role} className="capitalize">
                  {ROLE_LABELS[role]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {canDelete(user.role) && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <DlesButton
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-3.5 w-3.5" />
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
  );
}
