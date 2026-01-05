"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DlesButton } from "@/components/design/dles-button";
import { Badge } from "@/components/ui/badge";
import { MicroLabel } from "@/components/design/micro-label";
import { Link, Eye, EyeOff, Clipboard } from "lucide-react";
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
    <Card className="border border-border shadow-none bg-card">
      <CardHeader className="border-b border-border">
        <CardTitle className="text-sm font-bold flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MicroLabel className="w-6 h-6 rounded-md bg-muted text-muted-foreground flex items-center justify-center p-0">
              <Link className="h-3.5 w-3.5" />
            </MicroLabel>
            Invite Link
          </div>
          <Badge
            variant="secondary"
            className={cn(
              "text-[9px] font-black uppercase tracking-widest px-3 py-1 border-none",
              race.status === "waiting"
                ? "bg-amber-400/10 text-amber-400"
                : "bg-emerald-400/10 text-emerald-400"
            )}
          >
            {race.participants.length}/2 Players
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex gap-2">
          <div className="min-w-0 flex-1 h-10 px-3 rounded-lg border border-border bg-muted font-mono text-[11px] overflow-hidden flex items-center">
            <span className="truncate">
              {showLink ? windowHref : "••••••••••••••••••••••••"}
            </span>
          </div>
          <DlesButton
            variant="outline"
            onClick={() => setShowLink(!showLink)}
            className="shrink-0 h-10 w-10 p-0"
            size="icon"
          >
            {showLink ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </DlesButton>
          <DlesButton
            variant="outline"
            onClick={copyLink}
            className="shrink-0 h-10 w-10 p-0"
            size="icon"
          >
            <Clipboard className="h-4 w-4" />
          </DlesButton>
        </div>
      </CardContent>
    </Card>
  );
}
