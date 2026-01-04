import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import type { Role } from "@/app/generated/prisma/client";

export async function getSession() {
  return await auth.api.getSession({
    headers: await headers(),
  });
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session?.user?.id) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
    },
  });

  return user;
}

export function canAccessAdmin(role: Role | undefined): boolean {
  if (!role) return false;
  return ["owner", "coowner", "admin"].includes(role);
}

export function canManageGames(role: Role | undefined): boolean {
  if (!role) return false;
  return ["owner", "coowner", "admin"].includes(role);
}

export function canManageUsers(role: Role | undefined): boolean {
  if (!role) return false;
  return ["owner", "coowner"].includes(role);
}

export function canChangeRole(
  currentUserRole: Role | undefined,
  targetRole: Role
): boolean {
  if (!currentUserRole) return false;

  // Owner can change any role
  if (currentUserRole === "owner") return true;

  // Co-owner can only change member and admin
  if (currentUserRole === "coowner") {
    return ["member", "admin"].includes(targetRole);
  }

  return false;
}

export function getAssignableRoles(currentUserRole: Role | undefined): Role[] {
  if (!currentUserRole) return [];

  if (currentUserRole === "owner") {
    return ["owner", "coowner", "admin", "member"];
  }

  if (currentUserRole === "coowner") {
    return ["admin", "member"];
  }

  return [];
}
