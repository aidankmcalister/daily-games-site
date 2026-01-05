"use client";

import { Button } from "@/components/ui/button";
import { DlesButton } from "@/components/design/dles-button";
import { Badge } from "@/components/ui/badge";

interface MobileRaceBarProps {
  selectedCount: number;
  firstGameTitle: string;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export function MobileRaceBar({
  selectedCount,
  firstGameTitle,
  onSubmit,
  isSubmitting,
}: MobileRaceBarProps) {
  if (selectedCount === 0 || isSubmitting) return null;

  return (
    <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4 animate-in slide-in-from-bottom-8 duration-500">
      <div className="bg-card border border-border rounded-xl p-3 shadow-2xl flex items-center justify-between gap-3 overflow-hidden ring-1 ring-primary/10 font-bold">
        <div className="flex items-center gap-2 px-1 text-[10px]">
          <Badge className="font-black rounded-sm px-1 py-0 bg-primary text-primary-foreground h-4">
            {selectedCount}
          </Badge>
          <span className="truncate max-w-[100px]">{firstGameTitle}...</span>
        </div>
        <DlesButton
          size="sm"
          className="h-8 px-4 font-black uppercase text-[9px] tracking-widest rounded-lg"
          onClick={onSubmit}
          disabled={isSubmitting}
        >
          CREATE
        </DlesButton>
      </div>
    </div>
  );
}
