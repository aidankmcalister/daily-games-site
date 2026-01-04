import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  getCurrentUser,
  canManageUsers,
  canChangeRole,
  getAssignableRoles,
} from "@/lib/auth-helpers";
import type { Role } from "@/app/generated/prisma/client";

export const dynamic = "force-dynamic";

// GET all users (only for coowner/owner)
export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !canManageUsers(currentUser.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        emailVerified: true,
        createdAt: true,
      },
    });
    return NextResponse.json(users);
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

// PATCH update user role (only for coowner/owner with restrictions)
export async function PATCH(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !canManageUsers(currentUser.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { userId, role } = body as { userId: string; role: Role };

    if (!userId || !role) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if current user can assign this role
    const assignableRoles = getAssignableRoles(currentUser.role);
    if (!assignableRoles.includes(role)) {
      return NextResponse.json(
        { error: "You cannot assign this role" },
        { status: 403 }
      );
    }

    // Get target user to check their current role
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if current user can change this user's role
    if (!canChangeRole(currentUser.role, targetUser.role)) {
      return NextResponse.json(
        { error: "You cannot modify this user's role" },
        { status: 403 }
      );
    }

    // Prevent demoting yourself if you're the owner
    if (
      userId === currentUser.id &&
      currentUser.role === "owner" &&
      role !== "owner"
    ) {
      return NextResponse.json(
        { error: "Owner cannot demote themselves" },
        { status: 403 }
      );
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { role },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("Failed to update user role:", error);
    return NextResponse.json(
      { error: "Failed to update user role" },
      { status: 500 }
    );
  }
}

// DELETE user (owner can delete all except owner, coowner can delete admin/member, admin can delete member)
export async function DELETE(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    // Can't delete yourself
    if (userId === currentUser.id) {
      return NextResponse.json(
        { error: "Cannot delete yourself" },
        { status: 403 }
      );
    }

    // Get target user
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, name: true },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check delete permissions
    const canDelete = (() => {
      // Owner can delete everyone except other owners
      if (currentUser.role === "owner") {
        return targetUser.role !== "owner";
      }
      // Co-owner can delete admin and member
      if (currentUser.role === "coowner") {
        return ["admin", "member"].includes(targetUser.role);
      }
      // Admin can only delete member
      if (currentUser.role === "admin") {
        return targetUser.role === "member";
      }
      return false;
    })();

    if (!canDelete) {
      return NextResponse.json(
        { error: "You cannot delete this user" },
        { status: 403 }
      );
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete user:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
