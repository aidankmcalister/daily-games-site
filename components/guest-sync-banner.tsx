"use client";

import { signIn } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { LogIn, X } from "lucide-react";
import { useState } from "react";

export function GuestSyncBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="relative flex items-center justify-between gap-4 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">
          Sign in to create custom lists, save your race history, and more!
        </span>
        <Button
          size="sm"
          variant="outline"
          className="h-7 gap-1.5"
          onClick={() => signIn.social({ provider: "google" })}
        >
          <LogIn className="h-3.5 w-3.5" />
          Sign in
        </Button>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
