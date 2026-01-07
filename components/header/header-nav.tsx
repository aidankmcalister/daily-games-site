"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { DlesButton } from "@/components/design/dles-button";
import { Home, List, Flag, Trophy } from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  matchPaths?: string[];
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "Games",
    href: "/",
    icon: Home,
    matchPaths: ["/"],
  },
  {
    label: "Lists",
    href: "/lists",
    icon: List,
    matchPaths: ["/lists"],
  },
  {
    label: "Race",
    href: "/race/new",
    icon: Flag,
    matchPaths: ["/race"],
  },
  {
    label: "Stats",
    href: "/race/stats",
    icon: Trophy,
    matchPaths: ["/race/stats"],
  },
];

interface HeaderNavProps {
  className?: string;
}

export function HeaderNav({ className }: HeaderNavProps) {
  const pathname = usePathname();

  const isActive = (item: NavItem) => {
    if (item.matchPaths) {
      return item.matchPaths.some((path) => {
        if (path === "/") return pathname === "/";
        // For /race/stats, match exactly to avoid /race also matching
        if (path === "/race/stats") return pathname === "/race/stats";
        // For /race, exclude /race/stats
        if (path === "/race") {
          return (
            pathname.startsWith("/race") && !pathname.startsWith("/race/stats")
          );
        }
        return pathname.startsWith(path);
      });
    }
    return pathname === item.href;
  };

  return (
    <nav className={cn("flex items-center gap-1", className)}>
      {NAV_ITEMS.map((item) => {
        const active = isActive(item);
        const Icon = item.icon;

        return (
          <DlesButton
            key={item.href}
            href={item.href}
            variant={active ? "default" : "ghost"}
            size="sm"
            className={cn(
              "gap-2",
              active
                ? "bg-primary/10 text-primary border-primary/30 hover:bg-primary/15"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            <span className="hidden sm:inline">{item.label}</span>
          </DlesButton>
        );
      })}
    </nav>
  );
}
