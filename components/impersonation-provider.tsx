"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import type { Role } from "@/app/generated/prisma/client";

interface CurrentUser {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: Role;
}

interface ImpersonationContextType {
  currentUser: CurrentUser | null;
  viewAsRole: Role | null;
  effectiveRole: Role | null;
  isActualOwner: boolean;
  setViewAsRole: (role: Role | null) => void;
  isLoading: boolean;
  canAccessAdmin: boolean;
  canManageGames: boolean;
  canManageUsers: boolean;
  refetchUser: () => Promise<void>;
}

const ImpersonationContext = createContext<ImpersonationContextType | null>(
  null
);

export function ImpersonationProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [viewAsRole, setViewAsRoleState] = useState<Role | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isActualOwner = currentUser?.role === "owner";
  const effectiveRole =
    isActualOwner && viewAsRole ? viewAsRole : currentUser?.role || null;

  const canAccessAdmin =
    !!effectiveRole && ["owner", "coowner", "admin"].includes(effectiveRole);
  const canManageGames =
    !!effectiveRole && ["owner", "coowner", "admin"].includes(effectiveRole);
  const canManageUsers =
    !!effectiveRole && ["owner", "coowner"].includes(effectiveRole);

  const fetchUser = async () => {
    try {
      const res = await fetch("/api/auth/current-user");
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data);
      } else {
        setCurrentUser(null);
      }
    } catch {
      setCurrentUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Load viewAsRole from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("viewAsRole");
    if (stored && ["owner", "coowner", "admin", "member"].includes(stored)) {
      setViewAsRoleState(stored as Role);
    }
    fetchUser();
  }, []);

  const setViewAsRole = (role: Role | null) => {
    setViewAsRoleState(role);
    if (role) {
      localStorage.setItem("viewAsRole", role);
    } else {
      localStorage.removeItem("viewAsRole");
    }
  };

  return (
    <ImpersonationContext.Provider
      value={{
        currentUser,
        viewAsRole,
        effectiveRole,
        isActualOwner,
        setViewAsRole,
        isLoading,
        canAccessAdmin,
        canManageGames,
        canManageUsers,
        refetchUser: fetchUser,
      }}
    >
      {children}
    </ImpersonationContext.Provider>
  );
}

export function useImpersonation() {
  const context = useContext(ImpersonationContext);
  if (!context) {
    throw new Error(
      "useImpersonation must be used within ImpersonationProvider"
    );
  }
  return context;
}
