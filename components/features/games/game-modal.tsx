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
import {
  Loader2,
  ExternalLink,
  AlertTriangle,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ReactNode } from "react";

interface Game {
  id: string;
  title: string;
  link: string;
  topic: string;
}

interface GameModalProps {
  game: Game | null;
  playlist?: Game[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMarkPlayed: (id: string) => void;
  onMarkUnsupported: (id: string) => void;
  locked?: boolean;
  footer?: ReactNode;
}

const ZOOM_LEVELS = [0.5, 0.6, 0.7, 0.8, 0.9, 1.0];
const DEFAULT_ZOOM_INDEX = 3; // 0.8

export function GameModal({
  game: initialGame,
  playlist = [],
  open,
  onOpenChange,
  onMarkPlayed,
  onMarkUnsupported,
  locked = false,
  footer,
}: GameModalProps) {
  const [activeGame, setActiveGame] = useState<Game | null>(initialGame);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [zoomIndex, setZoomIndex] = useState(DEFAULT_ZOOM_INDEX);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const zoom = ZOOM_LEVELS[zoomIndex];

  // Sync activeGame when initialGame changes (e.g. opening a new game directly)
  useEffect(() => {
    setActiveGame(initialGame);
  }, [initialGame]);

  // Reset state when game changes
  useEffect(() => {
    if (activeGame) {
      setIsLoading(true);
      setHasError(false);
      setZoomIndex(DEFAULT_ZOOM_INDEX);
    }
  }, [activeGame?.id]);

  // Mark as played when modal opens or game changes
  useEffect(() => {
    if (open && activeGame) {
      onMarkPlayed(activeGame.id);
    }
  }, [open, activeGame?.id, onMarkPlayed]);

  const handleIframeLoad = useCallback(() => {
    setIsLoading(false);
  }, []);

  const handleOpenInNewTab = useCallback(() => {
    if (!activeGame) return;
    onMarkUnsupported(activeGame.id);
    window.open(activeGame.link, "_blank", "noopener,noreferrer");
    if (!playlist || playlist.length === 0) {
      onOpenChange(false);
    }
  }, [activeGame, onMarkUnsupported, onOpenChange, playlist]);

  const handleZoomIn = () => {
    if (zoomIndex < ZOOM_LEVELS.length - 1) {
      setZoomIndex(zoomIndex + 1);
    }
  };

  const handleZoomOut = () => {
    if (zoomIndex > 0) {
      setZoomIndex(zoomIndex - 1);
    }
  };

  const handleResetZoom = () => {
    setZoomIndex(DEFAULT_ZOOM_INDEX);
  };

  // Playlist Navigation
  const currentIndex =
    activeGame && playlist
      ? playlist.findIndex((g) => g.id === activeGame.id)
      : -1;
  const hasNext = currentIndex !== -1 && currentIndex < playlist!.length - 1;
  const hasPrev = currentIndex > 0;

  const playNext = () => {
    if (hasNext && playlist) {
      setActiveGame(playlist[currentIndex + 1]);
    }
  };

  const playPrev = () => {
    if (hasPrev && playlist) {
      setActiveGame(playlist[currentIndex - 1]);
    }
  };

  if (!activeGame) return null;

  // Calculate inverse scale for container sizing
  const containerScale = 1 / zoom;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-[95vw] sm:max-w-[95vw] h-[90vh] flex flex-col p-0 gap-0"
        showCloseButton={!locked}
        onInteractOutside={(e) => locked && e.preventDefault()}
        onEscapeKeyDown={(e) => locked && e.preventDefault()}
      >
        {/* Header */}
        <DialogHeader className="p-3 pb-2 border-b border-border shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              {/* Playlist Controls */}
              {playlist && playlist.length > 0 && (
                <div className="flex items-center gap-1 mr-2 border-r border-border/50 pr-2">
                  <DlesButton
                    variant="ghost"
                    size="icon-sm"
                    onClick={playPrev}
                    disabled={!hasPrev}
                    className="h-6 w-6"
                    title="Previous Game"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </DlesButton>
                  <DlesButton
                    variant="ghost"
                    size="icon-sm"
                    onClick={playNext}
                    disabled={!hasNext}
                    className="h-6 w-6"
                    title="Next Game"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </DlesButton>
                </div>
              )}

              <DialogTitle className="text-sm font-semibold truncate">
                {activeGame.title}
              </DialogTitle>
              <DlesBadge
                text={formatTopic(activeGame.topic)}
                color={activeGame.topic}
                size="sm"
              />
            </div>

            {/* Zoom Controls */}
            <TooltipProvider delayDuration={200}>
              <div className="flex items-center gap-1 shrink-0 mr-8">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DlesButton
                      variant="ghost"
                      size="icon-sm"
                      onClick={handleZoomOut}
                      disabled={zoomIndex === 0}
                      className="h-8 w-8"
                    >
                      <ZoomOut className="h-4 w-4" />
                    </DlesButton>
                  </TooltipTrigger>
                  <TooltipContent>Zoom Out</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <DlesButton
                      variant="ghost"
                      size="sm"
                      onClick={handleResetZoom}
                      className="h-8 px-2 text-xs font-mono min-w-12"
                    >
                      {Math.round(zoom * 100)}%
                    </DlesButton>
                  </TooltipTrigger>
                  <TooltipContent>Reset to 80%</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <DlesButton
                      variant="ghost"
                      size="icon-sm"
                      onClick={handleZoomIn}
                      disabled={zoomIndex === ZOOM_LEVELS.length - 1}
                      className="h-8 w-8"
                    >
                      <ZoomIn className="h-4 w-4" />
                    </DlesButton>
                  </TooltipTrigger>
                  <TooltipContent>Zoom In</TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
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

          {/* Iframe - scaled for zoom */}
          <div
            className="absolute inset-0 origin-top-left"
            style={{
              width: `${containerScale * 100}%`,
              height: `${containerScale * 100}%`,
              transform: `scale(${zoom})`,
            }}
          >
            <iframe
              ref={iframeRef}
              src={activeGame.link}
              title={activeGame.title}
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

        {/* Footer with fallback button or custom footer */}
        <div className="p-2 px-3 border-t border-border shrink-0 flex items-center justify-between gap-4">
          {footer ? (
            footer
          ) : (
            <>
              <span className="text-xs text-muted-foreground truncate">
                Not loading? Some sites don't allow embedding.
              </span>
              <DlesButton
                variant="outline"
                size="sm"
                onClick={handleOpenInNewTab}
                className="gap-1.5 text-xs whitespace-nowrap"
              >
                <ExternalLink className="h-3 w-3" />
                Open in New Tab
              </DlesButton>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
