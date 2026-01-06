"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Flame } from "lucide-react";

interface HeaderStatsProps {
  playedCount: number;
  totalCount: number;
  currentStreak: number;
  onClear: () => void;
  isAuthenticated: boolean;
  isCompact?: boolean;
}

export function HeaderStats({
  playedCount,
  totalCount,
  currentStreak,
  onClear,
  isAuthenticated,
  isCompact = false,
}: HeaderStatsProps) {
  if (!isAuthenticated) return null;

  if (isCompact) {
    return (
      <div className="flex items-center gap-3 text-body-small text-muted-foreground whitespace-nowrap">
        {currentStreak > 0 && (
          <span className="flex items-center gap-1 text-orange-500">
            <Flame className="h-3.5 w-3.5 fill-current" />
            {currentStreak}
          </span>
        )}
        <span>
          {playedCount}/{totalCount}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 text-body font-medium">
      {currentStreak > 0 && (
        <span className="flex items-center gap-1.5 text-orange-500 bg-orange-500/5 px-2.5 py-0.5 rounded-full border border-orange-500/20">
          <Flame className="h-3.5 w-3.5 fill-current" />
          {currentStreak} <span className="hidden sm:inline">streak</span>
        </span>
      )}

      {currentStreak > 0 && (
        <span className="text-muted-foreground w-px h-4 bg-border hidden sm:block"></span>
      )}

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <button
            className="flex flex-col items-end sm:items-start group cursor-pointer hover:opacity-80 transition-opacity text-left"
            title="Reset Daily Progress"
          >
            <span className="text-foreground text-body group-hover:text-destructive transition-colors">
              {playedCount}/{totalCount} played
            </span>
            <div className="h-1.5 w-24 bg-secondary rounded-full overflow-hidden mt-1">
              <div
                className="h-full bg-primary transition-all group-hover:bg-destructive"
                style={{
                  width: `${(playedCount / Math.max(totalCount, 1)) * 100}%`,
                }}
              />
            </div>
          </button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset daily progress?</AlertDialogTitle>
            <AlertDialogDescription>
              This will unmark all games as played for today.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onClear}>Reset</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
