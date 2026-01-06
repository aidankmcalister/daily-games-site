"use client";

import { ReactNode } from "react";
import { Logo } from "@/components/design/logo";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  backHref?: string; // Optional - if provided, logo links there
  children?: ReactNode; // For badges or other elements next to title
}

export function PageHeader({
  title,
  subtitle,
  backHref,
  children,
}: PageHeaderProps) {
  return (
    <header className="mb-8 pb-4">
      <div className="flex items-center gap-2 mb-1">
        {backHref && (
          <>
            <Logo size="md" href={backHref} />
            <span className="text-muted-foreground/40 font-mono text-3xl">
              /
            </span>
          </>
        )}
        <h1 className="text-heading-page text-foreground/90">{title}</h1>
        {children}
      </div>
      {subtitle && (
        <p className="text-muted-foreground text-sm font-medium">{subtitle}</p>
      )}
    </header>
  );
}
