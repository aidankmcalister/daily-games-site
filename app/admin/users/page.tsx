"use client";

import { UsersTab } from "@/components/admin/users-tab";
import { useImpersonation } from "@/components/impersonation-provider";

export default function AdminUsersPage() {
  const { canManageUsers } = useImpersonation();

  if (!canManageUsers) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        You do not have permission to view users.
      </div>
    );
  }

  return <UsersTab canManageUsers={canManageUsers} />;
}
