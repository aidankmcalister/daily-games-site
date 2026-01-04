"use client";

import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { BarChart3, List } from "lucide-react";
import Link from "next/link";
import { UserButton } from "@/components/user-button";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isStatsTab =
    pathname === "/dashboard" || pathname === "/dashboard/stats";
  const isListsTab = pathname === "/dashboard/lists";

  return (
    <main className="min-h-screen px-4 py-8 md:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-start justify-between">
          <PageHeader
            title="Your Dashboard"
            subtitle="Track your daily games progress"
            backHref="/"
          />
          <UserButton />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <Link href="/dashboard">
            <Button
              variant={isStatsTab ? "default" : "outline"}
              className="gap-2"
            >
              <BarChart3 className="h-4 w-4" />
              Stats
            </Button>
          </Link>
          <Link href="/dashboard/lists">
            <Button
              variant={isListsTab ? "default" : "outline"}
              className="gap-2"
            >
              <List className="h-4 w-4" />
              Lists
            </Button>
          </Link>
        </div>

        {children}
      </div>
    </main>
  );
}
