"use client";

import { usePathname } from "next/navigation";
import { SiteHeader } from "@/components/layout/site-header";

/**
 * Routes that should NOT show the global header.
 * These pages have their own specialized headers or layouts.
 */
const EXCLUDED_ROUTES: string[] = [];

/**
 * Page title mappings based on route patterns.
 * If no match, header shows without a page title (just logo).
 */
const PAGE_TITLES: Record<string, string> = {
  "/lists": "Lists",
  "/race/stats": "Race Stats",
  "/race/new": "Start a Race",
  "/dashboard": "Dashboard",
  "/dashboard/races": "Race History",
  "/admin": "Admin",
  "/submit": "Submit a Game",
};

/**
 * Client layout wrapper that conditionally renders the SiteHeader
 * based on the current pathname.
 */
export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Check if we should hide the header entirely
  const hideHeader =
    EXCLUDED_ROUTES.some(
      (route) => pathname === route || pathname.startsWith(route + "/")
    ) || !!pathname.match(/^\/race\/[^/]+$/);

  // Determine page title based on route
  const getPageTitle = () => {
    // Exact match first
    if (PAGE_TITLES[pathname]) {
      return PAGE_TITLES[pathname];
    }

    // Check for prefix matches (for nested routes like /admin/*)
    for (const [route, title] of Object.entries(PAGE_TITLES)) {
      if (pathname.startsWith(route + "/")) {
        return title;
      }
    }

    // Home page or unknown routes - no title
    if (pathname === "/") {
      return undefined;
    }

    // For race results pages, show "Race Results"
    if (pathname.match(/^\/race\/[^/]+\/results$/)) {
      return "Race Results";
    }

    // For race lobby/active pages, no extra title
    if (pathname.startsWith("/race/")) {
      return undefined;
    }

    return undefined;
  };

  // Determine if we should show navigation
  const shouldShowNav = () => {
    // Hide nav on active race page (split screen)
    // Matches /race/[id] but not /race/[id]/lobby or /race/[id]/results
    if (pathname.match(/^\/race\/[^/]+$/)) {
      return false;
    }
    return true;
  };

  return (
    <>
      {!hideHeader && (
        <SiteHeader pageTitle={getPageTitle()} showNav={shouldShowNav()} />
      )}
      <main id="main-content">{children}</main>
    </>
  );
}
