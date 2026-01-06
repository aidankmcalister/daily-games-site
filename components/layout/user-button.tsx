"use client";

import { useState } from "react";
import Image from "next/image";
import { useSession, signIn, signOut } from "@/lib/auth-client";
import { useTheme } from "next-themes";
import { useImpersonation } from "@/components/impersonation-provider";
import { useSettings } from "@/components/settings-provider";
import { DlesButton } from "@/components/design/dles-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import {
  LogIn,
  LogOut,
  User,
  Sun,
  Moon,
  Monitor,
  Eye,
  Check,
  Settings,
  BarChart3,
  TrendingUp,
  List,
} from "lucide-react";
import type { Role } from "@/app/generated/prisma/client";
import { GameSubmissionDialog } from "@/components/game-submission-dialog";

const ROLES: Role[] = ["owner", "coowner", "admin", "member"];
const ROLE_LABELS: Record<Role, string> = {
  owner: "Owner",
  coowner: "Co-owner",
  admin: "Admin",
  member: "Member",
};

export function UserButton() {
  const { data: session, isPending } = useSession();
  const { theme, setTheme } = useTheme();
  const { isActualOwner, viewAsRole, setViewAsRole, currentUser } =
    useImpersonation();
  const { settings } = useSettings();
  const [isSubmissionOpen, setIsSubmissionOpen] = useState(false);

  if (isPending) {
    return (
      <DlesButton variant="outline" size="icon-sm" className="h-8 w-8" disabled>
        <User className="h-4 w-4 animate-pulse" />
      </DlesButton>
    );
  }

  if (!session?.user) {
    return (
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <DlesButton variant="outline" size="icon-sm" className="h-8 w-8">
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </DlesButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setTheme("light")}>
              <Sun className="mr-2 h-4 w-4" />
              Light
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")}>
              <Moon className="mr-2 h-4 w-4" />
              Dark
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("system")}>
              <Monitor className="mr-2 h-4 w-4" />
              System
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <DlesButton
          variant="outline"
          size="sm"
          className="h-8"
          onClick={() => signIn.social({ provider: "google" })}
        >
          Sign in
          <LogIn className="h-4 w-4 ml-2" />
        </DlesButton>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <DlesButton
          variant="outline"
          size="icon-sm"
          className="h-8 w-8 overflow-hidden rounded-full p-0"
        >
          {session.user.image ? (
            <div className="relative h-full w-full">
              <Image
                src={session.user.image}
                alt={session.user.name || "User"}
                fill
                className="object-cover"
                sizes="32px"
              />
            </div>
          ) : (
            <User className="h-4 w-4" />
          )}
        </DlesButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="p-2">
          <p className="text-sm font-bold tracking-tight truncate">
            {session.user.name}
          </p>
          <p className="text-[10px] text-muted-foreground font-mono truncate">
            {session.user.email}
          </p>
        </div>
        <DropdownMenuSeparator />

        {isActualOwner && (
          <>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Eye className="mr-2 h-4 w-4" />
                <span>View As</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent>
                  <DropdownMenuCheckboxItem
                    checked={viewAsRole === null}
                    onCheckedChange={() => setViewAsRole(null)}
                  >
                    Actual (Owner)
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuSeparator />
                  {ROLES.filter((r) => r !== "owner").map((role) => (
                    <DropdownMenuCheckboxItem
                      key={role}
                      checked={viewAsRole === role}
                      onCheckedChange={() => setViewAsRole(role)}
                    >
                      {ROLE_LABELS[role]}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
          </>
        )}

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <div className="relative mr-2 h-4 w-4">
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 absolute" />
              <Moon className="h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 absolute" />
            </div>
            <span>Theme</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <DropdownMenuItem onClick={() => setTheme("light")}>
                <Sun className="mr-2 h-4 w-4" />
                Light
                {theme === "light" && <Check className="ml-auto h-4 w-4" />}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                <Moon className="mr-2 h-4 w-4" />
                Dark
                {theme === "dark" && <Check className="ml-auto h-4 w-4" />}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>
                <Monitor className="mr-2 h-4 w-4" />
                System
                {theme === "system" && <Check className="ml-auto h-4 w-4" />}
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <a href="/dashboard/lists">
            <List className="mr-2 h-4 w-4" />
            Lists
          </a>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <a href="/dashboard">
            <BarChart3 className="mr-2 h-4 w-4" />
            Dashboard
          </a>
        </DropdownMenuItem>

        {settings?.enableCommunitySubmissions && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setIsSubmissionOpen(true)}>
              <TrendingUp className="mr-2 h-4 w-4" />
              Suggest New Game
            </DropdownMenuItem>
          </>
        )}

        {["owner", "coowner", "admin"].includes(
          viewAsRole || currentUser?.role || ""
        ) && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <a href="/admin">
                <Settings className="mr-2 h-4 w-4" />
                Admin Panel
              </a>
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={() => signOut()}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>

      <GameSubmissionDialog
        open={isSubmissionOpen}
        onOpenChange={setIsSubmissionOpen}
      />
    </DropdownMenu>
  );
}
