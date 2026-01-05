"use client";

import { PageHeader } from "@/components/layout/page-header";
import { UserButton } from "@/components/layout/user-button";

interface ResultsHeaderProps {
  title?: string;
  subtitle?: string;
}

export function ResultsHeader({
  title = "Race Results",
  subtitle = "Match Summary",
}: ResultsHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <PageHeader title={title} subtitle={subtitle} backHref="/" />
      <UserButton />
    </div>
  );
}
