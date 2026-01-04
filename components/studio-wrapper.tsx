"use client";

import "@prisma/studio-core/ui/index.css";
import { ReactNode } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface StudioWrapperProps {
  children: ReactNode;
}

export default function StudioWrapper({ children }: StudioWrapperProps) {
  const handleExport = async () => {
    try {
      const res = await fetch("/api/games");
      const games = await res.json();
      const blob = new Blob([JSON.stringify(games, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `games-export-${
        new Date().toISOString().split("T")[0]
      }.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  return (
    <main className="min-h-screen px-4 py-8 md:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              Database Studio
            </h1>
            <p className="mt-2 text-muted-foreground">
              Inspect and manage the database directly.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8"
              onClick={handleExport}
            >
              <Download className="mr-1.5 h-4 w-4" />
              Export JSON
            </Button>
            <ThemeToggle />
          </div>
        </header>
        <div className="h-[calc(100vh-180px)] overflow-hidden rounded-lg border">
          {children}
        </div>
      </div>
    </main>
  );
}
