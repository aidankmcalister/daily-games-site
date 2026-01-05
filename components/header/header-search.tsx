"use client";

import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeaderSearchProps {
  query: string;
  onChange: (query: string) => void;
  className?: string;
  id?: string;
  showKbd?: boolean;
}

export function HeaderSearch({
  query,
  onChange,
  className,
  id,
  showKbd = false,
}: HeaderSearchProps) {
  return (
    <div className={cn("relative group", className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none" />
      <Input
        id={id}
        placeholder="Search..."
        value={query}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 pl-9 pr-8 text-sm bg-background/50 focus:bg-background w-full"
      />
      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
        {query && (
          <button
            onClick={() => onChange("")}
            className="text-muted-foreground hover:text-foreground p-0.5"
          >
            <X className="h-3 w-3" />
          </button>
        )}
        {showKbd && (
          <kbd className="hidden sm:inline-flex h-4 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
            <span className="text-xs">/</span>
          </kbd>
        )}
      </div>
    </div>
  );
}
