"use client";

import { usePathname } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { UserButton } from "@/components/layout/user-button";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Lists has its own layout, so we only show header for main dashboard
  const isListsPage = pathname.startsWith("/dashboard/lists");

  if (isListsPage) {
    return <>{children}</>;
  }

  return (
    <main className="min-h-screen px-4 py-8 md:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-start justify-between">
          <PageHeader
            title="Dashboard"
            subtitle="Your stats and race history."
            backHref="/"
          />
          <UserButton />
        </div>

        {children}
      </div>
    </main>
  );
}
