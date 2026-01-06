"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Clipboard } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Race } from "@/app/race/[id]/page";

interface InviteLinkProps {
  race: Race;
}

export function InviteLink({ race }: InviteLinkProps) {
  const [showLink, setShowLink] = useState(false);
  const [windowHref, setWindowHref] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setWindowHref(window.location.href);
    }
  }, []);

  const copyLink = () => {
    navigator.clipboard.writeText(windowHref);
    toast.success("Link copied to clipboard!");
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-micro text-muted-foreground/60">
          Race Invite Link
        </Label>
        <Badge
          variant="secondary"
          className={cn(
            "text-micro-xs px-2 py-0.5 border-none",
            race.status === "waiting"
              ? "bg-amber-400/10 text-amber-400"
              : "bg-emerald-400/10 text-emerald-400"
          )}
        >
          {race.participants.length}/2 Players
        </Badge>
      </div>

      <div className="flex gap-2 p-1.5 rounded-xl border border-border/50 bg-muted/20">
        <div className="min-w-0 flex-1 h-10 px-3 rounded-lg border border-border/50 bg-background font-mono text-[11px] overflow-hidden flex items-center transition-colors">
          <span className="truncate text-muted-foreground">
            {showLink ? windowHref : "••••••••••••••••••••••••"}
          </span>
        </div>
        <div className="flex gap-1.5">
          <Button
            variant="outline"
            onClick={() => setShowLink(!showLink)}
            className="shrink-0 h-10 w-10 p-0 bg-background hover:bg-muted border-border/50"
            size="icon"
          >
            {showLink ? (
              <EyeOff className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Eye className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
          <Button
            variant="outline"
            onClick={copyLink}
            className="shrink-0 h-10 w-10 p-0 bg-background hover:bg-muted border-border/50"
            size="icon"
          >
            <Clipboard className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>
      </div>
    </div>
  );
}
