"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useImpersonation } from "@/components/impersonation-provider";
import { AdminHeader } from "@/components/admin/admin-header";
import {
  Gamepad2,
  Users,
  Loader2,
  Shield,
  Settings,
  TrendingUp,
} from "lucide-react";
import { DlesButton } from "@/components/design/dles-button";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const {
    currentUser,
    effectiveRole,
    isLoading: impersonationLoading,
    canAccessAdmin,
    canManageUsers,
  } = useImpersonation();
  const [isLoading, setIsLoading] = useState(true);

  const canManageSettings =
    effectiveRole === "owner" || effectiveRole === "coowner";

  useEffect(() => {
    if (!impersonationLoading) {
      if (!currentUser || !canAccessAdmin) {
        setIsLoading(false); // Let the access denied UI show
      } else {
        setIsLoading(false);
      }
    }
  }, [impersonationLoading, currentUser, canAccessAdmin]);

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
        <DlesButton href="/">Go Home</DlesButton>
      </main>
    );
  }

  const isGamesTab = pathname === "/admin/games";
  const isUsersTab = pathname === "/admin/users";
  const isSettingsTab = pathname === "/admin/settings";

  return (
    <main className="min-h-screen px-4 py-8 md:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <AdminHeader canManageUsers={canManageUsers} />

        {/* Tabs */}
        {/* Tabs */}
        <div className="grid grid-cols-2 md:flex md:flex-row gap-2 mb-6">
          <DlesButton
            isActive={isGamesTab}
            href="/admin/games"
            className="w-full md:w-auto"
          >
            <Gamepad2 className="h-3.5 w-3.5" />
            Games
          </DlesButton>
          {canManageUsers && (
            <DlesButton
              isActive={isUsersTab}
              href="/admin/users"
              className="w-full md:w-auto"
            >
              <Users className="h-3.5 w-3.5" />
              Users
            </DlesButton>
          )}
          <DlesButton
            isActive={pathname === "/admin/submissions"}
            href="/admin/submissions"
            className="w-full md:w-auto"
          >
            <TrendingUp className="h-3.5 w-3.5" />
            Submissions
          </DlesButton>
          {canManageSettings && (
            <DlesButton
              isActive={isSettingsTab}
              href="/admin/settings"
              className="w-full md:w-auto"
            >
              <Settings className="h-3.5 w-3.5" />
              Settings
            </DlesButton>
          )}
        </div>

        {children}
      </div>
    </main>
  );
}
