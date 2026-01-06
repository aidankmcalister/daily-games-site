"use client";

import { signIn } from "@/lib/auth-client";
import { DlesButton } from "@/components/design/dles-button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Lock } from "lucide-react";

export function GuestSyncBanner() {
  return (
    <Card className="hidden sm:block rounded-lg border border-primary/10 bg-primary/5 p-2">
      <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-0">
        <div className="flex items-center gap-3 px-1">
          <Lock className="h-4 w-4 text-primary shrink-0" />
          <span className="text-body text-muted-foreground leading-tight">
            Sign in to save race history & create custom lists.
          </span>
        </div>

        <DlesButton
          size="sm"
          variant="outline"
          className="w-full sm:w-auto h-9 gap-2 text-xs font-semibold bg-background hover:bg-muted border-primary/20 hover:border-primary/50 text-foreground transition-all group"
          onClick={() => signIn.social({ provider: "google" })}
        >
          Continue with Google
          <ArrowRight className="h-3.5 w-3.5 opacity-50 group-hover:translate-x-0.5 group-hover:opacity-100 transition-all" />
        </DlesButton>
      </CardContent>
    </Card>
  );
}
