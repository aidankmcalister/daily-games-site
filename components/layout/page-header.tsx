"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  backHref?: string; // Optional - if not provided, no back arrow shown
  children?: ReactNode; // For badges or other elements next to title
}

export function PageHeader({
  title,
  subtitle,
  backHref,
  children,
}: PageHeaderProps) {
  return (
    <header className="mb-8 border-b border-border pb-4">
      <div className="flex items-center gap-3 mb-1">
        {backHref && (
          <Link
            href={backHref}
            className="text-muted-foreground hover:text-primary transition-all group"
          >
            <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
          </Link>
        )}
        <h1 className="text-3xl font-bold tracking-tight text-foreground/90">
          {title}
        </h1>
        {children}
      </div>
      {subtitle && (
        <p className="text-muted-foreground text-sm font-medium">{subtitle}</p>
      )}
    </header>
  );
}
