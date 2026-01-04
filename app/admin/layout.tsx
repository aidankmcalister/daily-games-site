"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useImpersonation } from "@/components/impersonation-provider";
import { AdminHeader } from "@/components/admin/admin-header";
import { Gamepad2, Users, Loader2, Shield } from "lucide-react";
import Link from "next/link";

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
        <Link href="/">
          <Button>Go Home</Button>
        </Link>
      </main>
    );
  }

  const isGamesTab = pathname === "/admin/games";
  const isUsersTab = pathname === "/admin/users";

  return (
    <main className="min-h-screen px-4 py-8 md:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <AdminHeader canManageUsers={canManageUsers} />

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <Link href="/admin/games">
            <Button
              variant={isGamesTab ? "default" : "outline"}
              className="gap-2"
            >
              <Gamepad2 className="h-4 w-4" />
              Games
            </Button>
          </Link>
          {canManageUsers && (
            <Link href="/admin/users">
              <Button
                variant={isUsersTab ? "default" : "outline"}
                className="gap-2"
              >
                <Users className="h-4 w-4" />
                Users
              </Button>
            </Link>
          )}
        </div>

        {children}
      </div>
    </main>
  );
}
