"use client";

import { signIn } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, LogIn } from "lucide-react";

export function GuestSyncBanner() {
  return (
    <Card className="rounded-lg border border-primary/20 bg-primary/5 p-3">
      <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4 p-0">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <LogIn className="h-4 w-4" />
          <span>Sign in to save history & create lists.</span>
        </div>

        <Button
          size="sm"
          variant="outline"
          className="h-8 gap-2 text-xs w-full sm:w-auto font-medium border-primary/20 bg-background/50 hover:bg-primary/10 hover:border-primary/50 transition-all group"
          onClick={() => signIn.social({ provider: "google" })}
        >
          Continue with Google
          <ArrowRight className="h-3.5 w-3.5 opacity-50 group-hover:translate-x-0.5 group-hover:opacity-100 transition-all" />
        </Button>
      </CardContent>
    </Card>
  );
}
