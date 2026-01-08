"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DlesBadge } from "@/components/design/dles-badge";
import { DlesButton } from "@/components/design/dles-button";
import { formatTopic, cn } from "@/lib/utils";
import { Loader2, ExternalLink, AlertTriangle } from "lucide-react";

interface GameModalProps {
  game: {
    id: string;
    title: string;
    link: string;
    topic: string;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMarkPlayed: (id: string) => void;
  onMarkUnsupported: (id: string) => void;
}

export function GameModal({
  game,
  open,
  onOpenChange,
  onMarkPlayed,
  onMarkUnsupported,
}: GameModalProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Reset state when game changes
  useEffect(() => {
    if (game) {
      setIsLoading(true);
      setHasError(false);
    }
  }, [game?.id]);

  // Mark as played when modal opens
  useEffect(() => {
    if (open && game) {
      onMarkPlayed(game.id);
    }
  }, [open, game?.id]);

  const handleIframeLoad = useCallback(() => {
    setIsLoading(false);

    // Try to detect X-Frame-Options/CSP blocks
    // When blocked, trying to access iframe's contentWindow properties throws
    // or returns null/inaccessible content
    try {
      const iframe = iframeRef.current;
      if (iframe) {
        // This will throw for cross-origin blocked iframes
        // but we can at least check if something loaded
        const contentWindow = iframe.contentWindow;

        // If we get here but the iframe is blocked by X-Frame-Options,
        // the browser shows its own error page. We can't detect this directly,
        // so we give users the fallback button in the footer.
      }
    } catch {
      // Cross-origin access denied is expected for most sites
      // This doesn't mean it's blocked, just that we can't inspect it
    }
  }, []);

  const handleOpenInNewTab = useCallback(() => {
    if (!game) return;

    // Mark as unsupported in the database
    onMarkUnsupported(game.id);

    // Open in new tab
    window.open(game.link, "_blank", "noopener,noreferrer");

    // Close the modal
    onOpenChange(false);
  }, [game, onMarkUnsupported, onOpenChange]);

  if (!game) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-[95vw] sm:max-w-[95vw] h-[90vh] flex flex-col p-0 gap-0"
        showCloseButton={true}
      >
        {/* Header */}
        <DialogHeader className="p-3 pb-2 border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            <DlesBadge
              text={formatTopic(game.topic)}
              color={game.topic}
              size="sm"
            />
            <DialogTitle className="text-sm font-semibold truncate">
              {game.title}
            </DialogTitle>
          </div>
        </DialogHeader>

        {/* Iframe Container */}
        <div className="flex-1 relative bg-muted/30 overflow-hidden">
          {/* Loading Spinner */}
          {isLoading && !hasError && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Loading game...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {hasError && (
            <div className="absolute inset-0 flex items-center justify-center bg-background z-10">
              <div className="flex flex-col items-center gap-4 text-center p-6">
                <div className="h-12 w-12 rounded-full bg-amber-500/10 flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-amber-500" />
                </div>
                <div>
                  <h3 className="font-semibold">Unable to embed this game</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    This site doesn't allow embedding. Open it in a new tab
                    instead.
                  </p>
                </div>
                <DlesButton onClick={handleOpenInNewTab} className="gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Open in New Tab
                </DlesButton>
              </div>
            </div>
          )}

          {/* Iframe - scaled down for zoomed-out appearance */}
          <div
            className="absolute inset-0 origin-top-left"
            style={{
              width: "125%",
              height: "125%",
              transform: "scale(0.8)",
            }}
          >
            <iframe
              src={game.link}
              title={game.title}
              className={cn(
                "w-full h-full border-0",
                (isLoading || hasError) && "invisible"
              )}
              onLoad={handleIframeLoad}
              onError={() => setHasError(true)}
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          </div>
        </div>

        {/* Footer with fallback button - more prominent for blocked sites */}
        <div className="p-2 px-3 border-t border-border shrink-0 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            Not loading? Some sites don't allow embedding.
          </span>
          <DlesButton
            variant="outline"
            size="sm"
            onClick={handleOpenInNewTab}
            className="gap-1.5 text-xs"
          >
            <ExternalLink className="h-3 w-3" />
            Open in New Tab
          </DlesButton>
        </div>
      </DialogContent>
    </Dialog>
  );
}
