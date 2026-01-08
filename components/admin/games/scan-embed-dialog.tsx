"use client";

import { useState, useCallback } from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { DlesButton } from "@/components/design/dles-button";
import { Scan, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

interface ScanEmbedDialogProps {
  onScanComplete: () => void;
}

interface Game {
  id: string;
  title: string;
  link: string;
  embedSupported: boolean;
}

export function ScanEmbedDialog({ onScanComplete }: ScanEmbedDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stats, setStats] = useState<{
    total: number;
    blocked: number;
    allowed: number;
    errors: number;
  } | null>(null);

  const handleScan = useCallback(async () => {
    setIsScanning(true);
    setProgress(0);

    try {
      // First, fetch all games
      const gamesRes = await fetch(
        "/api/games?limit=1000&includeArchived=false"
      );
      const gamesData = await gamesRes.json();
      const games: Game[] = gamesData.items || [];

      if (games.length === 0) {
        toast.error("No games to scan");
        setIsScanning(false);
        return;
      }

      setStats({ total: games.length, blocked: 0, allowed: 0, errors: 0 });

      let blocked = 0;
      let allowed = 0;
      let errors = 0;

      // Check each game individually
      for (let i = 0; i < games.length; i++) {
        const game = games[i];

        try {
          // Check the game URL headers via a proxy endpoint
          const checkRes = await fetch(
            `/api/admin/games/check-embed/${game.id}`,
            {
              method: "POST",
            }
          );

          if (checkRes.ok) {
            const result = await checkRes.json();
            if (result.blocked) {
              blocked++;
            } else {
              allowed++;
            }
          } else {
            errors++;
          }
        } catch {
          errors++;
        }

        setStats({ total: games.length, blocked, allowed, errors });
        setProgress(Math.round(((i + 1) / games.length) * 100));
      }

      toast.success(`Scan complete: ${blocked} blocked, ${allowed} allowed`);
      onScanComplete();
      setIsScanning(false);
    } catch (error) {
      toast.error("Failed to start scan");
      setIsScanning(false);
    }
  }, [onScanComplete]);

  const resetState = () => {
    setIsScanning(false);
    setProgress(0);
    setStats(null);
  };

  return (
    <AlertDialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!isScanning) {
          setIsOpen(open);
          if (!open) resetState();
        }
      }}
    >
      <AlertDialogTrigger asChild>
        <DlesButton variant="outline" size="sm" className="gap-1.5">
          <Scan className="h-3.5 w-3.5" />
          Scan Embed
        </DlesButton>
      </AlertDialogTrigger>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Scan Embed Support</AlertDialogTitle>
          <AlertDialogDescription>
            Check all game URLs for X-Frame-Options and CSP headers to determine
            which games can be embedded in iframes.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 py-4">
          {!isScanning && !stats ? (
            <p className="text-sm text-muted-foreground">
              This will check each game URL and update the database with iframe
              compatibility status. Games that block embedding will open in a
              new tab instead of the modal.
            </p>
          ) : (
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Progress</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              {stats && (
                <div className="grid grid-cols-4 gap-3 text-center">
                  <div className="bg-muted/30 p-3 rounded-md">
                    <div className="text-xl font-mono font-bold">
                      {stats.total}
                    </div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
                      Total
                    </div>
                  </div>
                  <div className="bg-green-500/10 p-3 rounded-md border border-green-500/20">
                    <div className="text-xl font-mono font-bold text-green-500">
                      {stats.allowed}
                    </div>
                    <div className="text-[10px] text-green-600/80 uppercase tracking-wider">
                      Allowed
                    </div>
                  </div>
                  <div className="bg-amber-500/10 p-3 rounded-md border border-amber-500/20">
                    <div className="text-xl font-mono font-bold text-amber-500">
                      {stats.blocked}
                    </div>
                    <div className="text-[10px] text-amber-600/80 uppercase tracking-wider">
                      Blocked
                    </div>
                  </div>
                  <div className="bg-destructive/10 p-3 rounded-md border border-destructive/20">
                    <div className="text-xl font-mono font-bold text-destructive">
                      {stats.errors}
                    </div>
                    <div className="text-[10px] text-destructive/80 uppercase tracking-wider">
                      Errors
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <AlertDialogFooter>
          {!isScanning && (
            <AlertDialogCancel onClick={() => setIsOpen(false)}>
              {stats ? "Close" : "Cancel"}
            </AlertDialogCancel>
          )}

          {!stats && (
            <DlesButton onClick={handleScan} disabled={isScanning}>
              {isScanning ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Scanning...
                </>
              ) : (
                "Start Scan"
              )}
            </DlesButton>
          )}

          {stats && !isScanning && (
            <DlesButton
              onClick={() => {
                setIsOpen(false);
                resetState();
              }}
            >
              Done
            </DlesButton>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
