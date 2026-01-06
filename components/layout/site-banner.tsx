"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Megaphone, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { DlesButton } from "@/components/design/dles-button";
import { useSettings } from "@/components/settings-provider";

export function SiteBanner() {
  const { settings } = useSettings();
  const [isVisible, setIsVisible] = useState(true);

  // Check persisted visibility on mount
  useEffect(() => {
    if (typeof window !== "undefined" && settings?.welcomeMessage) {
      const dismissedMessage = localStorage.getItem("dismissedWelcomeMessage");
      if (dismissedMessage === settings.welcomeMessage) {
        setIsVisible(false);
      }
    }
  }, [settings?.welcomeMessage]);

  if (!settings || !isVisible) return null;

  const isMaintenance = settings.maintenanceMode;
  const showWelcome = settings.showWelcomeMessage && settings.welcomeMessage;

  if (!isMaintenance && !showWelcome) return null;

  const handleDismiss = () => {
    setIsVisible(false);
    if (!isMaintenance && settings.welcomeMessage) {
      localStorage.setItem("dismissedWelcomeMessage", settings.welcomeMessage);
    }
  };

  return (
    <div
      className={cn(
        "relative w-full py-2 px-4 flex items-center justify-center text-xs font-bold uppercase tracking-wider transition-all group overflow-hidden border-b border-border/40",
        isMaintenance
          ? "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
          : "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
      )}
    >
      {isMaintenance && (
        <div
          className="absolute inset-0 opacity-[0.08] pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(45deg, currentColor 25%, transparent 25%, transparent 50%, currentColor 50%, currentColor 75%, transparent 75%, transparent)`,
            backgroundSize: "40px 40px",
          }}
        />
      )}
      <div className="flex items-center gap-3 max-w-4xl mx-auto pr-8">
        {isMaintenance ? (
          <AlertCircle className="h-4 w-4 shrink-0 animate-pulse" />
        ) : (
          <Megaphone className="h-4 w-4 shrink-0" />
        )}
        <p className="text-center">
          {isMaintenance ? (
            <span className="flex flex-col sm:flex-row sm:gap-2 items-center">
              <strong className="uppercase tracking-wider">
                Maintenance Mode:
              </strong>
              <span>
                The site is currently undergoing maintenance. Play tracking may
                be disabled.
              </span>
            </span>
          ) : (
            settings.welcomeMessage
          )}
        </p>
      </div>

      {!isMaintenance && (
        <DlesButton
          variant="ghost"
          size="icon-sm"
          className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 text-indigo-800/60 hover:text-indigo-800 hover:bg-indigo-500/10 dark:text-indigo-300/60 dark:hover:text-indigo-300"
          onClick={handleDismiss}
        >
          <X className="h-4 w-4" />
        </DlesButton>
      )}
    </div>
  );
}
